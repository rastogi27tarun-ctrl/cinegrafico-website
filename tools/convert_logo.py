from __future__ import annotations

from pathlib import Path

from PIL import Image


def main() -> None:
    src = Path(
        r"C:\Users\admin\.cursor\projects\d-cursor-project\assets\c__Users_admin_AppData_Roaming_Cursor_User_workspaceStorage_46f26019ce877b329ea7d56dee76f26f_images_cinegrafico_studio_logo_-_white-5db12bea-3924-412e-ab79-a55b0601664b.png"
    )
    dst = Path(r"D:\cursor project\assets\cinegrafico-logo.png")

    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size

    out = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    out_px = out.load()

    # White logo on black background:
    # - Use brightness as alpha to preserve anti-aliased edges
    # - Force RGB to white for a crisp mark on any background
    cutoff = 18
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            alpha = max(r, g, b)
            if alpha < cutoff:
                out_px[x, y] = (255, 255, 255, 0)
            else:
                out_px[x, y] = (255, 255, 255, alpha)

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, format="PNG", optimize=True)
    print(f"Wrote {dst}")


if __name__ == "__main__":
    main()

