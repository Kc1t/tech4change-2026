# Documentação técnica — Eilo

Tech4Change 2026 · FIAP PosTech · Grupo 24. Este documento detalha o que o [README](../README.md)
resume: o motor de dica, os contratos entre as aplicações, o modelo de dados e os limites do
protótipo.

---

## 1. O problema, em termos de sistema

Anomia é falha de **acesso**, não de armazenamento. O alvo existe na memória da pessoa; a rota até
ele é que se rompeu. Isso muda o desenho de forma direta:

- O sistema não precisa saber a palavra melhor que ela — precisa **encurtar a busca**.
- A palavra que trava é quase sempre **nome próprio** ligado à vida dela. Nenhum modelo de linguagem
  tem essa informação, porque ela nunca esteve na internet.
- Entregar a resposta pronta prejudica a retenção. O que ajuda é o esforço que termina em acerto.

Daí as três decisões que estruturam o código: **o conhecimento fica num grafo pessoal no aparelho**,
**o modelo ordena mas não escreve**, e **a ajuda recua conforme a pessoa melhora**.

---

## 2. Aplicações

Quatro aplicações independentes, sem monorepo. Cada uma tem `package.json`, `node_modules` e deploy
próprios. A raiz não tem `package.json`.

| Aplicação | Stack | Porta | Papel |
|---|---|---|---|
| `web/` | Next 16 (App Router, Turbopack), React 19, Zustand, Tailwind v4, PWA | 3010 | alvo principal — roda o grafo, o motor e as sete telas |
| `server/` | NestJS 11, Prisma, PostgreSQL, Zod, Swagger, SSE | 3333 | reordenação por modelo, auditoria, agregação clínica, sessão entre aparelhos |
| `mobile/` | React Native 0.86 via Expo SDK 57, Reanimated 4 | 8081 | mesmo motor, aparelho real, vibração e voz nativas |
| `landing/` | Next 16, React 19, Tailwind v4, Radix | 5174 | página pública |
| `watch/` | Kotlin, Wear OS | — | prova de conceito, **nunca compilada** |
| `ingest/` | Python, InsightFace, Whisper, EXIF | — | pipeline offline que produz o grafo |

`web/src/domain/` e `mobile/src/domain/` são o **mesmo código**, copiado sem adaptação: só import
relativo, nenhuma dependência de plataforma. O motor de dica é idêntico nos dois.

---

## 3. O motor de dica

Quatro etapas. Só a segunda usa modelo.

```
        toque na tela  /  pausa detectada no microfone
                          ▼
[web] 1. candidatos  ── propagação de ativação no grafo, local, alvo 300 ms
                          │  a primeira escada já vai para a tela aqui
                          ▼
[api] 2. reordenação ── modelo recebe o recorte e devolve SÓ identificadores
                          ▼
[api] 3. validação   ── cada degrau tem de citar uma aresta existente
                          │  degrau inválido → resposta inteira rejeitada
                          ▼
[web] 4. montagem    ── o texto do degrau sai do grafo, não do modelo
                          ▼
     vibração no pulso · voz no fone · palavra na tela
```

### 3.1 Candidatos

Propagação de ativação no grafo a partir dos nós recentes e dos termos reconhecidos no rodeio, mais
casamento textual e prior de recência. Roda **local, sem rede**, com alvo de 300 ms. A primeira
escada aparece na tela antes de qualquer chamada — o que garante que a experiência nunca depende da
latência do modelo.

### 3.2 Reordenação

O backend recebe o recorte de candidatos e chama o modelo com **saída estruturada**. A resposta é
uma lista de identificadores de nó e de aresta. Nunca texto livre, nunca um nome próprio — nem na
ida nem na volta.

Tempo limite de **2,5 s**. O endpoint é configurável por `MODEL_BASE_URL`, então trocar de provedor
é mudar variável de ambiente, não código.

### 3.3 Validação

Cada degrau proposto precisa citar uma aresta que **existe no grafo** e conecta o nó alvo. Se um
único degrau falhar, a resposta inteira é rejeitada e o sistema cai na escada determinística.

É isto que impede o sistema de inventar uma parente: não é instrução de prompt, é verificação sobre
a estrutura, com teste automatizado em `server/test`.

### 3.4 Montagem

O texto de cada degrau sai dos atributos do nó no grafo, não da saída do modelo. A pista sonora é
recorte de string sobre a separação silábica calculada no aparelho e **nunca passa pelo modelo**.

### 3.5 Portão de confiança

A pista sonora só é emitida acima de `PHONOLOGICAL_CONFIDENCE_GATE`. Abaixo dele a escada para no
degrau semântico.

O motivo é clínico: errar no semântico é barato e reversível — a pessoa descarta a pista e continua.
Já uma pista fonêmica errada pode induzir perseveração e **bloquear o alvo correto**.

### 3.6 Caminho de segurança

Validação falhou, modelo demorou, banco caiu ou não há chave de API: cai na escada determinística
montada dos atributos do nó. Não existe estado de erro visível para quem usa, e o produto inteiro
funciona sem nenhuma credencial de modelo.

---

## 4. Privacidade

O backend nunca vê a palavra.

O que sobe é uma **projeção** do grafo: identificador opaco, tipo do nó, quais chaves de atributo
existem e arestas com peso. Rótulo, apelido, texto do degrau e separação silábica ficam no
dispositivo.

O schema de entrada (Zod) **recusa** qualquer coisa que não seja identificador opaco: uma requisição
que carregue um nome próprio volta `400`. A barreira está no contrato, não na boa vontade do cliente.

---

## 5. Dados

| Onde | O quê |
|---|---|
| `web/src/data/graph.json` | o grafo da vida, versionado no aparelho |
| `localStorage` | estado de aprendizado — degrau inicial por alvo, histórico de acertos |
| PostgreSQL (Prisma) | `AuditEvent`, `CuePlanCache`, `ConsentRecord` |

**Nenhuma tabela guarda palavra.** O alvo é sempre identificador opaco. O backend opera degradado,
em memória, se o banco cair.

O grafo é um grafo de verdade — nós de pessoa, lugar, objeto e história, com arestas tipadas e peso —
guardado como JSON porque neste porte isso é mais rápido e mantém tudo no aparelho. Em escala, o
caminho é `Oracle 23ai` com SQL/PGQ e busca vetorial dentro do próprio banco.

---

## 6. Telas

| Tela | O que faz |
|---|---|
| **Momento** (`/`) | a home: o que foi ouvido em cima, a palavra esperada no centro, campo de aurora que ondula com o microfone |
| **Grafo** (`/graph`) | duas abas — *Mapa*, o grafo com ícone por tipo de nó, e *Memórias*, o que sustenta cada ligação |
| **Clínico** (`/clinical`) | degrau médio por semana e por alvo, para o fonoaudiólogo |
| **Aparelhos** (`/body`) | canais de saída, discrição, intensidade, sessão entre dois aparelhos |
| **Consentimento** (`/consent`) | pictogramas, áudio e frases curtas, para a própria pessoa autorizar |
| **Revisão** (`/review`) | a família confirma cada identidade e cada relação propostas pela ingestão |
| **Relógio** (`/watch`) | interface redonda, pareia por código de quatro dígitos |

Tocar um nó no Grafo abre a folha com **de onde veio cada ligação** — foto, áudio, conversa ou
confirmação da família. A proveniência fica visível para quem usa, não só para quem programou.

---

## 7. Ingestão do grafo

Roda **offline**, no computador, e produz `web/src/data/graph.json`.

```bash
cd ingest
pip install -r requirements.txt
python ingest.py --input input/ --owner Helena
```

| Etapa | Técnica |
|---|---|
| Detecção e embedding de rostos | InsightFace |
| Agrupamento em pessoas | HDBSCAN quando instalado; senão aglomerativo por cosseno em numpy — **o pipeline imprime qual usou** |
| Transcrição dos áudios da família | Whisper, pt-BR, com timestamp por trecho |
| Lugar e data | EXIF, com agrupamento de viagem por proximidade de data |
| Separação silábica | regras de pt-BR |

Nada disso vira grafo sozinho: a saída é uma **proposta**, e a família confirma cada identidade e
cada relação na tela de Revisão antes de virar aresta.

---

## 8. Canais do aparelho

| Canal | Web | Celular |
|---|---|---|
| Vibração | Vibration API | `expo-haptics` |
| Voz | Web Speech API (`SpeechSynthesis`, pt-BR) | `expo-speech` |
| Escuta | `SpeechRecognition` + Web Audio (`AnalyserNode`) para detectar a pausa | `expo-audio` |
| Relógio | Notification API pelo service worker, espelhada para Wear OS | pareamento por código + SSE |

A detecção de pausa calibra o ruído de fundo antes de decidir o que é silêncio — é ela que dispara a
escada sem a pessoa precisar tocar em nada.

---

## 9. Sessão entre aparelhos

O celular e o relógio entram na mesma sessão por um código de quatro dígitos. O backend mantém o
roster e difunde os eventos por **Server-Sent Events**; cada aparelho decide o que faz com o evento
conforme o canal que está ligado nele.

---

## 10. O que ainda não está de pé

Declarado, porque metade do valor de uma doc técnica é dizer onde ela acaba.

- **O aplicativo Wear OS nunca foi compilado.** É código escrito para demonstrar a arquitetura; na
  demonstração, o relógio recebe a vibração pelo espelhamento de notificação do Android.
- **Geocodificação reversa** (coordenada → nome de cidade) não está implementada na ingestão.
- **Extração de relações a partir do texto por modelo de linguagem** está projetada, não escrita.
- **Nunca foi usado em terapia real.** O próximo passo é o piloto de quatro semanas com a ProSense,
  medindo o degrau médio.
- **Não é dispositivo médico.** Protótipo acadêmico, sem uso clínico e sem diagnóstico.

---

## 11. Rodando localmente

```bash
# API
cd server && npm install && cp .env.example .env && npm run db:migrate && npm run dev
# http://localhost:3333 · contratos navegáveis em /v1/docs

# Aplicativo
cd web && npm install && npm run dev            # http://localhost:3010

# Landing
cd landing && npm install && npm run dev        # http://localhost:5174

# Celular
cd mobile && npm install && npx expo start      # Expo Go, ou --web
```

Sem `DATABASE_URL` o backend sobe em memória. Sem chave de modelo, a escada determinística assume.
Nenhum dos dois quebra a experiência.
