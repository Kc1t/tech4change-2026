# Decisões já tomadas

Para não serem rediscutidas. Quem discordar de alguma, discuta com o grupo — mas não reabra sozinho.

---

## Produto

**O sistema não entrega a palavra, entrega a escada.** A quantidade de degraus é configuração do
fonoaudiólogo: de zero (entrega direta, modo conversa) até a escada inteira (modo treino). Isso
resolve a tensão prótese × terapia que um professor de fono vai levantar — concede o ponto e
devolve o controle para o profissional.

**O indicador de sucesso é o degrau médio caindo.** É uma ferramenta feita para deixar de ser
necessária.

**A escada encurta sozinha.** Destravou no degrau 4, da próxima vez começa no 3
(`startingLevel()` em `src/domain/ladder.ts`).

**Portão de confiança fonológico.** A pista sonora só sai acima de `PHONOLOGICAL_CONFIDENCE_GATE`
(0,62). Abaixo disso a escada para no degrau semântico. Errar no semântico é barato e reversível;
pista fonêmica errada pode induzir perseveração e bloquear o alvo correto.

**A família confirma uma vez, não preenche formulário toda semana.** É por isso que produtos
parecidos são abandonados.

**A tela de revisão nunca fala com o servidor.** Ela é a única que sabe que o rosto agrupado como
"Pessoa 1" é a Letícia, e essa ligação é exatamente o dado que o servidor não pode ver. As
confirmações ficam no `localStorage`. Isso não é economia de trabalho — é a arquitetura. A tela de
consentimento, ao contrário, grava no servidor, porque lá o que se registra é *que* houve
autorização, não o conteúdo.

---

## Arquitetura

**O servidor nunca recebe palavra nenhuma.** O aparelho manda uma projeção do grafo — identificador
opaco, tipo do nó, chaves de atributo, arestas com peso. O servidor devolve identificadores e o
aparelho resolve de volta em texto. O schema de entrada recusa qualquer coisa que não seja
identificador opaco, e um nome próprio volta com `400`.

**O aplicativo nunca espera a rede.** A escada determinística aparece no mesmo quadro do toque; a
versão ranqueada substitui depois, se chegar em 2,5 s. Se não chegar, ninguém percebe. A tela diz
qual caminho rodou.

**Toda aresta carrega proveniência.** Se o modelo citar uma ligação que não existe no grafo, a
resposta inteira é rejeitada. Consequência: o sistema não consegue inventar uma parente.

**Sem monorepo.** Três aplicações independentes (`src/`, `server/`, `landing/`), cada uma com seu
`package.json` e seu deploy. Decisão explícita do Kauã para facilitar o deploy.

**Vercel para aplicação e landing, Railway para a API.** Não usar Fly.io.

**O backend segue o padrão do hattrick** (`D:\kauam\Documents\Github\World Cup Hacka\backend`):
feature-first em `src/modules/<feature>/` com `dto/`, infra como irmã em `common/`, `database/`,
`health/`.

**O relógio é cliente direto da API**, pelo próprio Wi-Fi, e não depende de um app Android no
celular. Evita escrever um app nativo só para usar a Data Layer do Wear.

---

## Código

**Identificadores, nomes de arquivo e comentários em inglês. Texto de interface em português.**

**Sem comentários explicativos.** Nem JSDoc em helpers, mocks, fixtures e testes. Nem comentário de
seção. O código se explica pelos nomes; o raciocínio vai na resposta do chat ou na descrição do PR.
Exceção única: algo genuinamente não dedutível do código — workaround de bug externo com link,
restrição de negócio invisível, pegadinha de API de terceiro.

**Sem commit, push, tag ou release sem autorização do Kauã naquele momento.** Mudar só o working
tree e parar.

**Nada de operação destrutiva no GitHub** (delete, `push --delete`, force) sem autorização na hora.

**Mensagem de commit sem coautoria.** Nada de `Co-Authored-By`, `Claude-Session` ou
`Generated with`. Autor e committer sempre `Kauã Miguel <endman987@gmail.com>`.

---

## Design

**Sem gradiente. Sem visual "vibecoded".** Papel quente, âmbar, `Newsreader` para voz e `Archivo`
para interface. Painéis com dado real, e quando o dado é simulado a etiqueta fica visível.

**Alvo mínimo de 48 px, um toque, sem gesto composto, nada na borda direita.** Apraxia atinge cerca
de metade das pessoas com lesão no hemisfério esquerdo, e negligência espacial direita vai de 17% a
65%.

**Redundância de canal.** Nenhum canal é confiável sozinho: presbiacusia atinge dois terços dos
maiores de 70, e déficit somatossensorial vai de 50% a 80%.

**Sem estado de erro visível.** Se a validação falhar, se o modelo demorar, se não houver chave — cai
na escada determinística e segue.

**shadcn é usado como primitiva, não como estética.** Os tokens do shadcn foram remapeados para a
paleta do produto; `--brand` (âmbar) é separado de `--accent` (superfície discreta de hover). O
visual padrão do shadcn está na lista de anti-referências, junto com Duolingo e gradiente
roxo-azul.

---

## Pitch

**Estrutura Rock New Ventures** (do material da FIAP): logo e slogan · problema · solução · tamanho
de mercado · concorrentes · modelo de receita · equipe · mensagem de impacto. Faltam nela, e são
exigidos pelo regulamento: público impactado, diferencial, validação e resultados esperados.

**Nenhum pagador institucional existe no Brasil, e isso é dito no pitch.** O SUS paga R$ 10,90 por
sessão individual de fonoaudiologia e os CIDs do procedimento nem incluem R47.0 (afasia).
Teleatendimento em reabilitação: R$ 0,00. Em 1.251 avaliações da CONITEC entre 2012 e 2026, nenhum
software terapêutico foi analisado. Nada no Rol da ANS.

O preço fecha sem reembolso: **R$ 119/mês** para o fonoaudiólogo, **R$ 59/mês** para a família. Se
o reembolso vier um dia, é ganho, não premissa.

**É dispositivo médico, e isso não é escondido.** A RDC 657/2022 lista reabilitação entre as
exclusões de bem-estar. Pela Regra 11 da RDC 751/2022 é Classe I, por notificação — cerca de 30
dias, sem análise técnica prévia. Estar notificado é barreira de entrada.

**Curatela não alcança saúde e privacidade** (LBI art. 85 §1º). Nenhum familiar consente pelo
titular. Por isso a tela de consentimento é uma pergunta por vez, com pictograma, áudio e resposta
binária.

---

## Marca

**O nome é `Eilo`.** Decidido em 15/09. "Ei-lo" é o que se diz quando a coisa aparece — o som do
achado, não o da procura — e guarda **elo** dentro dele. Foi escolhido contra `Vau`, `Deixa`,
`Meada`, `Mote` e `Ponta`.

Dois candidatos foram descartados por motivo que não é estético:

- **`Deixa`** — como imperativo quer dizer *"larga isso"*. Um produto para quem travou numa palavra
  não pode se chamar "desiste".
- **`Ailo`** — abre com o som `ai`, a interjeição de dor. Num produto pós-AVC, isso não se desfaz.

**Nada de mascote animal.** Adultos com afasia já são tratados como crianças o tempo inteiro — é uma
das principais indignidades da condição, e fonoaudiólogo percebe de longe. Um bichinho simpático
queima a marca justamente com quem compra. Se algum dia entrar animal, que seja **pomba-correio**,
porque o significado é *navegação de volta*.

**Elefante está proibido.** "Memória de elefante" é o reflexo óbvio e desmente a tese central:
afasia **não é** problema de memória. A palavra não sumiu — o caminho até ela sumiu.

Marcas desenhadas e testadas a 16 px:
https://claude.ai/code/artifact/14d0c47c-3dfe-40f6-b979-1cca4db2648a

Recomendação registrada: **Espectro** para o ícone (é a única que fala de voz, acontece no tempo e
sobrevive em uma cor só), **Vão** onde a cor é garantida, **Pingo** como assinatura ao lado da
palavra.
