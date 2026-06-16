import os
from pathlib import Path

# Config
EXTENSIONS = {'.png', '.jpg', '.jpeg'}  # treat jpeg as jpg if present
START = 1

def main():
    p = Path('.')
    # Collect files in a stable order
    files = [f for f in sorted(p.iterdir()) if f.is_file() and f.suffix.lower() in EXTENSIONS]
    if not files:
        print("No image files found.")
        return

    # Step 1: temporary rename to avoid collisions
    temp_names = []
    for i, f in enumerate(files):
        temp = p / f".renametmp_{i}"
        f.rename(temp)
        temp_names.append((temp, f.suffix.lower()))

    # Step 2: rename to final sequential names
    n = START
    for temp, suffix in temp_names:
        # normalize .jpeg to .jpg
        ext = '.jpg' if suffix == '.jpeg' else suffix
        dst = p / f"{n}{ext}"
        # If destination exists (unlikely), increment until free
        while dst.exists():
            n += 1
            dst = p / f"{n}{ext}"
        temp.rename(dst)
        print(f"Renamed -> {dst.name}")
        n += 1

if __name__ == '__main__':
    main()
