# Estado agora — leia antes de tocar em qualquer coisa

Briefing de abertura de sessão. Última atualização: **16/09/2026, madrugada**.
Entrega: **domingo 20/09/2026, 23:59** — faltam 4 dias.

Para entender o projeto do zero, vá para [`CONTEXTO.md`](CONTEXTO.md). Este arquivo é só o que
mudou e o que está perigoso **agora**.

---

## As três coisas que quebram alguém que chegou agora

### 1. O Vite foi removido. Só existe Next e React Native

Em 16/09, a pedido do Kauã, `src/`, `index.html`, `vite.config.ts`, `public/` e o `package.json`
da raiz foram **apagados**. A raiz não tem mais aplicação nem `package.json`.

| | onde | stack | porta |
|---|---|---|---|
| aplicativo | `web/` | Next 16.3.5 + React 19 + shadcn | 3010 |
| celular | `mobile/` | Expo SDK 57 + RN 0.86 + Reanimated | 8081 |
| landing | `landing/` | Next 16, rotas `/` e `/experience` | 5174 |

A armadilha dos dois aplicativos **acabou**. Antes de editar tela, o único alvo web é `web/`.

Backup do app Vite e da landing Vite ficou no diretório de scratchpad da sessão de 16/09 — não
está no repositório e **não sobrevive a um reboot**. Se precisar de algo de lá, é agora.

### 2. Nada está commitado

`git log` tem **3 commits antigos**. Todo o working tree — as telas, o server, a landing, o
ingest, os docs, o app Next, o app React Native — **não tem ponto de retorno**.

Regra do repositório: não commitar sem autorização do Kauã naquele momento. E, com o Vite já
apagado, um `rm -rf` errado agora custa trabalho que não existe em lugar nenhum. Faça backup
antes, e **pare o dev server antes de mover arquivo** — no Windows ele segura o diretório e o
`mv` falha em silêncio.

### 3. Dependências que só funcionavam por hoist

O `web/` usava `zustand` sem declarar no próprio `package.json`; funcionava porque o
`node_modules` da raiz o fornecia. Ao apagar a raiz, o build quebrou com "module not found".
Já corrigido. Se outro "module not found" aparecer, suspeite da mesma causa antes de qualquer
outra coisa.

## O que foi feito em 16/09

**Identidade visual portada do `hero-mobile.html`.** Tela creme `#f2f2f0`, tinta `#161616`,
Manrope em tudo (Newsreader e Archivo saíram), acento rosa `#bf3f63` e a aurora
`#fbd9c4 / #f39a6b / #d8577c / #6b3f8f / #ffe3a8`. Modo escuro **removido** — a referência se
compromete com a tela creme, e agora o projeto também. Mesmos tokens nos três projetos, com o
nome divergindo só onde o shadcn obriga: `--accent` virou `--brand` no `web/` e na `landing/`.

Um token novo, `--label: #6b6b68`, existe porque o `#9a9a98` da referência dá 2,2:1 de contraste
sobre o creme. As legendas usam ele; o `--faint` continua no valor da referência para decorativo.

**A home ganhou a estrutura da referência.** Cópia à esquerda no alto, bola sangrando por baixo
(`bottom:-34%`, `width:150%`), pill de vidro embaixo à esquerda, cabeçalho com marca e
hambúrguer. Os seletores de ajuda e saída perderam as caixas e os subtítulos — viraram texto com
o ativo num pill de vidro; os hints foram para `aria-label` e o alvo de toque continua 48px.

O `Orb` deixou de ser `<canvas>` e virou DOM: quatro blobs desfocados em `drift`, grão por cima,
`breathe` parado e `talk` falando. A reatividade ao microfone foi preservada — o `levelRef`
alimenta um `requestAnimationFrame` que escreve `--level` num wrapper que escala.

**Landing migrada para Next**, no lugar, com as duas páginas virando rotas (`/` e `/experience`).
Fontes por `next/font`, `'use client'` nos cinco componentes com hook de navegador,
`import.meta.env.VITE_APP_URL` → `process.env.NEXT_PUBLIC_APP_URL`. Os componentes shadcn
importavam `cn` de um pacote npm homônimo; agora apontam para `@/lib/utils`.

**App React Native criado em `mobile/`** (Expo SDK 57, RN 0.86). O domínio inteiro — `ladder`,
`phonology`, `projection`, `seed`, `types` — foi **sem adaptação nenhuma**, só tem import
relativo. A goma lá é `react-native-svg` com gradientes radiais, porque RN não tem blur de CSS em
view arbitrária. Home completa, com `expo-haptics` e `expo-speech`.

> **O que o RN ainda não tem:** a escuta (`useListening` é Web Audio puro e precisa virar
> `expo-audio` com metering), as telas de Grafo, Corpo, Clínico e Consentimento, os dois canvases,
> o sync entre aparelhos e a semente por URL. É o maior buraco aberto do projeto.

**Vite removido** da raiz e da landing, a pedido do Kauã.

## O que foi feito em 15/09

**Calibração de ruído na escuta** (`src/hooks/useListening.ts`). Os limiares eram RMS absolutos
(`0.055` / `0.03`), o que fazia o app **não disparar nunca, e em silêncio**, em sala com ruído de
fundo acima de 0,03 — exatamente o cenário "celular no centro da mesa". Agora mede o piso de ruído
nos primeiros 900 ms e deriva os limiares dele, reajustando enquanto ninguém fala. Dois estados
novos aparecem na tela: `ajustando ao ambiente` e o aviso de ambiente alto demais.

Continua sem existir: **diarização**. Qualquer pessoa na mesa que pausar 1,3 s dispara a pista.

**Semente pela landing.** A landing ganhou a seção `#testar` com três perguntas (seu nome, alguém
que você vê toda semana, a cidade dessa pessoa). As respostas viram um link para o app com a
semente **no fragmento da URL** — que por especificação nunca é enviado ao servidor. O app monta o
grafo no aparelho: 3 nós, 2 arestas, identificadores opacos por sha256, proveniência
`família · você respondeu no primeiro acesso`.

> Com o Vite fora, sobrou um formato só: `#seed=…`, lido pelo Next.
> A landing monta o link em `landing/components/seed-form.tsx`, agora via
> `NEXT_PUBLIC_APP_URL`. O app React Native ainda **não lê semente**.

**Silabificador portado para TypeScript** (`src/domain/phonology.ts`), com paridade verificada
contra o Python em 27 palavras. E uma correção nos dois lados: quando a primeira sílaba tem uma
letra só, a pista se estende — `Ubatuba` dava `"U…"`, que não é pista. Agora dá `"Uba"`. Com trava
para nunca entregar a palavra inteira: `Ana` continua `"A"`.

**Auditoria dos documentos de pitch** (agora em `research/`, fora do git). Ver a tabela em
[`PENDENCIAS.md`](PENDENCIAS.md). A correção com consequência de pitch: o denominador de
fonoaudiólogos passou de 61.054 para **9.158 de neuro adulto**, o que torna a meta do ano 3
visivelmente mais dura — de "2,9% do país" para "um em cada cinco". É o número honesto.

**Migração para Next + shadcn** (`web/`). Três bugs que só apareceram rodando, todos corrigidos:
o canvas do Grafo perdeu o âmbar em silêncio (colisão de token), a interface mandava "Defina
VITE_API_URL", e a semente ia quebrar sem rota em hash.

---

## Figma

Arquivo: `UV0UdjzOZYEiKb41RKjY2S` — as 7 telas capturadas nos nós `12:2` a `18:2`.

Foram capturadas do app **Vite**, em **1920×954 desktop**, com o shell de 440px centralizado. Não
são artboards de celular. Para virar tela mobile de verdade, recapturar do Next com `figmaselector`
apontando para o shell.

Dois servidores MCP do Figma configurados, e isso confunde:

| onde | estado |
|---|---|
| plugin `figma@claude-plugins-official`, escopo user | autenticado, **é o que funciona**, traz as skills |
| `poc/.mcp.json` | criado a pedido, nasce não-autenticado |

---

## Como rodar

```bash
cd web && npm run dev             # aplicativo (Next), :3010
cd mobile && npx expo start       # React Native; --web para o alvo web, :8081
cd server && npm run dev          # API, :3333
cd landing && npm run dev         # landing (Next), :5174
cd server && npm run test:guardrails   # exige npm run build antes
```

Variável de ambiente: `NEXT_PUBLIC_API_URL` no app, `NEXT_PUBLIC_APP_URL` na landing.

**Erro `0xc0000142` no build do Next** não é bug de código: é o Windows recusando criar processo
por exaustão. Feche abas do Chrome ou derrube um dos dev servers duplicados e rode de novo.

---

## O que falta, por ordem de retorno

O maior retorno na nota **não é código**. A análise de ponto por hora colocou "construir mais MVP"
em 19º entre 20 ações.

| prazo | o quê |
|---|---|
| **quinta 18/09** | **a mentoria expira** — é pelo Discord, não pelo Calendly |
| hoje | entrevistas com fonoaudiólogos — critério 5 vale 20% e é onde estamos piores |
| hoje | decidir se `Eilo` entra no código; sobrenomes do Adriel e do Alessandro |
| quarta | fotos com EXIF em `ingest/input/` (está **vazia**) ou cortar o plano do terminal do vídeo |
| **sábado 19/09** | **gravar, editar e subir no YouTube como não listado** — link quebrado é a única desclassificação automática do regulamento (6.2.2.2) |
| domingo | submeter de manhã |

Buracos de código conhecidos: `watch/` nunca compilado (SDK do Wear são ~8 GB), o caminho do modelo
nunca bateu na API real (falta `ANTHROPIC_API_KEY`), o service worker **não tem cache** — o app
instala mas não abre offline, e as sessões de sync vivem na memória do processo.

Detalhe completo em [`PENDENCIAS.md`](PENDENCIAS.md).
