import os
import colorsys
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

BASE_DIR = r"c:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing"
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch")

# Load base clean transparent diamond
diamond_path = os.path.join(SCRATCH_DIR, "diamond_clean_transparent.png")
diamond_orig = Image.open(diamond_path).convert("RGBA")

# Font helpers
def get_font(size, bold=True):
    try:
        font_path = "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
        return ImageFont.truetype(font_path, size)
    except:
        return ImageFont.load_default()

# 1. Color shift helper for diamond emblem
def recolor_emblem(img, target_hue):
    arr = np.array(img).astype(float)
    rgb = arr[:, :, :3] / 255.0
    alpha = arr[:, :, 3]
    
    val = np.max(rgb, axis=2)
    sat = (val - np.min(rgb, axis=2)) / (val + 1e-6)
    
    out_rgb = np.zeros_like(rgb)
    h, w = img.size[1], img.size[0]
    for y in range(h):
        for x in range(w):
            if alpha[y, x] > 5:
                r, g, b = colorsys.hsv_to_rgb(target_hue, sat[y, x], val[y, x])
                out_rgb[y, x] = [r, g, b]
                
    out_arr = np.zeros_like(arr)
    out_arr[:, :, :3] = out_rgb * 255.0
    out_arr[:, :, 3] = alpha
    return Image.fromarray(np.clip(out_arr, 0, 255).astype(np.uint8))

diamond_cyan = diamond_orig
diamond_emerald = recolor_emblem(diamond_orig, 0.38) # Emerald Green (~137°)

# 2. Generator for App Icons (512x512)
def create_app_icon(mode="main", size=512):
    # mode: "main" (web/search console), "taller" (cyan/indigo), "cotizador" (emerald)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if mode == "taller":
        bg_center = (12, 22, 38)
        bg_edge = (6, 9, 15)
        glow_color = (0, 190, 255, 65)
        border_color = (0, 180, 255, 120)
        badge_bg = (10, 28, 48, 230)
        badge_border = (0, 200, 255, 180)
        badge_text_color = (230, 245, 255)
        badge_text = "TALLER & CAJA"
        active_diamond = diamond_cyan
    elif mode == "cotizador":
        bg_center = (10, 32, 22)
        bg_edge = (5, 15, 10)
        glow_color = (16, 217, 140, 65)
        border_color = (34, 197, 94, 120)
        badge_bg = (12, 42, 26, 230)
        badge_border = (34, 197, 94, 180)
        badge_text_color = (235, 255, 242)
        badge_text = "PRESUPUESTADOR"
        active_diamond = diamond_emerald
    else: # "main"
        bg_center = (10, 18, 30)
        bg_edge = (5, 8, 14)
        glow_color = (0, 195, 255, 70)
        border_color = (0, 180, 255, 110)
        badge_text = None
        active_diamond = diamond_cyan
        
    # Draw rounded squircle / background
    corner_r = int(size * 0.22)
    # radial background on temp image
    bg = Image.new("RGB", (size, size), bg_edge)
    for y in range(size):
        for x in range(size):
            dx = (x - size / 2) / (size / 2)
            dy = (y - size / 2) / (size / 2)
            dist = min(1.0, math.sqrt(dx * dx + dy * dy))
            r = int(bg_center[0] * (1 - dist) + bg_edge[0] * dist)
            g = int(bg_center[1] * (1 - dist) + bg_edge[1] * dist)
            b = int(bg_center[2] * (1 - dist) + bg_edge[2] * dist)
            bg.putpixel((x, y), (r, g, b))
            
    # Rounded mask for squircle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    margin = 8
    mask_draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=corner_r, fill=255)
    
    img.paste(bg, (0, 0), mask)
    
    # Glow behind diamond
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_r = int(size * 0.32)
    cx, cy = size // 2, int(size * (0.44 if badge_text else 0.5))
    glow_draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=glow_color)
    glow = glow.filter(ImageFilter.GaussianBlur(radius=int(size * 0.12)))
    img = Image.alpha_composite(img, glow)
    
    # Paste centered diamond
    target_dw = int(size * 0.72)
    target_dh = int(target_dw * (active_diamond.height / active_diamond.width))
    diamond_resized = active_diamond.resize((target_dw, target_dh), Image.Resampling.LANCZOS)
    
    dx = (size - target_dw) // 2
    dy = cy - (target_dh // 2)
    img.alpha_composite(diamond_resized, (dx, dy))
    
    # Draw badge if tool icon
    if badge_text:
        badge_font = get_font(int(size * 0.052), bold=True)
        # calculate text size
        dummy = ImageDraw.Draw(img)
        bbox = dummy.textbbox((0, 0), badge_text, font=badge_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        
        bw = tw + int(size * 0.09)
        bh = th + int(size * 0.04)
        bx = (size - bw) // 2
        by = int(size * 0.82)
        
        # badge layer
        b_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(b_layer)
        b_draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh // 2, fill=badge_bg, outline=badge_border, width=2)
        b_draw.text((bx + (bw - tw) // 2, by + (bh - th) // 2 - 2), badge_text, font=badge_font, fill=badge_text_color)
        img = Image.alpha_composite(img, b_layer)
        
    # Draw subtle luxury border around the entire squircle
    border_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border_layer)
    b_draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=corner_r, outline=border_color, width=3)
    img = Image.alpha_composite(img, border_layer)
    
    return img

print("Generating App Icons...")
# Generate App Icons
icon_main_512 = create_app_icon("main", 512)
icon_taller_512 = create_app_icon("taller", 512)
icon_cotizador_512 = create_app_icon("cotizador", 512)

# Save main favicons
icon_main_512.save(os.path.join(PUBLIC_DIR, "favicon-am-512.png"))
icon_main_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "favicon-am-192.png"))
icon_main_512.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "favicon-am-48.png"))
icon_main_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "favicon-am-32.png"))
icon_main_512.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "favicon-am-16.png"))
icon_main_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "favicon-am.png"))
icon_main_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "apple-touch-icon-am.png"))

# Multi-resolution ICO
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
ico_imgs = [icon_main_512.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_imgs[0].save(os.path.join(PUBLIC_DIR, "favicon-am.ico"), format="ICO", sizes=ico_sizes)

# Save tool icons
icon_taller_512.save(os.path.join(PUBLIC_DIR, "icon-taller.png"))
icon_taller_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "apple-touch-icon-taller.png"))

icon_cotizador_512.save(os.path.join(PUBLIC_DIR, "icon-cotizador.png"))
icon_cotizador_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "apple-touch-icon-cotizador.png"))

print("Icons saved successfully!")

# 3. Generator for WhatsApp Link Preview (1200x630 OG Banner)
print("Generating WhatsApp OG Banner (1200x630)...")
W, H = 1200, 630
og = Image.new("RGB", (W, H), (6, 9, 14))

# Create sleek dark gradient with radial spotlight on left
for y in range(H):
    for x in range(W):
        # radial spotlight from (320, 315)
        dx = (x - 320) / 450.0
        dy = (y - 315) / 350.0
        dist = math.sqrt(dx * dx + dy * dy)
        glow = max(0.0, 1.0 - dist)
        
        # base gradient from left to right
        base_t = x / float(W)
        r = int(8 * (1 - base_t) + 4 * base_t + 18 * glow)
        g = int(16 * (1 - base_t) + 7 * base_t + 45 * glow)
        b = int(28 * (1 - base_t) + 12 * base_t + 75 * glow)
        og.putpixel((x, y), (min(255, r), min(255, g), min(255, b)))

og = og.convert("RGBA")

# Draw high-end framing and ambient glow
og_draw = ImageDraw.Draw(og)

# Large ambient cyan glow behind the emblem
glow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_overlay)
glow_draw.ellipse([140, 140, 500, 500], fill=(0, 200, 255, 60))
glow_overlay = glow_overlay.filter(ImageFilter.GaussianBlur(radius=60))
og = Image.alpha_composite(og, glow_overlay)

# Paste diamond emblem on left
diamond_w = 420
diamond_h = int(diamond_w * (diamond_cyan.height / diamond_cyan.width))
diamond_og = diamond_cyan.resize((diamond_w, diamond_h), Image.Resampling.LANCZOS)
emblem_x = 90
emblem_y = (H - diamond_h) // 2
og.alpha_composite(diamond_og, (emblem_x, emblem_y))

# Draw text content on right side
content_x = 550

# Fonts
font_tag = get_font(20, bold=True)
font_title = get_font(42, bold=True)
font_subtitle = get_font(24, bold=False)
font_badge = get_font(18, bold=True)
font_footer = get_font(20, bold=False)
font_domain = get_font(22, bold=True)

# Top badge: Location & Detailing
tag_text = "VILLA MARÍA, CÓRDOBA • DETALLADO AUTOMOTRIZ"
t_bbox = og_draw.textbbox((0, 0), tag_text, font=font_tag)
t_w = t_bbox[2] - t_bbox[0]
t_h = t_bbox[3] - t_bbox[1]
tag_bg = [content_x, 80, content_x + t_w + 32, 80 + t_h + 18]
og_draw.rounded_rectangle(tag_bg, radius=16, fill=(12, 28, 48, 220), outline=(0, 200, 255, 140), width=1)
# cyan dot
og_draw.ellipse([content_x + 12, 80 + 10, content_x + 20, 80 + 18], fill=(0, 220, 255))
og_draw.text((content_x + 26, 80 + 8), tag_text, font=font_tag, fill=(180, 230, 255))

# Main Title: 2 lines
og_draw.text((content_x, 140), "AM CENTRO DE", font=font_title, fill=(255, 255, 255))
og_draw.text((content_x, 192), "ESTÉTICA VEHICULAR", font=font_title, fill=(0, 210, 255))

# Subtitle / Specialties
og_draw.text((content_x, 260), "Tratamientos Cerámicos • Corrección de Pintura", font=font_subtitle, fill=(220, 230, 242))
og_draw.text((content_x, 295), "Polarizados de Alta Gama • Protección PPF", font=font_subtitle, fill=(160, 185, 210))

# 3 Feature Pills
pills = [
    ("🛡️  Tratamientos 9H & Gyeon®", (15, 30, 50), (0, 180, 255, 100)),
    ("✨  Pulido & Restauración Óptima", (15, 30, 50), (0, 180, 255, 100)),
    ("💎  Turnos & Cotizaciones Online", (18, 40, 32), (34, 197, 94, 140)),
]
pill_y = 350
for p_text, p_bg, p_border in pills:
    p_box = og_draw.textbbox((0, 0), p_text, font=font_badge)
    pw = p_box[2] - p_box[0] + 28
    ph = p_box[3] - p_box[1] + 16
    og_draw.rounded_rectangle([content_x, pill_y, content_x + pw, pill_y + ph], radius=12, fill=p_bg, outline=p_border, width=1)
    og_draw.text((content_x + 14, pill_y + 7), p_text, font=font_badge, fill=(240, 245, 252))
    pill_y += ph + 12

# Bottom bar
div_y = 540
og_draw.line([content_x, div_y, W - 80, div_y], fill=(30, 48, 70), width=1)

# Rating and domain
og_draw.text((content_x, div_y + 18), "⭐ 5.0 en Google Reviews", font=font_footer, fill=(255, 205, 60))
og_draw.text((W - 380, div_y + 18), "amesteticavehicular.com.ar", font=font_domain, fill=(0, 215, 255))

# Save OG image as optimized JPEG (target < 250KB for WhatsApp)
og_rgb = og.convert("RGB")
og_path = os.path.join(PUBLIC_DIR, "og-am-centro.jpg")
og_rgb.save(og_path, format="JPEG", quality=92, optimize=True)
print("Saved og-am-centro.jpg, size:", os.path.getsize(og_path), "bytes")
