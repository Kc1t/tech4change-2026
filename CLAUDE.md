# Leia `docs/ESTADO.md` antes de tocar em qualquer coisa

Hackathon Tech4Change 2026 (FIAP PosTech). Entrega **domingo 20/09/2026, 23:59**.
Aplicativo que ajuda quem teve AVC a alcançar a palavra que travou, no segundo em que ela falta.

Produto: **Eilo** — "ei-lo", *aqui está*. Nome decidido e já aplicado no código.

| Quer… | Abra |
|---|---|
| saber onde as coisas estão **agora** e o que é perigoso | [`docs/ESTADO.md`](docs/ESTADO.md) |
| entender o projeto do zero | [`docs/CONTEXTO.md`](docs/CONTEXTO.md) |
| saber o que falta e em que ordem | [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md) |
| não rediscutir o que já foi decidido | [`docs/DECISOES.md`](docs/DECISOES.md) |
| o plano de gravação do vídeo | [`docs/VIDEO.md`](docs/VIDEO.md) |

Pesquisa, pitch e roteiro falado estão em [`research/`](research/) — **dentro do repositório,
mas fora do git** (está no `.gitignore`). É material do grupo, não entra em commit.

## Armadilhas do estado atual

1. **Nada está commitado.** O `git log` tem 3 commits antigos; todo o trabalho atual está só no
   working tree. Não existe ponto de retorno — construa **ao lado**, nunca substituindo no lugar,
   e pare antes de qualquer `rm -rf` sem backup.
2. **O Vite não existe mais.** `src/`, `index.html`, `vite.config.ts` e o `package.json` da raiz
   foram removidos em 16/09. O aplicativo é o `web/` (Next). A raiz não tem mais `package.json`:
   cada projeto roda do seu próprio diretório.
3. **Dependência que só funcionava por hoist.** O `web/` usava `zustand` sem declarar, resolvendo
   do `node_modules` da raiz. Já corrigido — mas se algo mais quebrar com "module not found",
   é provável que seja o mesmo caso.

## Regras que não se negociam

1. **Não commitar, dar push, criar tag ou publicar release sem autorização do Kauã naquele
   momento.** Mudar o working tree e parar.
2. **Nenhuma operação destrutiva no git ou no GitHub** (delete, `push --delete`, `--force`) sem
   autorização na hora.
3. **Mensagem de commit sem trailer de coautoria.** Autor e committer sempre
   `Kauã Miguel <endman987@gmail.com>`.
4. **Sem comentário explicativo no código.** Nem JSDoc em helper, mock, fixture ou teste. O
   raciocínio vai na resposta do chat, nunca no arquivo. Exceção: workaround de bug externo com
   link, restrição de negócio invisível, pegadinha de API de terceiro.
5. **Identificadores, nomes de arquivo e comentários em inglês. Texto de interface em português.**
6. **Nunca deixar um `[NOME]`, `[NÚMERO]` ou `[CITAÇÃO]` aparecer em material que vai ser gravado
   ou entregue.**
7. **Não derrubar nem reiniciar dev server que já esteja rodando.** Aplicar mudança por HMR.

## Estrutura

```
web/        aplicação Next 16 — App Router, React 19, shadcn   (O APLICATIVO)
mobile/     aplicação React Native — Expo SDK 57, Reanimated   (celular de verdade)
landing/    página pública — Next 16, rotas / e /experience
server/     API — NestJS 11, Prisma, PostgreSQL
watch/      prova de conceito Wear OS em Kotlin, NUNCA COMPILADA
ingest/     pipeline Python de ingestão — roda; `input/` está vazia
docs/       estado, contexto, pendências, decisões, vídeo, deploy
```

Aplicações independentes, sem monorepo. Cada uma tem seu `package.json` e seu deploy.

```bash
cd web && npm run dev       # aplicativo,  :3010
cd mobile && npx expo start # React Native (`--web` para o alvo web)
cd landing && npm run dev   # landing,     :5174
cd server && npm run dev    # API,         :3333
```

`ANTHROPIC_API_KEY` é opcional — sem chave tudo funciona pela escada determinística, e isso é
intencional e testado.

## Antes de dizer que terminou

`npx tsc --noEmit` e `npm run build` em todos os projetos que você tocou.
Em `server/`, `npm run test:guardrails` **exige `npm run build` antes** — ele roda `dist/main.js`.
