import os
from PIL import Image

pub_dir = r"C:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing\public"
for f in sorted(os.listdir(pub_dir)):
    if "favicon" in f or "icon" in f:
        path = os.path.join(pub_dir, f)
        if f.endswith((".png", ".ico", ".jpg")):
            try:
                im = Image.open(path)
                print(f"{f}: size={im.size}, mode={im.mode}, format={im.format}")
            except Exception as e:
                print(f"{f}: error {e}")
        else:
            print(f"{f}: size={os.path.getsize(path)} bytes")
