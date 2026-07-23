#!/usr/bin/env python3

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "skills" / "how-to-read"
TARGET = ROOT / "dist" / "how-to-read.skill"


def main() -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(TARGET, "w", ZIP_DEFLATED) as archive:
        for file in sorted(SOURCE.rglob("*")):
            if file.is_file() and "__pycache__" not in file.parts:
                archive.write(file, Path("how-to-read") / file.relative_to(SOURCE))
    print(f"Created {TARGET}")


if __name__ == "__main__":
    main()
