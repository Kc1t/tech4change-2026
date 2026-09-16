from dataclasses import dataclass
from pathlib import Path


@dataclass
class Segment:
    path: Path
    start: float
    end: float
    text: str


class Transcriber:
    def __init__(self, size: str = "base") -> None:
        self.backend = "nenhum"
        self.reason = ""
        self._model = None

        try:
            import whisper

            self._model = whisper.load_model(size)
            self.backend = f"whisper-{size}"
        except Exception as error:
            self.reason = type(error).__name__

    @property
    def available(self) -> bool:
        return self._model is not None

    def run(self, path: Path) -> list[Segment]:
        if self._model is None:
            return []

        try:
            result = self._model.transcribe(str(path), language="pt", fp16=False)
        except Exception:
            return []

        segments = []
        for item in result.get("segments", []):
            text = str(item.get("text", "")).strip()
            if not text:
                continue
            segments.append(
                Segment(
                    path=path,
                    start=float(item.get("start", 0.0)),
                    end=float(item.get("end", 0.0)),
                    text=text
                )
            )
        return segments
