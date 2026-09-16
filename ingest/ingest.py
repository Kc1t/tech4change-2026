import argparse
import sys
import time
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from steps import exif, faces, transcribe
from steps.graph import Builder

PHOTO_SUFFIXES = {".jpg", ".jpeg", ".png", ".heic", ".webp"}
AUDIO_SUFFIXES = {".m4a", ".mp3", ".wav", ".ogg", ".opus", ".flac"}


class Report:
    def __init__(self) -> None:
        self.started = time.time()

    def step(self, name: str) -> None:
        print(f"\n\033[1m{name}\033[0m", flush=True)

    def line(self, text: str) -> None:
        print(f"  {text}", flush=True)

    def skip(self, text: str) -> None:
        print(f"  \033[33mpulado\033[0m  {text}", flush=True)

    def done(self, graph: dict, dropped: int) -> None:
        elapsed = time.time() - self.started
        kinds = Counter(node["kind"] for node in graph["nodes"].values())
        print(f"\n\033[1mgrafo\033[0m", flush=True)
        self.line(f"{len(graph['nodes'])} nós  " + "  ".join(f"{k}:{v}" for k, v in kinds.items()))
        self.line(f"{len(graph['edges'])} arestas, todas com proveniência")
        if dropped:
            self.line(f"{dropped} arestas descartadas por não ter proveniência")
        self.line(f"{len(graph['ladderPlans'])} escadas pré-montadas")
        print(f"\n  concluído em {elapsed:.1f}s", flush=True)


def collect(root: Path, suffixes: set[str]) -> list[Path]:
    if not root.exists():
        return []
    return sorted(p for p in root.rglob("*") if p.suffix.lower() in suffixes)


def run(source: Path, destination: Path, owner: str) -> int:
    report = Report()
    builder = Builder(owner_label=owner)

    photos = collect(source, PHOTO_SUFFIXES)
    audios = collect(source, AUDIO_SUFFIXES)

    report.step("entrada")
    report.line(f"{len(photos)} fotos, {len(audios)} áudios em {source}")

    if not photos and not audios:
        report.skip(f"nada para processar — coloque arquivos em {source}")
        return 1

    report.step("exif · lugar e data")
    shots = [exif.read(path) for path in photos]
    located = [s for s in shots if s.located]
    dated = [s for s in shots if s.taken_at]
    report.line(f"{len(dated)} fotos com data, {len(located)} com coordenada")

    trips = exif.group_by_trip(shots)
    if trips:
        report.line(f"{len(trips)} blocos de viagem por proximidade de data")
        for trip in trips:
            if len(trip) < 4:
                continue
            first = trip[0].taken_at
            last = trip[-1].taken_at
            label = f"Viagem de {first:%d/%m/%Y}"
            node = builder.add(label, "event", {
                "category": "é uma viagem",
                "event": f"entre {first:%d/%m} e {last:%d/%m}"
            })
            builder.link(builder.owner, node, "travelled_to", 0.7, [{
                "source": "photo",
                "ref": trip[0].path.name,
                "detail": f"{len(trip)} fotos entre {first:%d/%m/%Y} e {last:%d/%m/%Y}"
            }])
    else:
        report.skip("nenhuma foto tinha data legível no EXIF")

    report.step("visão computacional · rostos")
    detector = faces.Detector()
    if not detector.available:
        report.skip("insightface indisponível — nenhum rosto agrupado")
        found: list[faces.Face] = []
    else:
        report.line(f"backend {detector.backend}")
        found = []
        for path in photos:
            found.extend(detector.detect(path))
        report.line(f"{len(found)} rostos detectados em {len(photos)} fotos")

    report.step("machine learning · agrupamento")
    clusters, method = faces.cluster(found)
    if not clusters:
        report.skip(f"sem agrupamento — {method}")
    else:
        report.line(f"método: {method}")
        report.line(f"{len(clusters)} pessoas distintas")
        for order, group in enumerate(clusters, start=1):
            if group.size < 3:
                continue
            label = f"Pessoa {order}"
            node = builder.add(label, "person", {
                "family": "é da família",
                "generation": "a confirmar"
            })
            builder.link(builder.owner, node, "appears_with", min(0.95, group.size / 40), [{
                "source": "photo",
                "ref": group.paths[0].name,
                "detail": f"{group.size} fotos com o mesmo rosto"
            }])
            report.line(f"  {label}: {group.size} fotos — rótulo a confirmar pela família")

    report.step("transcrição · áudios")
    if not audios:
        report.skip("nenhum áudio na entrada")
    else:
        transcriber = transcribe.Transcriber()
        if not transcriber.available:
            report.skip(f"whisper indisponível ({transcriber.reason})")
        else:
            report.line(f"backend {transcriber.backend}")
            total = 0
            for path in audios:
                segments = transcriber.run(path)
                total += len(segments)
                report.line(f"{path.name}: {len(segments)} trechos")
            report.line(f"{total} trechos transcritos")

    report.step("relações · modelo de linguagem")
    report.skip("sem ANTHROPIC_API_KEY — nenhuma relação extraída do texto")

    graph = builder.write(destination)
    report.done(graph, builder.dropped)
    print(f"  escrito em {destination}", flush=True)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Monta o grafo de vida a partir do aparelho.")
    parser.add_argument("--input", type=Path, default=Path(__file__).parent / "input")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).parent.parent / "web" / "src" / "data" / "graph.json"
    )
    parser.add_argument("--owner", default="Helena")
    args = parser.parse_args()

    return run(args.input, args.output, args.owner)


if __name__ == "__main__":
    raise SystemExit(main())
