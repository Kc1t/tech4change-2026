import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path

from .phonology import first_syllable, syllables

LADDER_ORDER = [
    "family", "category", "generation", "region",
    "city", "place", "use", "shape", "color", "event"
]


def _cueable(label: str) -> bool:
    return label.isalpha() and len(label) > 2


def node_id(label: str, kind: str) -> str:
    digest = hashlib.sha256(f"{label}|{kind}".encode("utf-8")).hexdigest()[:6]
    return f"n_{digest}"


def edge_id(source: str, target: str, relation: str) -> str:
    digest = hashlib.sha256(f"{source}|{target}|{relation}".encode("utf-8")).hexdigest()[:4]
    return f"e_{digest}"


@dataclass
class Builder:
    owner_label: str
    owner_kind: str = "person"
    nodes: dict = field(default_factory=dict)
    edges: list = field(default_factory=list)
    dropped: int = 0

    def __post_init__(self) -> None:
        self.owner = self.add(self.owner_label, self.owner_kind, {}, phonetic=False)

    def add(
        self,
        label: str,
        kind: str,
        attrs: dict[str, str],
        aliases: list[str] | None = None,
        phonetic: bool = True
    ) -> str:
        identifier = node_id(label, kind)
        existing = self.nodes.get(identifier)

        if existing:
            existing["attrs"].update(attrs)
            if aliases:
                existing["aliases"] = sorted(set(existing.get("aliases", [])) | set(aliases))
            return identifier

        node = {
            "id": identifier,
            "label": label,
            "kind": kind,
            "attrs": attrs,
            "layout": {"x": 0.5, "y": 0.5}
        }
        if aliases:
            node["aliases"] = sorted(set(aliases))
        if phonetic and _cueable(label):
            node["phon"] = {"syllables": syllables(label), "firstSyllable": first_syllable(label)}

        self.nodes[identifier] = node
        return identifier

    def link(
        self,
        source: str,
        target: str,
        relation: str,
        weight: float,
        provenance: list[dict]
    ) -> str | None:
        if not provenance:
            self.dropped += 1
            return None

        identifier = edge_id(source, target, relation)
        for edge in self.edges:
            if edge["id"] == identifier:
                edge["provenance"].extend(provenance)
                return identifier

        self.edges.append({
            "id": identifier,
            "from": source,
            "to": target,
            "rel": relation,
            "weight": round(weight, 3),
            "provenance": provenance
        })
        return identifier

    def layout(self) -> None:
        import math

        others = [i for i in self.nodes if i != self.owner]
        self.nodes[self.owner]["layout"] = {"x": 0.5, "y": 0.5}

        for index, identifier in enumerate(others):
            angle = (index / max(len(others), 1)) * math.tau
            radius = 0.32 if index % 2 == 0 else 0.42
            self.nodes[identifier]["layout"] = {
                "x": round(0.5 + math.cos(angle) * radius, 3),
                "y": round(0.5 + math.sin(angle) * radius * 0.86, 3)
            }

    def ladder_plans(self) -> dict:
        plans = {}
        for identifier, node in self.nodes.items():
            if identifier == self.owner:
                continue

            linked = [e for e in self.edges if identifier in (e["from"], e["to"])]
            if not linked:
                continue

            ordered = sorted(
                node["attrs"],
                key=lambda a: LADDER_ORDER.index(a) if a in LADDER_ORDER else len(LADDER_ORDER)
            )
            if not ordered:
                continue

            plans[identifier] = [
                {"attr": attr, "edge": linked[min(i, len(linked) - 1)]["id"]}
                for i, attr in enumerate(ordered)
            ]

        return plans

    def write(self, destination: Path) -> dict:
        self.layout()
        graph = {
            "owner": self.owner,
            "nodes": self.nodes,
            "edges": self.edges,
            "ladderPlans": self.ladder_plans()
        }
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(
            json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        return graph
