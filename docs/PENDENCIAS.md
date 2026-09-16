# O que falta — 16/09, faltam 4 dias

Ordenado por retorno, não por ordem de execução. Data limite: **domingo 20/09, 23:59**.

---

## Bloqueia outras pessoas — resolver hoje

### 1. Sobrenomes do Adriel e do Alessandro
Para o slide de equipe e para a tabela de integrantes do `README.md`.

### 2. Percorrer a escada no relógio, com ele no pulso
O aplicativo nativo já está instalado num Galaxy Watch 4 e vibra com amplitude por degrau. Falta
tocar os quatro degraus com o relógio **no pulso** — fora dele o Wear entra em `DOZE_SUSPEND` em
segundos e para de receber toque, o que impediu a verificação em 16/09. Decide o plano do pulso no
bloco 4 do vídeo. Ver `VIDEO.md`.

---

## O de maior retorno na nota, e não é código

### 3. Entrevistas com fonoaudiólogos
O critério 5 — evidências de validação — vale 20% e é onde estamos piores. Uma análise de ponto por
hora colocou "construir mais MVP" em 19º lugar entre 20 ações. Entrevistas ficaram no topo.

30 a 40 mensagens diretas, 4 a 6 entrevistas de 20 minutos. O roteiro já existe em
[`../research/ROTEIRO_ENTREVISTA_FONO.md`](../research/ROTEIRO_ENTREVISTA_FONO.md). A regra de ouro está lá: **não apresentar a solução antes do
bloco 4**. As perguntas que mais importam são a 11 ("o que te faria NÃO usar isso") e a 13 (preço).

O resultado disso preenche `[NÚMERO]` e `[CITAÇÃO 1]` no roteiro do vídeo e no slide 13 do deck.

---

## Auditoria de veracidade — o que já foi conferido

Varri `README.md` e a landing procurando afirmação que o código não sustenta. O que foi corrigido em
15/09:

| onde | dizia | realidade |
|---|---|---|
| README | agrupamento por **HDBSCAN** | HDBSCAN quando instalado, senão aglomerativo por cosseno em numpy — o terminal diz qual usou |
| README | **geocodificação reversa** de coordenada para cidade | não implementada |
| README | "a detecção automática do bloqueio não existe — nem aqui" | detectamos a **pausa**; o que não existe é detecção validada de que a pausa é anomia, e de qual palavra travou |
| README | painel do fono usa "dados simulados" | usa servidor, ou aprendizado do aparelho; só a curva de 8 semanas é ilustrativa e está rotulada |
| landing | "o **modelo propõe os vínculos**" | extração de relações por LLM não está implementada; os vínculos vêm de rosto agrupado e metadado de foto |
| landing | "um em cada três sai do hospital **sem conseguir nomear o que vê**" | cerca de um em cada três fica com afasia, e o sintoma mais comum dela é não achar a palavra |
| landing | "168h **de conversa** por semana" | 168 h é a semana inteira de uma pessoa, não conversa |

Auditados em 15/09, fora deste repositório:

| onde | dizia | agora diz |
|---|---|---|
| `ROTEIRO_VIDEO.md` | "os últimos dez segundos — e não guardou nenhum deles" | "buffer em memória que se sobrescreve sozinho e nunca chega ao disco" |
| `MVP_FLUXO.html` (2×) | "usa os últimos 10 segundos, que não foram salvos" | "usa os últimos 10 segundos do buffer em memória" |
| `DECK_PROTOTIPO.html` | "ninguém entrega pista lexical **por canal tátil**" | o tátil marca a janela de esforço; a pista vai pelo fone |
| `NARRATIVA.md` | mesma confusão de canal | idem, com o parágrafo explicando a diferença |
| `NARRATIVA.md`, `ROTEIRO_VIDEO.md`, `DECK_PROTOTIPO.html`, `FUNDAMENTACAO.md` | "2,9% dos fonoaudiólogos do país" | 2,9% dos 61.054 registrados, **19,7% dos 9.158 de neuro adulto** — um em cada cinco |
| `FUNDAMENTACAO.md` §1 | geocodificação reversa como parte do pipeline | marcada como arquitetura, não como código entregue |

**Consequência de pitch que precisa de decisão do grupo:** trocar o denominador torna a meta do ano 3
visivelmente mais dura (um em cada cinco, não um em cada trinta e cinco). É o número honesto e
sobrevive a uma pergunta da banca; o outro não.

---

## Contradições no material que a banca pode pegar

### 4. `FUNDAMENTACAO.md` §9.3 — resolvido em 15/09
A seção dizia que a detecção de bloqueio saía do curto prazo e que o botão com buffer entrava no
lugar. Foi reescrita para descrever o que existe: o botão continua sendo o caminho que nunca erra, e
ao lado dele roda detecção de **pausa** por energia do sinal, com o limiar calibrado ao ruído do
ambiente.

A ressalva ficou no documento, porque ela é o que separa a frase honesta da mentira: detectamos
pausa, **não** bloqueio lexical. Qual palavra travou continua dependendo da transcrição.

### 5. As três correções parciais — fechadas em 15/09
Estão aplicadas em todos os arquivos, dentro e fora do repositório. Ver a tabela de auditoria acima.

---

## Telas, estado real

Nenhuma tela tem mais dado inventado escondido. Onde o dado é ilustrativo, a etiqueta diz.

| tela | de onde vem o dado |
|---|---|
| Momento | grafo local, escada determinística, ranqueamento da API quando responde em 2,5 s |
| Grafo | grafo local mais o estado de aprendizado; ramificação animada na lente Aprendizado |
| Corpo | canais do aparelho e roster ao vivo da sessão de sync |
| Clínico | resumo do servidor quando existe; senão o aprendizado deste aparelho; a curva semanal segue ilustrativa e **está rotulada como tal** |
| Consentimento | lê e grava em `/v1/consent`, uma resposta por pergunta |
| Revisão | grafo local, proveniência real, confirmações no `localStorage` — **nunca sobe para o servidor, por decisão de arquitetura** |

## Semente pela landing — novo em 15/09

A landing tem uma seção `#testar` com três perguntas: seu nome, o nome de alguém que você vê toda
semana, e a cidade dessa pessoa. As respostas viram um link para o aplicativo com `?seed=` **no
fragmento da URL**.

O fragmento, por especificação, nunca é enviado ao servidor. O aplicativo lê, monta o grafo no
aparelho (três nós, duas arestas, identificadores opacos por `sha256`, proveniência `família ·
você respondeu no primeiro acesso`), guarda as respostas no `localStorage` e limpa a URL.

Por que isso vale mais que a demo da Helena: o jurado põe gente da vida dele na escada e pode abrir
o DevTools para confirmar que nada daquilo saiu do aparelho. A tela de Revisão troca o texto quando
está semeada, para não mentir sobre agrupamento de rostos que não aconteceu.

**Não existe APK.** O aplicativo é PWA. O botão "instalar" aparece no cabeçalho quando o navegador
oferece `beforeinstallprompt` — na landing não dá para disparar isso, porque a origem é outra.

---

## Dívida técnica conhecida

| Item | Situação |
|---|---|
| `ingest/` | roda e produz o grafo. Falta extração de relações por LLM e geocodificação reversa. **Para filmar o plano do terminal é preciso colocar fotos reais com EXIF em `ingest/input/`** — com a pasta vazia a saída é honesta e inútil: "nada para processar". |
| `watch/` | escrito, nunca compilado. Não instalar SDK antes de sábado. |
| `DECK_PROTOTIPO.html` | usa unidades de container query (`cqw`) dentro de `clamp()`, que quebram na exportação para PDF. |
| Chave da Anthropic | não existe no ambiente. O caminho do modelo está pronto e testado contra um servidor falso, mas **nunca bateu na API de verdade**. Basta `ANTHROPIC_API_KEY` no `server/.env`. |
| Oracle | nada verificado. Os limites do Always Free, pt-BR no OCI Speech e o tier de property graph não foram conferidos — precisa de `WebFetch` ou orçamento de busca. |
| Relatórios dos agentes | oito relatórios de pesquisa nunca foram consolidados num arquivo único. |
| Banco de dados | a API roda degradada, em memória, sem Postgres. A migração inicial existe em `server/prisma/migrations/20260915000000_init/` e o `Dockerfile` aplica no boot — falta só um banco de verdade. |
| Deploy | nada publicado, mas **configurado**: `vercel.json` na raiz e em `landing/`, `server/railway.json` e o `Dockerfile` rodando a migração. Passo a passo em [`DEPLOY.md`](DEPLOY.md). Publicar é decisão do Kauã. |
| Sessões de sync | vivem em memória no processo da API. Reiniciou o servidor, caem todas. Aceitável para a demonstração, não para produção. |
| Grafo | pronto. A ramificação nasce animada na lente Aprendizado — a aresta se desenha do nó recém-aprendido, o nó cresce, um halo se expande e a legenda "nova ramificação de aprendizado" aparece. Trocar de lente e voltar reproduz a animação, o que é bom para regravar. |

---

## Calendário

| dia | o que |
|---|---|
| **terça 15/09** | teste do relógio · disparar as mensagens para fonoaudiólogos · decidir o nome |
| **quarta 16/09** | entrevistas · gravar o `ingest.py` ou cortar o plano do terminal |
| **quinta 17/09** | roteiro para o mentor assíncrono (**a mentoria expira dia 18**, e é pelo Discord, não pelo Calendly) · preencher `[NÚMERO]` e `[CITAÇÃO 1]` |
| **sexta 18/09** | ensaio cronometrado bloco a bloco · ajuste com o retorno do mentor |
| **sábado 19/09** | gravar, editar e **subir no YouTube como não listado** · testar o link em aba anônima, em outro aparelho e em outra conta, no mesmo dia |
| **domingo 20/09** | submeter de manhã |

O vídeo sobe sábado, não domingo. Link ausente ou quebrado é a única desclassificação automática de
todo o regulamento (item 6.2.2.2).
