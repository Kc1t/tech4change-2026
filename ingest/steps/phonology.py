import unicodedata

VOWELS = set("aeiouáéíóúâêôãõàü")
DIGRAPHS = ("ch", "lh", "nh", "qu", "gu")
CLUSTERS = (
    "bl", "br", "cl", "cr", "dl", "dr", "fl", "fr",
    "gl", "gr", "pl", "pr", "tl", "tr", "vl", "vr"
)
SPLIT_PAIRS = ("rr", "ss", "sc", "sç", "xc", "xs")


def _is_vowel(char: str) -> bool:
    return char.lower() in VOWELS


def syllables(word: str) -> list[str]:
    text = word.strip()
    if not text:
        return []

    lowered = text.lower()
    breaks: list[int] = []
    i = 0

    while i < len(lowered):
        if not _is_vowel(lowered[i]):
            i += 1
            continue

        j = i + 1
        while j < len(lowered) and _is_vowel(lowered[j]) and _hiatus(lowered[i:j + 1]) is False:
            j += 1

        consonants = j
        while consonants < len(lowered) and not _is_vowel(lowered[consonants]):
            consonants += 1

        run = lowered[j:consonants]
        if consonants >= len(lowered):
            break

        breaks.append(j + _onset_start(run))
        i = consonants

    pieces: list[str] = []
    previous = 0
    for point in breaks:
        if point > previous:
            pieces.append(text[previous:point])
            previous = point
    pieces.append(text[previous:])

    return [piece for piece in pieces if piece]


def _hiatus(pair: str) -> bool:
    if len(pair) < 2:
        return False
    first, second = pair[-2], pair[-1]
    strong = set("aeoáéóâêô")
    return first in strong and second in strong


def _onset_start(run: str) -> int:
    if not run:
        return 0
    if len(run) == 1:
        return 0

    tail = run[-2:]
    if tail in DIGRAPHS or tail in CLUSTERS:
        return len(run) - 2
    if tail in SPLIT_PAIRS:
        return len(run) - 1
    return len(run) - 1


def first_syllable(word: str) -> str:
    parts = syllables(word)
    if not parts:
        return word[:2]
    if len(parts[0]) == 1 and len(parts) > 2:
        return parts[0] + parts[1]
    return parts[0]


def slug(text: str) -> str:
    normalised = unicodedata.normalize("NFKD", text)
    stripped = "".join(c for c in normalised if not unicodedata.combining(c))
    return "".join(c if c.isalnum() else "_" for c in stripped.lower()).strip("_")
