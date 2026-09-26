"""Shared, conservative source-tree helpers."""
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", "venv", ".venv", "__pycache__", "dist", "build", "coverage", ".next"}
SOURCE_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".php", ".java", ".go", ".rb"}


def source_files(root: Path):
    if not root.exists():
        return []
    return sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in SOURCE_SUFFIXES and not SKIP_DIRS.intersection(p.parts))


def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""
