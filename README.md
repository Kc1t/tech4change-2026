# Eilo

**O caminho até a palavra.**

Quem teve AVC e ficou com afasia reconhece a pessoa na frente dela, sabe o que quer dizer, e o nome
não vem. O Eilo ajuda a alcançar essa palavra no segundo em que ela falta — usando a própria história
da pessoa como caminho.

O nome vem de *ei-lo*: **aqui está**.

Tech4Change 2026 — PosTech FIAP. Tema: *Potencializando o ser humano com Inteligência Artificial*.

---

## Descrição da solução

Depois de um AVC, cerca de 30% dos sobreviventes ficam com afasia. O quadro mais comum é a **anomia**:
não é perda de memória, é perda de acesso. O conteúdo continua inteiro; a via até ele é que se rompeu.

O sistema monta um mapa da vida da pessoa — pessoas, lugares, objetos e histórias, ligados entre si —
a partir do que já existe no celular dela. Quando a palavra trava, ela toca uma vez e o sistema
**não entrega a resposta**: entrega pistas que sobem em degraus, do geral para o específico,
terminando no som da palavra, até a própria pessoa dizer.

```
é da família  →  da geração dos netos  →  mora em Sorocaba  →  Le…  →  Letícia
```

A vibração marca o intervalo entre a tentativa e a dica, porque o que melhora a retenção não é
receber a resposta pronta: é o esforço que termina em acerto.

**O indicador de sucesso é o degrau médio de destravamento caindo semana a semana.** É uma ferramenta
desenhada para deixar de ser necessária.

---

## O diferencial

Existem aplicativos de comunicação aumentativa, de terapia de nomeação e de tradução por prancha de
símbolos. Cinco coisas separam o Eilo deles.

**1. A dica é a história dela, não um dicionário.** O problema da anomia é quase sempre com *nome
próprio* — a neta, a cidade, o cachorro. É exatamente onde nenhum modelo de linguagem tem a
informação, porque ela nunca esteve na internet. O grafo pessoal resolve o que o modelo não pode.

**2. O sistema não pode inventar uma parente.** Cada degrau precisa citar uma aresta que existe no
grafo e conecta o nó alvo. Se um degrau falhar na validação, **a resposta inteira é rejeitada** e cai
na escada determinística. Não é promessa: é o passo 3 do motor, e tem teste automatizado.

**3. A palavra nunca sai do aparelho.** O backend recebe uma *projeção* do grafo — identificador
opaco, tipo do nó, quais chaves de atributo existem, arestas com peso. Rótulo, apelido, texto do
degrau e separação silábica ficam no dispositivo. O schema de entrada **recusa** qualquer coisa que
não seja identificador opaco: uma requisição com um nome próprio volta `400`.

**4. Recuar é o objetivo declarado.** O achado mais bem documentado contra produtos assim é a
dependência de pista externa. O antídoto que a literatura prescreve — desvanecimento progressivo,
pista parcial em vez da palavra inteira, transferência para auto-dica — é a arquitetura do modelo de
aprendizado, e é por isso que a métrica de sucesso é o degrau médio caindo, não o uso subindo.

**5. Nunca espera a rede.** A escada determinística aparece no mesmo quadro do toque. Se o modelo
responder em até 2,5 s, ela é substituída pela ranqueada; se não responder, ninguém percebe. Sem
`ANTHROPIC_API_KEY` o produto inteiro funciona — e isso é testado.

---

## Como funciona

### O motor de dica, em quatro etapas

Só a segunda usa modelo.

1. **Candidatos** — propagação de ativação no grafo, casamento textual e prior de recência. Local,
   sem rede, alvo de 300 ms. A primeira lista vai para a tela antes de qualquer chamada.
2. **Reordenação** — o modelo recebe o recorte de candidatos e devolve **apenas identificadores** de
   nó e de aresta. Nunca texto livre.
3. **Validação** — cada degrau precisa citar uma aresta existente que conecte o nó alvo. Um degrau
   inválido derruba a resposta inteira.
4. **Montagem** — o texto de cada degrau sai do grafo, não da saída do modelo. A pista sonora é
   recorte de string sobre a separação silábica e **nunca passa pelo modelo**.

**Portão de confiança.** A pista sonora só é emitida acima de `PHONOLOGICAL_CONFIDENCE_GATE`. Abaixo
dele a escada para no degrau semântico: errar no semântico é barato e reversível, mas pista fonêmica
errada pode induzir perseveração e bloquear o alvo correto.

**Caminho de segurança.** Validação falhou, modelo demorou, ou não há chave: cai na escada
determinística montada dos atributos do nó. Não existe estado de erro visível.

### As telas

| tela | o que faz |
|---|---|
| **Momento** (`/`) | a home. O que foi ouvido em cima, a palavra esperada grande no centro, e o campo de aurora embaixo cuja própria borda ondula com o microfone |
| **Grafo** (`/graph`) | duas abas — **Mapa**, o grafo da vida com ícone por tipo de nó, e **Memórias**, a lista de tudo que sustenta cada ligação |
| **Clínico** (`/clinical`) | degrau médio por semana e por alvo, para o fonoaudiólogo |
| **Aparelhos** (`/body`) | canais de saída, discrição, intensidade e a sessão entre dois aparelhos |
| **Consentimento** (`/consent`) | pictogramas, áudio e frases curtas, para a própria pessoa autorizar |
| **Revisão** (`/review`) | a família confirma cada identidade e cada relação propostas pela ingestão |
| **Relógio** (`/watch`) | interface redonda que pareia por código de quatro dígitos |

Na tela de Grafo, tocar um nó abre a folha com **de onde veio cada ligação** — foto, áudio, conversa
ou confirmação da família. É a proveniência do passo 3 ficando visível para quem usa, não só para
quem programou.

---

## Tecnologias, linguagens e frameworks

| Camada | O que é usado |
|---|---|
| Aplicativo web | Next 16 (App Router, Turbopack), React 19, TypeScript, Zustand, Tailwind CSS v4 sobre tokens próprios, shadcn/ui e Base UI |
| Aplicativo de celular | React Native 0.86 via Expo SDK 57, Reanimated 4, `react-native-svg`, `expo-haptics`, `expo-speech` |
| Canais do dispositivo | Vibration API, Web Speech API (`SpeechSynthesis` e `SpeechRecognition`, pt-BR), Web Audio (`AnalyserNode`) para detectar a pausa da fala, Notification API pelo service worker com espelhamento para Wear OS |
| Aplicativo instalável | PWA com manifesto e service worker |
| Backend | NestJS 11, TypeScript, Prisma, PostgreSQL, Zod nos contratos de entrada, Swagger, Server-Sent Events |
| Camada de modelo | Anthropic API, chamada apenas pelo backend, com tempo limite de 2,5 s e endpoint configurável por `MODEL_BASE_URL` |
| Relógio | prova de conceito em Kotlin para Wear OS, cliente direto da mesma API — **escrita, nunca compilada** |
| Landing | Next 16, React 19, Tailwind CSS v4, Radix sobre os mesmos tokens do aplicativo |
| Ingestão do grafo | Python — **visão computacional** (InsightFace) para detecção e embedding de rostos; **machine learning** para agrupamento não supervisionado (HDBSCAN quando instalado, senão aglomerativo por cosseno em numpy); Whisper para transcrição; Pillow/EXIF para lugar e data; separação silábica de pt-BR por regras |
| Publicação | Vercel para aplicativo e landing, Railway para o backend |

Código, identificadores e nomes de arquivo em inglês. Texto de interface em português, no componente
que o exibe.

---

## Arquitetura geral

Quatro aplicações independentes, **sem monorepo**. Cada uma tem seu `package.json`, seu
`node_modules` e seu deploy. A raiz não tem `package.json`.

```
web/       aplicativo Next — é o alvo principal            :3010
mobile/    aplicativo React Native, celular de verdade     :8081
landing/   página pública                                  :5174
server/    API NestJS                                      :3333
watch/     prova de conceito Wear OS em Kotlin, nunca compilada
ingest/    pipeline Python de ingestão, roda offline
docs/      estado, contexto, pendências, decisões, vídeo, deploy
```

Dentro do aplicativo:

```
web/src/domain              tipos, montagem e validação da escada, projeção, memórias
web/src/channels            vibração, voz, relógio
web/src/store               estado único, persistência do aprendizado
web/src/screens             sete telas, cada uma isolada das outras
web/src/components          aurora, barra inferior, grafo, controles
web/src/hooks/useListening  microfone, calibração de ruído, detecção de pausa
web/src/api/client.ts       cliente do backend, com tempo limite e degradação silenciosa
web/src/sync/client.ts      ponte entre aparelhos: sessão, roster, transmissão e SSE
web/src/data                grafo da persona, cache de escadas

server/src/modules/cue        candidatos → modelo → validação → cache → determinístico
server/src/modules/audit      registro de bloqueio, degrau e desfecho
server/src/modules/clinician  agregação do degrau médio por semana e por alvo
server/src/modules/consent    estado de consentimento por titular
server/src/modules/sync       sessões entre aparelhos, roster e difusão por SSE
server/test                   prova automatizada das barreiras do modelo
```

`web/src/domain/` e `mobile/src/domain/` são o **mesmo código**, copiado sem adaptação — só tem
import relativo, nenhuma dependência de plataforma. O motor de dica é idêntico nos dois.

---

## APIs, modelos de IA e bases de dados

- **Anthropic API** — reordenação de candidatos, com saída estruturada em identificadores. O
  endpoint é configurável (`MODEL_BASE_URL`), então outro provedor compatível entra sem mudar código.
- **InsightFace** — detecção e embedding de faces.
- **Agrupamento não supervisionado** dos embeddings em clusters de pessoa: HDBSCAN quando a
  biblioteca está instalada; caso contrário, aglomerativo por similaridade de cosseno implementado em
  numpy. **O pipeline imprime qual dos dois usou.**
- **Whisper** — transcrição dos áudios da família, em pt-BR, com timestamp por trecho.
- **EXIF** — data e coordenada, e agrupamento de viagem por proximidade de data. Geocodificação
  reversa (coordenada → nome de cidade) **ainda não está implementada**.
- **Extração de relações a partir do texto por modelo de linguagem** — projetada, **ainda não
  implementada**.
- **Base de dados:** PostgreSQL via Prisma, no backend, com três tabelas — `AuditEvent`,
  `CuePlanCache` e `ConsentRecord`. Nenhuma guarda palavra: o alvo é sempre identificador opaco. O
  grafo é um JSON versionado em `web/src/data/graph.json` e o estado de aprendizado fica em
  `localStorage`, ambos no aparelho. O backend opera degradado, em memória, se o banco cair.

---

## Instruções de instalação e execução

Cada projeto roda do seu próprio diretório.

```bash
cd web && npm install && npm run dev          # aplicativo   http://localhost:3010
cd landing && npm install && npm run dev      # landing      http://localhost:5174
cd server && npm install && npm run dev       # API          http://localhost:3333
cd mobile && npm install && npx expo start    # celular      Expo Go ou --web
```

O backend expõe os contratos navegáveis em `/v1/docs`. Antes do primeiro `npm run dev` nele:

```bash
cd server
cp .env.example .env
npm run db:push
```

Para ligar o aplicativo ao backend, `cd web && cp .env.example .env.local` — ele já aponta para
`http://localhost:3333`. Para a landing gerar o link de semente, crie `landing/.env.local` com
`NEXT_PUBLIC_APP_URL=http://localhost:3010`.

`ANTHROPIC_API_KEY` é **opcional**. Sem chave, o aplicativo funciona inteiro pela escada
determinística — isso é intencional e é testado, porque o link precisa continuar funcionando durante
toda a janela de avaliação.

Prova automatizada das barreiras, sem precisar de chave nenhuma:

```bash
cd server
npm run build          # obrigatório: o teste roda dist/main.js
npm run test:guardrails
```

Ele sobe um servidor falso no lugar do modelo e verifica seis coisas: plano válido é aceito; plano
citando aresta inexistente, atributo inexistente ou aresta de outro nó é **rejeitado**; erro e
timeout do modelo caem no determinístico; e nenhuma palavra aparece no prompt enviado.

Pipeline de ingestão, offline:

```bash
cd ingest
pip install -r requirements.txt
python ingest.py --input input/ --owner Helena
```

Escreve em `web/src/data/graph.json`. A saída do terminal nunca afirma algo que não aconteceu:
biblioteca ausente, entrada vazia ou chave faltando viram `pulado`, com o motivo.

**Onde abrir:** Chrome no Android. A vibração depende da Vibration API, que não existe no Safari do
iOS; nesse caso o sistema degrada para pulso visual e som, sem quebrar o fluxo.

**Ligar dois aparelhos.** Na tela Aparelhos, "Abrir uma sessão" gera um código de quatro dígitos. Em
outro aparelho, abra `/watch` e digite o código: a dica passa a acender nos dois ao mesmo tempo. A
ponte transmite identificador, nível e aresta — nunca a palavra.

**Entrar sem onboarding.** A landing monta um link com a semente no **fragmento** da URL (`#seed=…`),
que por especificação nunca é enviado ao servidor. O aplicativo monta o grafo no próprio aparelho.

Antes de dizer que terminou, em cada projeto tocado: `npx tsc --noEmit` e `npm run build`.

---

## Integrantes e contribuições

| Integrante | Contribuição |
|---|---|
| Kauã Miguel | Produto e engenharia — motor de recuperação, arquitetura do grafo, aplicativos e pipeline de ingestão |
| Adriel | Validação — contato com clínicas de afasia, roteiro de entrevista, consolidação da evidência |
| Alessandro | Comunicação e design — pitch deck, identidade visual e material de apresentação |

---

## Limitações conhecidas

Declaradas porque são reais, e porque saber onde o produto não chega faz parte de saber o que ele é.

**Detectamos a pausa, não o bloqueio.** O aplicativo escuta pelo `AnalyserNode`, mede a energia do
sinal e dispara quando a fala é seguida de silêncio sustentado. Isso é real e funciona. O que **não**
existe — nem aqui, nem em nenhum produto do mundo — é detecção validada de que aquela pausa é anomia
e não uma pausa comum de conversa, e muito menos de *qual* palavra travou. Onde o navegador tem
`SpeechRecognition` usamos a transcrição no aparelho para escolher o alvo; onde não tem, o alvo vem
do contexto da cena. O toque continua disponível e é o caminho garantido. O ensaio clínico de
referência da área (NCT05338216) usa auto-relato e lista a detecção automática como trabalho futuro.

**Não existe diarização.** Qualquer pessoa na mesa que pausar 1,3 s dispara a pista.

**O aplicativo React Native ainda não tem tudo.** A home está completa, com vibração e voz, e o
domínio é o mesmo do web. Faltam a escuta (o `useListening` é Web Audio puro e precisa virar
`expo-audio` com metering), as telas de Grafo, Aparelhos, Clínico e Consentimento, os dois canvases,
a sessão entre aparelhos e a leitura da semente por URL.

**Não existe corpus público de fala afásica em português brasileiro**, nem medição publicada de
quanto o reconhecimento de fala piora nessa população. O Whisper large-v3 tem 38,4% de erro em fala
afásica em inglês contra 25% em controles — e o erro por caractere sobe para 87,82% em pausas
preenchidas, que é exatamente o evento de interesse.

**A vibração não carrega a palavra.** Um motor num relógio comum entrega cerca de 2 bits por mensagem,
de 3 a 5 padrões distinguíveis. Fala exigiria de 30 a 50 bits por segundo. A vibração aqui organiza o
tempo e sinaliza o degrau; o conteúdo vai por som e por tela.

**A vibração não muda plasticidade.** É o canal menos intrusivo para entregar a pista no momento do
bloqueio, e a pista funciona pelo conteúdo que carrega — não porque a vibração altere o cérebro.

**O grafo não se monta sozinho sem revisão.** Reconhecer a mesma pessoa aos 8, aos 30 e aos 70 anos,
em álbum doméstico digitalizado, é o pior caso para reconhecimento facial. A IA propõe; a família
confirma cada identidade e cada relação num onboarding único. Dizer o parentesco errado a uma pessoa
com afasia não é erro estatístico, é quebra de confiança.

**O painel do fonoaudiólogo mostra o que realmente existe.** Com a API no ar, ele agrega os eventos
gravados; sem ela, mostra o aprendizado deste aparelho; sem nenhum dos dois, diz que não há dado
ainda. A única peça ilustrativa é a curva de oito semanas, porque não dá para reconstruir histórico
que ninguém viveu — e ela está rotulada como ilustrativa ao lado do próprio gráfico.

**Nenhum paciente usou o sistema em situação real.** A validação até aqui é de dor, com fonte pública,
e de mecanismo, com literatura revisada por pares.

**Risco de dependência de pista externa.** É o achado mais bem documentado contra produtos assim, e
está respondido no ponto 4 do diferencial — mas continua sendo um risco, não um problema resolvido.

---

## Próximos passos

1. **Bases públicas de linguagem** — o grafo pessoal resolve nome próprio, que é onde nenhum modelo
   de linguagem tem a informação. Redes léxico-semânticas e dicionários fonológicos do português
   cobrem o vocabulário comum, formando a rede multiplex semântico-fonológica descrita na literatura
   de recuperação lexical em afasia.
2. **Fechar o React Native** — é o maior buraco aberto. Escuta com `expo-audio`, as quatro telas que
   faltam e a semente por URL.
3. **Canais** — o aplicativo já é instalável como PWA e liga dois aparelhos por sessão. Falta o
   serviço nativo em primeiro plano (para escutar com a tela apagada) e o aplicativo de relógio
   compilado, que é o que permite padrão de vibração próprio por degrau — notificação espelhada não
   permite.
4. **Clínica** — painel e relatório para o fonoaudiólogo, integração com prontuário, piloto em centro
   de reabilitação. O relatório que ajusta conduta sobe o enquadramento sanitário de classe I para
   classe II; é decisão consciente.
5. **Calibrar a pausa por falante** — a detecção já roda com calibração do piso de ruído do ambiente.
   O passo seguinte é ajustar o limiar à distribuição do próprio falante. Isso sustenta a afirmação
   "pausa atípica para esta pessoa" — que continua sendo diferente de "bloqueio lexical".
6. **Corpus de fala afásica em português** — não existe, e é o que destrava tudo acima. Quem
   construir o primeiro é dono da categoria.
7. **Modelo local no aparelho** — o dado pessoal deixa de sair do dispositivo.

---

## Enquadramento regulatório

Pela RDC 657/2022, software com finalidade de **reabilitação** não é software de bem-estar. Pela regra
de classificação da RDC 751/2022, a leitura preliminar é **dispositivo médico classe I, por
notificação** — sem análise técnica prévia. É leitura nossa, a confirmar em consulta formal de
enquadramento junto à ANVISA.

Dados de saúde são dados pessoais sensíveis. Áudio de ambiente é processado no aparelho e a forma de
onda é descartada; nada sai do dispositivo sem acionamento explícito. E a Lei Brasileira de Inclusão
é clara: afasia não afeta a capacidade civil, e nem um curador consente por alguém sobre saúde e
privacidade — por isso o fluxo de consentimento é feito em pictogramas, áudio e frases curtas, para
que a própria pessoa autorize.

---

## Documentação interna

| arquivo | para quê |
|---|---|
| [`docs/ESTADO.md`](docs/ESTADO.md) | o que mudou, o que está perigoso agora |
| [`docs/CONTEXTO.md`](docs/CONTEXTO.md) | o projeto do zero |
| [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md) | o que falta, em ordem de retorno |
| [`docs/DECISOES.md`](docs/DECISOES.md) | o que já foi decidido e não se rediscute |
| [`docs/VIDEO.md`](docs/VIDEO.md) | o plano de gravação |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Vercel e Railway |
