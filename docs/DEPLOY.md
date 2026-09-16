# Deploy — preparado, não executado

Nada foi publicado. Os arquivos de configuração existem e o deploy é um comando, mas publicar é
decisão do Kauã — o repositório está privado de propósito.

Três destinos independentes, sem monorepo:

| o quê | onde | diretório raiz |
|---|---|---|
| aplicação | Vercel | `/` (raiz do repositório) |
| landing | Vercel, projeto separado | `landing/` |
| API | Railway | `server/` |

---

## 1. API no Railway — faça esta primeiro

A aplicação precisa da URL dela, então a API sobe antes.

1. Novo projeto → Deploy from GitHub → `Kc1t/tech4change-2026`
2. Settings → **Root Directory = `server`**
3. Railway lê `server/railway.json` e constrói pelo `Dockerfile`. O healthcheck é `/v1/health`.
4. Adicione um **PostgreSQL** ao projeto. O Railway injeta `DATABASE_URL` sozinho.
5. Variáveis a definir na mão:

```
PORT=3333
CORS_ORIGINS=https://<app>.vercel.app,https://<landing>.vercel.app
SWAGGER_ENABLED=true
ANTHROPIC_API_KEY=<a chave>
CUE_MODEL=claude-sonnet-5
```

`ANTHROPIC_API_KEY` é opcional. Sem ela tudo funciona pela escada determinística — mas aí o caminho
do modelo, que é metade do argumento técnico, nunca roda em produção.

`MODEL_BASE_URL` só precisa ser definida se apontar para outro provedor (o OCI da Oracle, por
exemplo). O padrão é a Anthropic.

O `Dockerfile` roda `prisma migrate deploy` antes de subir. Se não houver migração criada ainda,
rode uma vez localmente com o `DATABASE_URL` do Railway:

```bash
cd server
DATABASE_URL="<url do railway>" npx prisma migrate dev --name init
```

**Sem banco a API sobe assim mesmo**, em modo degradado, guardando em memória. O `/v1/health`
responde `degraded` e diz qual peça está fora. Isso é intencional — o link precisa continuar de pé
durante toda a janela de avaliação.

## 2. Aplicação no Vercel

1. Import do mesmo repositório, **Root Directory = `/`**
2. O `vercel.json` já define framework, build e os cabeçalhos. O de `/sw.js` é o que importa: sem
   `Cache-Control: no-store` o service worker velho fica preso no navegador do jurado.
3. Variável de ambiente:

```
VITE_API_URL=https://<api>.up.railway.app
```

Ela é lida em tempo de build. **Mudou a URL da API, tem que refazer o build** — não basta salvar a
variável.

Depois do primeiro deploy, volte ao Railway e coloque o domínio real da Vercel em `CORS_ORIGINS`.

## 3. Landing no Vercel

Projeto separado, **Root Directory = `landing`**. Sem variáveis. O `landing/vercel.json` já está lá.

---

## Antes de mandar o link para a banca

- [ ] `https://<api>/v1/health` responde `ok` ou `degraded`, nunca erro
- [ ] `https://<api>/v1/docs` abre o Swagger
- [ ] O `400` de identificador não-opaco ainda acontece em produção — é o plano do bloco 5 do vídeo
- [ ] A aplicação abre no Chrome do Android e a bolha pede permissão de microfone
- [ ] `/#/watch` pareia com o código gerado na tela Corpo, entre dois aparelhos de verdade
- [ ] O app é instalável como PWA (o Chrome oferece "adicionar à tela inicial")
- [ ] Abrir tudo em aba anônima, em outro aparelho e em outra conta
- [ ] O `[NOME]` sumiu do cabeçalho da aplicação e da landing

## O que não sobrevive ao deploy

**As sessões de sync vivem na memória do processo.** Um restart do Railway derruba todas. Para a
demonstração isso não importa; para produção teria que ir para o Redis ou para o Postgres.

**O cache de escadas também depende do banco.** Sem Postgres a API funciona, mas todo pedido que o
modelo não responder cai direto no determinístico, sem reaproveitar plano anterior.
