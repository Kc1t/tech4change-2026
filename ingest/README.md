# Pipeline de ingestão

Roda offline, lê o que já existe no aparelho e produz `../src/data/graph.json`.

```bash
pip install -r requirements.txt
python ingest.py --input input/ --owner Helena
```

Sem argumentos ele lê `ingest/input/` e escreve em `src/data/graph.json`.

## Regra do terminal

**A saída nunca afirma algo que não aconteceu.** Se uma biblioteca não está instalada, se não há
áudio na entrada ou se falta chave de API, a etapa imprime `pulado` com o motivo, em vez de números
inventados. Isso importa porque o roteiro do vídeo prevê filmar este terminal.

## Etapas

| Passo | Técnica | Estado |
|---|---|---|
| `steps/exif.py` | EXIF de data e GPS, agrupamento de viagem por proximidade de data | **funciona** |
| `steps/faces.py` | InsightFace para detecção e embedding | depende do modelo baixado; degrada com aviso |
| `steps/faces.py` — agrupamento | HDBSCAN quando instalado; senão aglomerativo por cosseno, em numpy | **funciona**, e diz qual dos dois usou |
| `steps/transcribe.py` | Whisper, pt-BR, com timestamp por trecho | **funciona** quando o modelo carrega |
| `steps/phonology.py` | separação silábica por regras de pt-BR | **funciona** |
| `steps/graph.py` | monta o grafo, identificadores opacos, proveniência obrigatória | **funciona** |
| relações a partir do texto | modelo de linguagem | **não implementado** — precisa de `ANTHROPIC_API_KEY` |

Geocodificação reversa (coordenada → nome de cidade) também **não** está implementada. O EXIF extrai
a coordenada; transformar em "Sorocaba" ainda depende de um serviço externo.

## Garantias

**Identificador opaco.** Cada nó recebe `n_` mais seis hex de `sha256(rótulo|tipo)`. O rótulo fica
só no aparelho. A mesma função roda no Python e no aplicativo, então os identificadores batem.

**Proveniência obrigatória.** `Builder.link()` recusa aresta sem proveniência e conta quantas
descartou. Toda aresta que sobrevive sabe de qual foto, áudio ou mensagem veio.

**Pista sonora só em palavra única.** Um nó chamado "Viagem de 20/12/2025" não ganha `phon` — data
não tem primeira sílaba útil como dica.

**Nada é rotulado sozinho.** O agrupamento de rostos produz "Pessoa 1", "Pessoa 2", com a contagem
de fotos. Quem diz que Pessoa 1 é a Letícia é a família, na tela de revisão do primeiro acesso.

## Para filmar

O plano do vídeo é de 3 a 4 segundos deste terminal. Ele precisa de entrada real — fotos com EXIF
de data em `ingest/input/`. Com a pasta vazia a saída é honesta e inútil para filmar:
`pulado — nada para processar`.
