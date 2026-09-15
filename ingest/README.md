# Pipeline de ingestao

Roda offline e produz `../src/data/graph.json`.

## Etapas

| Passo | Entrada | Saida | Tecnica |
|---|---|---|---|
| `steps/exif.py` | fotos | nos de lugar e data | EXIF + geocodificacao reversa |
| `steps/faces.py` | fotos | clusters de pessoa | InsightFace (visao computacional) + HDBSCAN (ML) |
| `steps/transcribe.py` | audios | texto com timestamp | Whisper |
| `steps/relations.py` | texto + conversa | triplas com proveniencia | LLM |
| `steps/phonology.py` | rotulos | separacao silabica | regras de pt-BR |

## Uso

```bash
pip install -r requirements.txt
python ingest.py --input entrada/ --output ../src/data/graph.json
```

Toda aresta produzida carrega `provenance` — fonte, referencia e detalhe.
Aresta sem proveniencia e descartada.
