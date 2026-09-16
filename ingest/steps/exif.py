from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PIL import Image, ExifTags

TAGS = {value: key for key, value in ExifTags.TAGS.items()}
GPS_TAGS = {value: key for key, value in ExifTags.GPSTAGS.items()}


@dataclass
class Shot:
    path: Path
    taken_at: datetime | None
    latitude: float | None
    longitude: float | None

    @property
    def located(self) -> bool:
        return self.latitude is not None and self.longitude is not None


def read(path: Path) -> Shot:
    taken_at = None
    latitude = None
    longitude = None

    try:
        with Image.open(path) as image:
            exif = image.getexif()
            raw = exif.get(TAGS.get("DateTimeOriginal")) or exif.get(TAGS.get("DateTime"))
            if isinstance(raw, str):
                taken_at = _parse_date(raw)

            gps = exif.get_ifd(TAGS.get("GPSInfo", 34853))
            if gps:
                latitude = _coordinate(gps, "GPSLatitude", "GPSLatitudeRef")
                longitude = _coordinate(gps, "GPSLongitude", "GPSLongitudeRef")
    except Exception:
        pass

    return Shot(path=path, taken_at=taken_at, latitude=latitude, longitude=longitude)


def _parse_date(raw: str) -> datetime | None:
    for pattern in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(raw, pattern)
        except ValueError:
            continue
    return None


def _coordinate(gps: dict, value_tag: str, ref_tag: str) -> float | None:
    value = gps.get(GPS_TAGS.get(value_tag))
    ref = gps.get(GPS_TAGS.get(ref_tag))
    if not value:
        return None

    try:
        degrees, minutes, seconds = (float(part) for part in value)
    except (TypeError, ValueError):
        return None

    decimal = degrees + minutes / 60 + seconds / 3600
    if ref in ("S", "W"):
        decimal = -decimal
    return decimal


def group_by_trip(shots: list[Shot], gap_days: int = 2) -> list[list[Shot]]:
    dated = sorted((s for s in shots if s.taken_at), key=lambda s: s.taken_at)
    if not dated:
        return []

    trips: list[list[Shot]] = [[dated[0]]]
    for shot in dated[1:]:
        previous = trips[-1][-1]
        if (shot.taken_at - previous.taken_at).days > gap_days:
            trips.append([shot])
        else:
            trips[-1].append(shot)

    return trips
