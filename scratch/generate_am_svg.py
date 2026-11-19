import base64
import os

base_dir = r"c:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing"
png_path = os.path.join(base_dir, "public", "favicon-am-512.png")
svg_path = os.path.join(base_dir, "public", "favicon-am.svg")

with open(png_path, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0e1c2e"/>
      <stop offset="100%" stop-color="#04070c"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="512" height="512" />
</svg>'''

with open(svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Generated {svg_path}, size: {len(svg_content)} chars")
