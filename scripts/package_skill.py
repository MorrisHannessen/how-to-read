#!/usr/bin/env python3

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "skills" / "how-to-read"
TARGET = ROOT / "dist" / "how-to-read.skill"
ARCHIVE_TIMESTAMP = (1980, 1, 1, 0, 0, 0)
FILE_MODE = 0o100644


def add_file(archive: ZipFile, file: Path) -> None:
    relative = file.relative_to(SOURCE)
    archive_path = (Path("how-to-read") / relative).as_posix()
    info = ZipInfo(archive_path, ARCHIVE_TIMESTAMP)
    info.compress_type = ZIP_DEFLATED
    info.create_system = 3
    info.external_attr = FILE_MODE << 16
    archive.writestr(info, file.read_bytes())


def main() -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(TARGET, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for file in sorted(SOURCE.rglob("*"), key=lambda item: item.as_posix()):
            if file.is_file() and "__pycache__" not in file.parts:
                add_file(archive, file)
    print(f"Created {TARGET}")


if __name__ == "__main__":
    main()
