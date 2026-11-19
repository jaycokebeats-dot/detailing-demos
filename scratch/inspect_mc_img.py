from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing\public\favicon-mcdetail-48.png")
arr = np.array(im)
print("Shape:", arr.shape)
# Count distinct colors
colors = set(tuple(p) for row in arr for p in row)
print("Number of unique colors:", len(colors))
# Find dominant colors
from collections import Counter
counts = Counter(tuple(p) for row in arr for p in row)
for color, count in counts.most_common(5):
    print(f"Color {color}: {count} pixels ({count / (48*48) * 100:.1f}%)")
