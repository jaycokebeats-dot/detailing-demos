import os
from PIL import Image

pub_dir = r"C:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing\public"

# 1. Create favicon-mcdetail.ico
mc_512_path = os.path.join(pub_dir, "favicon-mcdetail-512.png")
mc_im = Image.open(mc_512_path).convert("RGBA")

# Ensure crisp square icon
mc_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
mc_ico_path = os.path.join(pub_dir, "favicon-mcdetail.ico")
mc_im.save(mc_ico_path, format="ICO", sizes=mc_sizes)
print("Created favicon-mcdetail.ico, size:", os.path.getsize(mc_ico_path))

# 2. Copy/Create favicon-platinum.ico from existing favicon.ico
plat_ico_source = os.path.join(pub_dir, "favicon.ico")
plat_ico_target = os.path.join(pub_dir, "favicon-platinum.ico")
if os.path.exists(plat_ico_source):
    with open(plat_ico_source, "rb") as fsrc:
        with open(plat_ico_target, "wb") as fdst:
            fdst.write(fsrc.read())
    print("Created favicon-platinum.ico, size:", os.path.getsize(plat_ico_target))
