from dataclasses import dataclass, field
from pathlib import Path

import numpy as np


@dataclass
class Face:
    path: Path
    embedding: np.ndarray


@dataclass
class Cluster:
    index: int
    faces: list[Face] = field(default_factory=list)

    @property
    def size(self) -> int:
        return len(self.faces)

    @property
    def paths(self) -> list[Path]:
        return [face.path for face in self.faces]


class Detector:
    def __init__(self) -> None:
        self.backend = "nenhum"
        self._app = None

        try:
            from insightface.app import FaceAnalysis

            self._app = FaceAnalysis(providers=["CPUExecutionProvider"])
            self._app.prepare(ctx_id=-1, det_size=(640, 640))
            self.backend = "insightface"
        except Exception as error:
            self.reason = type(error).__name__

    @property
    def available(self) -> bool:
        return self._app is not None

    def detect(self, path: Path) -> list[Face]:
        if self._app is None:
            return []

        try:
            import cv2

            image = cv2.imread(str(path))
            if image is None:
                return []
            found = self._app.get(image)
        except Exception:
            return []

        faces = []
        for item in found:
            embedding = getattr(item, "normed_embedding", None)
            if embedding is None:
                continue
            faces.append(Face(path=path, embedding=np.asarray(embedding, dtype=np.float32)))
        return faces


def cluster(faces: list[Face], threshold: float = 0.42) -> tuple[list[Cluster], str]:
    if not faces:
        return [], "sem rostos"

    try:
        import hdbscan

        matrix = np.stack([face.embedding for face in faces])
        labels = hdbscan.HDBSCAN(min_cluster_size=3, metric="euclidean").fit_predict(matrix)
        return _collect(faces, labels), "hdbscan"
    except ImportError:
        pass

    matrix = np.stack([face.embedding for face in faces])
    labels = _agglomerative(matrix, threshold)
    return _collect(faces, labels), "aglomerativo por cosseno (hdbscan ausente)"


def _agglomerative(matrix: np.ndarray, threshold: float) -> np.ndarray:
    normalised = matrix / np.clip(np.linalg.norm(matrix, axis=1, keepdims=True), 1e-8, None)
    labels = np.full(len(normalised), -1, dtype=int)
    centroids: list[np.ndarray] = []

    for index, vector in enumerate(normalised):
        if not centroids:
            centroids.append(vector.copy())
            labels[index] = 0
            continue

        similarity = np.stack(centroids) @ vector
        best = int(np.argmax(similarity))

        if 1 - similarity[best] <= threshold:
            labels[index] = best
            members = normalised[labels == best]
            centroid = members.mean(axis=0)
            centroids[best] = centroid / max(float(np.linalg.norm(centroid)), 1e-8)
        else:
            centroids.append(vector.copy())
            labels[index] = len(centroids) - 1

    return labels


def _collect(faces: list[Face], labels: np.ndarray) -> list[Cluster]:
    groups: dict[int, Cluster] = {}
    for face, label in zip(faces, labels):
        if label < 0:
            continue
        groups.setdefault(int(label), Cluster(index=int(label))).faces.append(face)

    return sorted(groups.values(), key=lambda c: c.size, reverse=True)
