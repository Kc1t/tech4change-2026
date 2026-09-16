# Eilo

**O caminho até a palavra.**

Protótipo navegável que ajuda quem perdeu o acesso à palavra a encontrá-la, usando a própria história
da pessoa como caminho. Roda no navegador de um celular Android, sem instalação e sem credencial.

Tech4Change 2026 — PosTech FIAP. Tema: *Potencializando o ser humano com Inteligência Artificial*.

---

## Descrição da solução

Depois de um AVC, cerca de 30% dos sobreviventes ficam com afasia. O quadro mais comum é a **anomia**:
a pessoa reconhece quem está na frente dela, sabe o que quer dizer, e o nome não vem. Não é perda de
memória — é perda de acesso. O conteúdo continua inteiro; a via até ele é que se rompeu.

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

## Tecnologias, linguagens e frameworks

| Camada | O que é usado |
|---|---|
| Aplicação | Vite, React 18, TypeScript, Zustand, Tailwind CSS v4 sobre tokens próprios |
| Canais do dispositivo | Vibration API, Web Speech API (`SpeechSynthesis` e `SpeechRecognition`, pt-BR), Web Audio (`AnalyserNode`) para detectar a pausa da fala, Notification API pelo service worker com espelhamento para Wear OS |
| Aplicativo instalável | PWA com manifesto e service worker |
| Backend | NestJS 11, TypeScript, Prisma, PostgreSQL, Zod nos contratos de entrada, Swagger, Server-Sent Events |
| Camada de modelo | Anthropic API, chamada apenas pelo backend, com tempo limite de 2,5 s e endpoint configurável por `MODEL_BASE_URL` |
| Relógio | prova de conceito em Kotlin para Wear OS, cliente direto da mesma API — **escrita, nunca compilada** |
| Landing | Vite, React, Tailwind CSS v4, shadcn/ui sobre os mesmos tokens da aplicação |
| Ingestão do grafo | Python — **visão computacional** (InsightFace) para detecção e embedding de rostos; **machine learning** para agrupamento não supervisionado (HDBSCAN quando instalado, senão aglomerativo por cosseno em numpy); Whisper para transcrição; Pillow/EXIF para lugar e data; separação silábica de pt-BR por regras |
| Publicação | Vercel para aplicação e landing, Railway para o backend |

Código, identificadores e nomes de arquivo em inglês. Texto de interface em português, no
componente que o exibe.

---

## Arquitetura geral

Três aplicações independentes, sem monorepo, cada uma com seu próprio ciclo de deploy.

```
src/domain              tipos, montagem e validação da escada, projeção do grafo
src/channels            vibração, voz, relógio
src/store               estado único, persistência do aprendizado
src/screens             seis telas, cada uma isolada das outras
src/components/Orb.tsx  a bolha: medidor de voz, estado de bloqueio e entrega da dica
src/hooks/useListening  microfone, detecção de pausa e transcrição opcional no aparelho
src/api/client.ts       cliente do backend, com tempo limite e degradação silenciosa
src/sync/client.ts      ponte entre aparelhos: sessão, roster, transmissão e SSE
src/screens/Watch       rota /#/watch, interface redonda que pareia por código
src/data                grafo da persona, cache de escadas
ingest/                 pipeline offline que produz src/data/graph.json

server/src/modules/cue        candidatos → modelo → validação → cache → determinístico
server/src/modules/audit      registro de bloqueio, degrau e desfecho
server/src/modules/clinician  agregação do degrau médio por semana e por alvo
server/src/modules/consent    estado de consentimento por titular
server/src/modules/sync       sessões entre aparelhos, roster e difusão por SSE
server/src/{common,database,health}   infraestrutura
server/test                   prova automatizada das barreiras do modelo

landing/                página pública do produto
watch/                  prova de conceito Wear OS em Kotlin, nunca compilada
```

O motor de dica tem quatro etapas, e só a segunda usa modelo:

1. **Candidatos** — propagação de ativação no grafo mais casamento textual mais prior de recência.
   Local, sem rede, alvo de 300 ms. A primeira lista vai para a tela antes de qualquer chamada.
2. **Reordenação** — o modelo recebe o recorte de candidatos e devolve **apenas identificadores** de
   nó e de aresta. Nunca texto livre.
3. **Validação** — cada degrau precisa citar uma aresta que existe no grafo e que conecta o nó alvo.
   Se qualquer degrau falhar, **a resposta inteira é rejeitada**.
4. **Montagem** — o texto de cada degrau é montado a partir do grafo, não da saída do modelo. A pista
   sonora é recorte de string sobre a separação silábica, e nunca passa pelo modelo.

Consequência: o sistema não consegue inventar uma parente que não existe. E cada dica recebida é
rastreável até a foto, o áudio ou a mensagem que originou aquela aresta.

**O backend não recebe palavra nenhuma.** O aparelho envia uma *projeção* do grafo: identificador
opaco do nó, tipo do nó, quais chaves de atributo existem, e as arestas com peso e relação. Rótulo,
apelido, o texto de cada degrau e a separação silábica nunca saem do aparelho. O servidor ranqueia e
devolve identificadores; o aparelho os resolve de volta em texto. Isso não é uma promessa de política
de privacidade — o schema de entrada recusa qualquer coisa que não seja um identificador opaco, e uma
requisição contendo um nome próprio volta com `400`.

**O aplicativo nunca espera a rede.** A escada determinística aparece na tela no mesmo quadro em que
a pessoa toca o botão. Se o modelo responder dentro de 2,5 s, a escada é substituída pela ranqueada;
se não responder, ninguém percebe. A tela indica a origem da escada em uso.

**Portão de confiança.** A pista sonora só é emitida acima de um limiar
(`PHONOLOGICAL_CONFIDENCE_GATE`). Abaixo dele a escada para no degrau semântico e nunca arrisca
fonema — errar no degrau semântico é barato e reversível; pista fonêmica errada pode induzir
perseveração e bloquear o alvo correto.

**Caminho de segurança.** Se a validação falhar, se o modelo demorar mais que 2,5 s, ou se não houver
chave de API, o sistema cai na escada determinística montada a partir dos atributos do nó. Não existe
estado de erro visível.

---

## APIs, modelos de IA e bases de dados

- **Anthropic API** — reordenação de candidatos, com saída estruturada em identificadores. O
  endpoint é configurável (`MODEL_BASE_URL`), então outro provedor compatível entra sem mudar código.
- **InsightFace** — detecção e embedding de faces.
- **Agrupamento não supervisionado** dos embeddings em clusters de pessoa: HDBSCAN quando a
  biblioteca está instalada; caso contrário, aglomerativo por similaridade de cosseno implementado em
  numpy. **O pipeline imprime qual dos dois usou.**
- **Whisper** — transcrição dos áudios da família, em pt-BR, com timestamp por trecho.
- **EXIF** — data e coordenada, e agrupamento de viagem por proximidade de data.
  Geocodificação reversa (coordenada → nome de cidade) **ainda não está implementada**.
- **Extração de relações a partir do texto por modelo de linguagem** — projetada, **ainda não
  implementada**.
- **Base de dados:** PostgreSQL via Prisma, no backend, com três tabelas — `AuditEvent`,
  `CuePlanCache` e `ConsentRecord`. Nenhuma delas guarda palavra: o alvo é sempre identificador
  opaco. O grafo em si é um JSON versionado em `src/data/graph.json` e o estado de aprendizado fica
  em `localStorage`, ambos no aparelho. O backend opera degradado, em memória, se o banco cair.

---

## Instruções de instalação e execução

Aplicação:

```bash
npm install
cp .env.example .env
npm run dev
```

Backend:

```bash
cd server
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Sobe em `http://localhost:3333`, com contratos navegáveis em `/v1/docs`. Aponte a aplicação para ele
com `VITE_API_URL=http://localhost:3333`.

Landing:

```bash
cd landing
npm install
npm run dev
```

`ANTHROPIC_API_KEY` é **opcional**. Sem chave, a aplicação funciona inteira pela escada
determinística — isso é intencional e é testado, porque o link precisa continuar funcionando durante
toda a janela de avaliação.

Prova automatizada das barreiras, sem precisar de chave nenhuma:

```bash
cd server
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

A saída do terminal nunca afirma algo que não aconteceu: biblioteca ausente, entrada vazia ou chave
faltando viram `pulado`, com o motivo.

**Onde abrir:** Chrome no Android. A vibração depende da Vibration API, que não existe no Safari do
iOS; nesse caso o sistema degrada para pulso visual e som, sem quebrar o fluxo.

**Ligar dois aparelhos.** Na tela Corpo, "Abrir uma sessão" gera um código de quatro dígitos. Em
outro aparelho, abra `/#/watch` e digite o código: a dica passa a acender nos dois ao mesmo tempo.
A ponte transmite identificador, nível e aresta — nunca a palavra.

---

## Integrantes e contribuições

| Integrante | Contribuição |
|---|---|
| Kauã Miguel | Produto e engenharia — motor de recuperação, arquitetura do grafo, aplicação e pipeline de ingestão |
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

**Risco de dependência de pista externa.** É o achado mais bem documentado contra produtos assim. O
antídoto que a literatura prescreve — desvanecimento progressivo, pista parcial em vez da palavra
inteira, transferência para auto-dica — é a arquitetura do modelo de aprendizado deste sistema, e é
por isso que a métrica de sucesso é o degrau médio caindo.

---

## Próximos passos

1. **Bases públicas de linguagem** — o grafo pessoal resolve nome próprio, que é onde nenhum modelo
   de linguagem tem a informação. Redes léxico-semânticas e dicionários fonológicos do português
   cobrem o vocabulário comum, formando a rede multiplex semântico-fonológica descrita na literatura
   de recuperação lexical em afasia.
2. **Canais** — o aplicativo já é instalável como PWA e liga dois aparelhos por sessão. Falta o
   serviço nativo em primeiro plano (para escutar com a tela apagada) e o aplicativo de relógio
   compilado, que é o que permite padrão de vibração próprio por degrau — notificação espelhada não
   permite.
3. **Clínica** — painel e relatório para o fonoaudiólogo, integração com prontuário, piloto em centro
   de reabilitação. O relatório que ajusta conduta sobe o enquadramento sanitário de classe I para
   classe II; é decisão consciente.
4. **Calibrar a pausa por falante** — a detecção de pausa já roda, com limiar fixo. O passo seguinte
   é ajustar o limiar à distribuição do próprio falante em vez de um valor universal. Isso sustenta a
   afirmação "pausa atípica para esta pessoa" — que continua sendo diferente de "bloqueio lexical".
5. **Corpus de fala afásica em português** — não existe, e é o que destrava tudo acima. Quem
   construir o primeiro é dono da categoria.
6. **Modelo local no aparelho** — o dado pessoal deixa de sair do dispositivo.

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
