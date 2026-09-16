# O que aparece na tela, bloco a bloco

O roteiro falado está em [`../research/ROTEIRO_VIDEO.md`](../research/ROTEIRO_VIDEO.md). Este documento é a
outra metade: **o que a câmera mostra enquanto cada bloco é narrado.**

## A regra que organiza tudo

São 5 minutos e muita coisa para dizer. Não cabe um passeio pelo aplicativo. Então:

> **Só um bloco é demonstração de verdade — o bloco 4.** Todo o resto é imagem correndo por baixo da
> narração, em cortes de 3 a 6 segundos, sem nunca parar para explicar a interface.

Se um plano precisa que o narrador explique o que é, ele não entra.

## O que filmar como demo

Duas coisas, e só:

1. **O assistente de fala** — a bolha escutando, a frase travando, a escada saindo.
2. **A ponte entre aparelhos** — o código de sessão na tela e a mesma dica acendendo no segundo
   aparelho ao mesmo tempo.

Tudo o mais do aplicativo (grafo, consentimento, revisão, painel clínico) entra como corte rápido
por baixo de narração que já está falando de outra coisa.

---

## Mapa de planos

### Bloco 1 · A dor · 0:00 – 0:30
Sem aplicativo. Mãos folheando álbum, depois preto com uma linha de texto.
Não mostrar tela nenhuma aqui — é o único trecho em que a pausa vale mais que a informação.

### Bloco 2 · Escala e público · 0:30 – 0:55
Três números entrando um por vez, fonte em corpo menor embaixo.
Sem aplicativo.

### Bloco 3 · Por que o que existe não resolve · 0:55 – 1:20
Três cards. Se houver tempo de captura, **4 s** de um concorrente real (Constant Therapy ou
Lingraphica) mostrando exercício de vocabulário genérico — vale mais que qualquer card desenhado.

---

### Bloco 4 · A solução e a demonstração · 1:20 – 2:40

O bloco que estoura. São 80 segundos e ele carrega o produto inteiro. Dividir assim:

| tempo | plano | narração |
|---|---|---|
| 1:20 – 1:32 | **Captura do celular.** Home, bolha escutando, anéis reagindo à voz de verdade. | "No segundo em que a palavra trava…" |
| 1:32 – 1:40 | Mesma captura. A frase trava. A bolha muda de estado sozinha. | "…o sistema já tem os últimos dez segundos na memória — e não guardou nenhum deles." |
| 1:40 – 2:05 | **Demonstração, sem narração por cima.** A escada saindo degrau a degrau dentro da bolha, cada uma aparecendo e sumindo. Terminar em "Letícia". | silêncio |
| 2:05 – 2:12 | **Câmera externa no pulso**, ou dois aparelhos lado a lado com o código de sessão visível. O degrau acende nos dois ao mesmo tempo. | "E a dica sai no fone e no pulso, sem que ninguém na mesa perceba." |
| 2:12 – 2:20 | Volta para a captura. Os dois seletores — Entrega / Dica / Escada e Voz / Texto / Ambos. Dois toques. | "Quem decide quanta ajuda é o fonoaudiólogo. De entregar a palavra a treinar a escada inteira." |
| 2:20 – 2:30 | **Terminal**, 4 s, `ingest.py` agrupando rostos e lendo EXIF. Depois o grafo, 4 s, a ramificação nascendo. | "Esse mapa não foi digitado por ninguém." |
| 2:30 – 2:40 | Grafo, lente Aprendizado, o nó mudando de cor. | "Cada acerto ajusta o próximo. Da próxima vez a dica começa um degrau mais longe." |

**O plano de 1:40 a 2:05 é o vídeo inteiro.** Se algo tiver que ser regravado dez vezes, é esse.

### Bloco 5 · O diferencial · 2:40 – 3:10
Texto: primeiro o que não é diferencial, riscado; depois o que é.
**3 s** do `400` da API recusando um nome próprio, com o JSON na tela:

```
POST /v1/cue/rank  { "activeNodes": ["Letícia"] }
→ 400  identifiers must be opaque
```

É o plano mais barato e mais convincente do vídeo. A privacidade deixa de ser promessa e vira coisa
que a banca vê acontecendo.

### Bloco 6 · Validação · 3:10 – 3:35
Evidências com fonte. Print do formulário e a citação.
**Ainda tem `[NÚMERO]` e `[CITAÇÃO 1]` por preencher.** Nunca deixar um colchete aparecer em tela.

### Bloco 7 · Modelo de negócio · 3:35 – 4:10
Números e estrutura de preço. Sem aplicativo.
Se sobrar plano: **3 s** do painel do fonoaudiólogo, só o gráfico do degrau médio caindo.

### Bloco 8 · Maturidade e próximos passos · 4:10 – 4:35
Enquadramento e roadmap em uma linha.
**4 s** do painel clínico, agora inteiro, com a etiqueta "dados simulados" visível — mostrar a
etiqueta é mais forte que escondê-la.

### Bloco 9 · Fechamento · 4:35 – 4:45
Preto, uma linha por vez. Sem aplicativo.

---

## Como capturar

**Tela do celular:** `scrcpy` já está instalado na máquina
(`%LOCALAPPDATA%\Microsoft\WinGet\Packages\Genymobile.scrcpy...`). Espelha o Android no desktop e
grava limpo, sem filmar a tela com câmera. É o caminho.

```bash
scrcpy --record=demo.mp4 --no-audio --max-size=1080
```

**Pulso:** câmera externa. Vibração não filma — ela aparece de três formas: o relógio acendendo, o
indicador na tela e a reação da pessoa.

**Gravar em Android, Chrome.** A Vibration API não existe no Safari do iPhone, e a bolha depende de
`getUserMedia` com permissão concedida.

---

## O plano do relógio: o que é real hoje

Existem três caminhos. O vídeo pode usar qualquer um, e o primeiro é o mais fácil de filmar.

**0. Modo sync pela API — funciona hoje, testado.**
Tela Corpo → "Abrir uma sessão" → sai um código de quatro dígitos. Em outro aparelho, abrir
`/#/watch` e digitar o código. A partir daí o toque no celular acende o degrau no segundo aparelho
em tempo real, com vibração. É o plano mais fácil de gravar: dois aparelhos na mesa, o código
visível na tela, e a dica aparecendo nos dois. Não depende de relógio nenhum.

**1. Notificação espelhada — funciona hoje, zero código novo.**
O Android espelha notificações do celular no relógio pareado. `notifyWatch()` em
`src/channels/index.ts` já faz isso, agora pelo service worker, que é o caminho confiável.
Limites: sem controle do padrão de vibração, e 100 a 500 ms de latência.

**2. Aplicativo nativo Wear OS — escrito, nunca compilado.**
`watch/`, em Kotlin, falando direto com a API pelo Wi-Fi do relógio. Resolve os dois limites acima.
Custa instalar o SDK do Android (a máquina só tem `licenses` e `system-images`, faltam
platform-tools, build-tools e platforms) e parear o relógio em modo desenvolvedor. **Não fazer isso
antes de sábado.** É risco puro numa semana sem folga.

> ### O teste que decide o plano de 2:05
>
> Abrir a tela **Corpo**, ligar o relógio, tocar em testar. Se o pulso vibrar, o plano existe. Se não
> vibrar, o bloco 4 perde 7 segundos e a narração do relógio vira "no fone", só.
>
> **Esse teste precisa ser feito antes de qualquer outra coisa desta semana.** É um botão, leva
> trinta segundos, e decide se vale gastar tempo com o resto.
