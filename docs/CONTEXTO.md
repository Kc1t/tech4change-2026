# Contexto — leia isto primeiro

Documento de passagem. Quem chega neste repositório sem ter acompanhado a conversa anterior começa
por aqui — mas para saber o que está **perigoso agora**, leia [`ESTADO.md`](ESTADO.md) primeiro.
Última atualização: **15/09/2026**.

---

## O que é

Hackathon **Tech4Change 2026**, FIAP PosTech. Entrega **domingo 20/09/2026, 23:59**.
Grupo: Kauã, Adriel, Alessandro — os três desenvolvedores.

Produto: um aplicativo que ajuda quem perdeu acesso às palavras — principalmente **afasia pós-AVC**,
sintoma chamado **anomia** — a alcançar a palavra que travou, no segundo em que ela falta.

O sistema não entrega a palavra. Entrega um caminho até ela: uma escada de dicas que vai do geral ao
específico, montada sobre um grafo da vida da própria pessoa.

```
é da família → da geração dos netos → mora em Sorocaba → Le… → Letícia
```

**Slogan assinatura:** "O caminho até a palavra."
**Capa:** "Ele sabe qual é a palavra. E não diz."
**Fecho:** "A última palavra é sua."

---

## O diferencial, em uma frase

Não é o grafo, não é a IA, não é a vibração. É a **posição**: todos os outros produtos tratam a
palavra que não vem como algo para treinar numa sessão de terapia. Este resolve dentro da conversa
real, no segundo em que ela falta.

E há um fato que sustenta isso tecnicamente: **o nome da neta de alguém não está nos pesos de nenhum
modelo de linguagem.** Nome próprio de vida pessoal só é resolvido por um índice pessoal.

---

## Onde está cada coisa

Este repositório é `app/`, e é um repositório git próprio publicado como
`https://github.com/Kc1t/tech4change-2026` (**privado**).

```
web/            aplicação Next 16 (App Router + React 19 + shadcn/ui) — O APLICATIVO
mobile/         aplicação React Native (Expo SDK 57, Reanimated)
server/         API (NestJS 11 + Prisma + PostgreSQL)
landing/        página pública do produto (Next 16 + shadcn/ui)
watch/          aplicação Wear OS (Kotlin) — compilada e rodando em Galaxy Watch 4
ingest/         pipeline Python de ingestão — roda; `input/` está vazia
docs/           este diretório
```

**Atenção:** a aplicação Vite que ocupava `src/` na raiz foi removida em 16/09. A raiz não tem
mais `package.json` — cada projeto roda do seu próprio diretório. Ver [`ESTADO.md`](ESTADO.md).

O material de pesquisa, pitch e roteiro está em [`../research/`](../research/) — dentro da pasta,
**fora do git**:

| Arquivo | O que é |
|---|---|
| `FUNDAMENTACAO.md` | base científica, regulatória e de mercado, 11 seções. **A fonte de verdade dos números.** |
| `NARRATIVA.md` | os 10 blocos do pitch com os 7 elementos obrigatórios mapeados |
| `ROTEIRO_VIDEO.md` | roteiro do vídeo de 5 min, 9 blocos cronometrados |
| `PLANO_DEV.md` | plano técnico original |
| `DECK.md` / `DECK_PROTOTIPO.html` | pitch deck, 18 slides |
| `MVP_FLUXO.html` | protótipo clicável de 6 telas (anterior ao código real) |
| `REFERENCIAS_UI.md` | referências visuais |
| `ROTEIRO_ENTREVISTA_FONO.md` | roteiro de entrevista com fonoaudiólogos, 20 min |

---

## Estado do código, em 15/09

### Aplicação (`web/`) — funcionando

App Router: `/`, `/graph`, `/body`, `/clinical`, `/consent`, `/review`, `/memories`, `/progress`
e `/watch`.

**A home (`web/src/screens/MomentScreen.tsx`) é o centro do
produto: uma bolha em canvas que reage ao microfone de verdade, detecta a pausa da fala e dispara a
dica sozinha.

- `web/src/components/Orb.tsx` — a bolha. Cinco estados, anéis concêntricos que respiram com a amplitude
  da voz. Sem gradiente.
- `web/src/hooks/useListening.ts` — `AnalyserNode` a 60fps, detecção de pausa (fala > 700 ms seguida de
  silêncio > 1300 ms) e `SpeechRecognition` opcional em pt-BR. Os limiares são **calibrados ao
  ruído do ambiente** nos primeiros 900 ms, não fixos — sem isso o app não disparava em sala
  barulhenta, e falhava em silêncio.
- Dois seletores na tela: **ajuda** (Entrega / Dica / Escada) e **saída** (Voz / Texto / Ambos).
  Padrão: Dica + Ambos. Dois toques trocam os dois.
- A dica aparece dentro da bolha e some — 5,2 s para dica, 7 s para a palavra. Nada acumula.
- Sem microfone, a bolha vira botão e o aplicativo funciona inteiro.

É um PWA instalável: `public/manifest.webmanifest` e `public/sw.js`. O service worker existe para
que as notificações saiam por `registration.showNotification()`, que é o caminho confiável para o
Android espelhar no relógio pareado.

### API (`server/`) — funcionando

NestJS no padrão feature-first: `src/modules/<feature>/` com `dto/`, e infra como irmã em `common/`,
`database/`, `health/`.

| rota | o que faz |
|---|---|
| `POST /v1/cue/rank` | ativação no grafo → modelo → validação → cache → determinístico. Endpoint do modelo configurável por `MODEL_BASE_URL`. |
| `POST /v1/audit/events` · `GET /v1/audit/events/:subject` | bloqueio, degrau e desfecho — o app emite os três |
| `GET /v1/clinician/:subject/summary` | degrau médio por semana e por alvo |
| `GET`/`PUT /v1/consent/:subject` | consentimento por titular, uma resposta por pergunta — **a tela de consentimento grava aqui** |
| `POST /v1/sync/sessions` · `.../devices` · `.../cue` · `.../stream` | ponte entre aparelhos, por SSE |

Swagger em `/v1/docs`. Opera degradado, em memória, se o banco cair. A migração inicial do Prisma está em `prisma/migrations/20260915000000_init/` e o `Dockerfile` roda `migrate deploy` antes de subir.

**A garantia central:** o servidor nunca recebe palavra nenhuma. O aparelho manda uma *projeção* do
grafo — identificador opaco, tipo do nó, quais chaves de atributo existem, arestas com peso. Rótulo,
apelido, texto do degrau e sílaba ficam no aparelho. O servidor ranqueia e devolve identificadores.

Isso é verificável por inspeção, não é promessa de política de privacidade:

```
POST /v1/cue/rank  { "activeNodes": ["Letícia"] }
→ 400 "identifiers must be opaque: lowercase, digits, _ : - only"
```

Os identificadores dos nós são hashes (`n_fd8f8a`), não o nome em minúsculas. Isso foi corrigido em
15/09 — antes eram `leticia`, `sorocaba`, `ubatuba`, o que anulava a palavra "opaco" para qualquer
um que abrisse o `graph.json`.

**`npm run test:guardrails`** (em `server/`) sobe um servidor falso no lugar do modelo e prova seis
coisas de uma vez: plano válido é usado; plano citando aresta inexistente, atributo inexistente ou
aresta de outro nó é rejeitado; erro e timeout do modelo caem no determinístico; e nenhuma palavra
aparece no prompt enviado. Roda sem chave de API.

### Ponte entre aparelhos (modo sync) — funcionando

Um código de quatro dígitos liga celular e relógio na mesma sessão. Quem abre a sessão vira o
emissor; quem entra recebe as dicas em tempo real por Server-Sent Events.

- `server/src/modules/sync/` — sessões em memória, roster com heartbeat de 45 s, varredura a cada 15 s
- `web/src/sync/client.ts` — criar, entrar, sair, transmitir, assinar
- `web/src/hooks/useSyncChannel.ts` — dono único da assinatura, montado no `Shell`
- `web/src/components/SyncPanel.tsx` — código, roster ao vivo e estado de cada aparelho, dentro da tela Corpo
- `web/src/screens/WatchScreen.tsx` — rota `/watch`, interface redonda que pareia por código, recebe a dica e vibra
- `watch/.../SyncClient.kt` — o app nativo entra na mesma sessão com `-PsessionCode=1234` no build

**A ponte também não transporta palavra.** Ela transmite `targetId`, nível, chave de atributo e
aresta. Cada aparelho resolve o texto no seu próprio grafo. O schema recusa nome próprio com `400`,
igual ao `/cue/rank`.

Testado ponta a ponta em duas abas: celular abre a sessão, relógio pareia por código, o toque no
celular acende o degrau no relógio.

### Landing (`landing/`) — funcionando

Next 16 + shadcn/ui, mesma identidade da aplicação. Herói roda a escada animada. A rota
`/experimentar` roda o fluxo dentro de uma moldura de celular. Uma seção mostra lado
a lado o JSON que fica no aparelho e o que chega ao servidor.

### Relógio nativo (`watch/`) — rodando em hardware

Kotlin para Wear OS. Fala direto com a API pelo Wi-Fi do relógio, sem depender de um app Android no
celular, e entra na mesma sessão de sync por código (`SyncClient.kt`). Existe para os padrões de
vibração por nível de degrau, que notificação espelhada não faz.

**Compilado e instalado em 16/09**, num Galaxy Watch 4 (SM-R861, Wear OS / API 36), pareado por
depuração sem fio. O log do próprio hardware confirma amplitude controlada por degrau, que é o
argumento que a notificação espelhada não sustenta. A interface usa a mesma aurora da home, portada
para `Canvas` em `AuroraView.kt`.

O que ainda não rodou de ponta a ponta é o pareamento por sessão: o código vai em `BuildConfig` em
tempo de build (`-PsessionCode=`), não há tela para digitá-lo no relógio.

O build precisa do Android SDK 35+ e do JDK 17+; o caminho do SDK fica em `watch/local.properties`,
fora do git. Ver `watch/README.md`.

### Ingestão (`ingest/`) — roda

`python ingest.py --input input/ --owner Helena` lê fotos e áudios e escreve
`web/src/data/graph.json`. Etapas em `steps/`: `exif.py` (data, GPS, agrupamento de viagem),
`faces.py` (InsightFace mais agrupamento — HDBSCAN quando instalado, senão aglomerativo por cosseno
em numpy), `transcribe.py` (Whisper pt-BR), `phonology.py` (separação silábica), `graph.py`
(montagem com identificador opaco e proveniência obrigatória).

**A saída do terminal nunca afirma algo que não aconteceu.** Biblioteca ausente, entrada vazia ou
chave de API faltando viram `pulado` com o motivo. Isso é deliberado: o roteiro prevê filmar esse
terminal, e número inventado em tela é o tipo de coisa que a banca pega.

O que ainda **não** existe ali: extração de relações por modelo de linguagem, e geocodificação
reversa (a coordenada é lida, virar "Sorocaba" depende de serviço externo).

Testado com 11 fotos sintéticas com EXIF: encontrou os 2 blocos de data corretos e produziu um grafo
com o mesmo esquema do `web/src/data/graph.json`, incluindo o mesmo identificador para a Helena.

---

## Como rodar

```bash
cd web && npm install && npm run dev                   # aplicativo, :3010
cd landing && npm install && npm run dev               # landing,     :5174
cd server && npm install && npm run dev                # API,         :3333
cd mobile && npm install && npx expo start             # React Native
```

`ANTHROPIC_API_KEY` é opcional — sem chave tudo funciona pela escada determinística, e isso é
intencional e testado.

Para o aplicativo falar com a API: `NEXT_PUBLIC_API_URL`, lida em tempo de build.

---

## Como é avaliado

Cinco critérios, **20% cada**, cinco professores da FIAP, nota de 0 a 10 cada, somadas:

1. tema
2. viabilidade técnica e mercadológica
3. sustentabilidade financeira e operacional
4. originalidade
5. **evidências de validação** ← é onde estamos piores

Existe um conflito entre dois documentos oficiais. O Regimento, item 3.5.1, limita a entrega de
20/09 a "um vídeo do pitch e o respectivo pitch deck". O "Desafio Estruturado", seção 3, acrescenta
MVP funcional, demonstração, repositório com README e evidências.

**A assimetria de risco importa:** link de vídeo ausente ou quebrado é desclassificação
*automática* (Regimento 6.2.2.2, categórico). Item obrigatório faltando *poderá* causar
desclassificação (Desafio 3.7, discricionário). E o item 3.3 aceita explicitamente "protótipo
navegável".

Conclusão operacional: **construir o MVP, mas nunca deixar o MVP atrasar o vídeo.**
