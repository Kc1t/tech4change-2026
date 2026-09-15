# [NOME]

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
| Canais do dispositivo | Vibration API, Web Speech API (`SpeechSynthesis`, pt-BR), Notification API com espelhamento para Wear OS |
| Camada de modelo | Função serverless em `api/cue.ts`, Anthropic API |
| Ingestão do grafo | Python — **visão computacional** (InsightFace) e **machine learning** (HDBSCAN) para agrupamento de rostos; Whisper para transcrição; Pillow/EXIF para lugar e data; LLM para extração de relações |
| Publicação | Vercel — estático mais uma função |

Código, identificadores e nomes de arquivo em inglês. Texto de interface em português, isolado em
`src/data/strings.ts`.

---

## Arquitetura geral

```
src/domain      tipos, recuperação de candidatos, montagem e validação da escada
src/channels    vibração, voz, relógio
src/store       estado único, persistência do aprendizado
src/screens     seis telas, cada uma isolada das outras
src/data        grafo da persona, cache de escadas, textos
api/cue.ts      candidatos → modelo → validação → fallback
ingest/         pipeline offline que produz src/data/graph.json
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

**Portão de confiança.** A pista sonora só é emitida acima de um limiar
(`PHONOLOGICAL_CONFIDENCE_GATE`). Abaixo dele a escada para no degrau semântico e nunca arrisca
fonema — errar no degrau semântico é barato e reversível; pista fonêmica errada pode induzir
perseveração e bloquear o alvo correto.

**Caminho de segurança.** Se a validação falhar, se o modelo demorar mais que 2,5 s, ou se não houver
chave de API, o sistema cai na escada determinística montada a partir dos atributos do nó. Não existe
estado de erro visível.

---

## APIs, modelos de IA e bases de dados

- **Anthropic API** — reordenação de candidatos, com saída estruturada em identificadores.
- **InsightFace** — detecção e embedding de faces; **HDBSCAN** — agrupamento não supervisionado dos
  embeddings em clusters de pessoa.
- **Whisper** — transcrição dos áudios da família.
- **EXIF** mais geocodificação reversa — nós de lugar e de data.
- **Base de dados:** nenhuma externa. O grafo é um JSON versionado em `src/data/graph.json`, e o
  estado de aprendizado fica em `localStorage`, no aparelho.

---

## Instruções de instalação e execução

```bash
npm install
cp .env.example .env
npm run dev
```

`ANTHROPIC_API_KEY` é **opcional**. Sem chave, a aplicação funciona inteira pela escada
determinística — isso é intencional e é testado, porque o link precisa continuar funcionando durante
toda a janela de avaliação.

Pipeline de ingestão, offline:

```bash
cd ingest
pip install -r requirements.txt
python ingest.py --input entrada/ --output ../src/data/graph.json
```

**Onde abrir:** Chrome no Android. A vibração depende da Vibration API, que não existe no Safari do
iOS; nesse caso o sistema degrada para pulso visual e som, sem quebrar o fluxo.

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

**A detecção automática do bloqueio não existe — nem aqui, nem em nenhum produto do mundo.** Não há
sistema validado que detecte em tempo real que a pessoa travou numa palavra, em nenhuma língua. Por
isso o acionamento é um toque. O ensaio clínico de referência da área (NCT05338216) também usa
auto-relato e lista a detecção automática como trabalho futuro.

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

**O painel do fonoaudiólogo, nesta versão, usa dados simulados** — está rotulado como tal na própria
tela.

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
2. **Canais** — aplicativo nativo com serviço em primeiro plano, buffer sem gravação, fone e relógio
   calibrados por pessoa.
3. **Clínica** — painel e relatório para o fonoaudiólogo, integração com prontuário, piloto em centro
   de reabilitação. O relatório que ajusta conduta sobe o enquadramento sanitário de classe I para
   classe II; é decisão consciente.
4. **Detecção de pausa atípica** — VAD no dispositivo, com limiar ajustado à distribuição do próprio
   falante em vez de um valor universal. Sustenta a afirmação "pausa atípica para esta pessoa", não
   "bloqueio lexical".
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
