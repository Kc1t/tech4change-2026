# Prova de conceito — Wear OS

Aplicativo mínimo para Galaxy Watch. **Não foi compilado nem instalado em nenhum relógio.** É código
escrito para demonstrar a arquitetura, e precisa do SDK do Android para virar APK.

## Por que ele existe

O aplicativo principal é uma página web. Uma página web consegue mandar uma notificação, e o Android
espelha essa notificação no relógio pareado — isso funciona hoje, sem nenhum código novo, e é o
caminho usado na demonstração. Só que o espelhamento tem dois limites que não dá para contornar
pelo navegador:

1. **Não há controle do padrão de vibração.** A notificação usa o padrão do sistema. A distinção
   entre degrau 1, degrau 2 e pista sonora — que é o argumento central do produto — desaparece.
2. **Latência de 100 a 500 ms.** Boa o suficiente para avisar, ruim o suficiente para sincronizar
   com a dica sonora.

Um aplicativo nativo resolve os dois. `CuePatterns.kt` é exatamente essa diferença: padrões de onda
com amplitude controlada, um por nível de degrau.

## A decisão de arquitetura

O relógio **não depende de um aplicativo no celular.** Ele fala direto com a mesma API em `server/`,
pelo Wi-Fi do próprio relógio, com o mesmo contrato de projeção — identificadores opacos, sem
palavra nenhuma na rede. Os rótulos ficam em `LifeGraph.kt`, no relógio.

Isso evita ter que escrever um aplicativo Android para o celular só para usar a Data Layer do Wear,
e mostra que a API serve mais de um cliente.

## Como construir

Precisa do Android SDK 35 e do JDK 17. A máquina onde isto foi escrito tem apenas `licenses` e
`system-images` em `%LOCALAPPDATA%\Android\Sdk` — **falta platform-tools, build-tools e platforms**,
então o primeiro build vai baixar alguns gigabytes.

```bash
cd watch
./gradlew assembleDebug -PapiUrl=http://192.168.15.5:3333 -PsessionCode=1234
adb -s <watch-id> install app/build/outputs/apk/debug/app-debug.apk
```

`sessionCode` é opcional. Com ele, o relógio entra na sessão de sync assim que abre e passa a receber
as dicas que o celular emite, em tempo real. Sem ele, o relógio funciona sozinho: toque avança a
escada local e a primeira chamada pede o ranqueamento para a API.

O relógio precisa estar em modo desenvolvedor e pareado por ADB sobre Wi-Fi. `apiUrl` tem que ser o
IP da máquina na rede local, não `localhost` — `localhost` no relógio é o próprio relógio.

## O que ele faz

Toque em qualquer lugar da tela avança um degrau, com o padrão de vibração daquele nível. O botão
`Consegui` fecha o ciclo e passa para a próxima palavra. A primeira chamada pede a escada ranqueada
para a API; se a rede falhar ou demorar mais de 2,5 s, a escada local continua valendo e ninguém
percebe.

## Estado

| Arquivo | Estado |
|---|---|
| `CuePatterns.kt` | escrito, não compilado |
| `LifeGraph.kt` | escrito, não compilado |
| `CueClient.kt` | escrito, não compilado |
| `CueActivity.kt` | escrito, não compilado |
| `SyncClient.kt` | escrito, não compilado — entra na sessão por código e escuta o SSE |
| layout e recursos | escritos, não compilados |

Nenhum destes arquivos foi validado por compilador. Trate como esboço de arquitetura até que o
primeiro `assembleDebug` passe.
