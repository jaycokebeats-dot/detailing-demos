import math
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def make_favicons():
    print("Generating Favicon Suite...")
    # Load clean J emblem (RGBA)
    j_im = Image.open('public/logo/jds/j-clean.png').convert('RGBA')
    j_w, j_h = j_im.size

    # Master size 512x512
    size = 512
    fav = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fav)

    # Squircle background
    radius = 112
    bg_color = (9, 9, 12, 255)
    draw.rounded_rectangle([10, 10, size - 11, size - 11], radius=radius, fill=bg_color)

    # Red & Silver double stroke border
    draw.rounded_rectangle([10, 10, size - 11, size - 11], radius=radius, outline=(225, 29, 72, 190), width=4)
    draw.rounded_rectangle([14, 14, size - 15, size - 15], radius=radius - 3, outline=(255, 255, 255, 35), width=2)

    # Subtle ambient red glow behind J
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([70, 170, 440, 390], fill=(225, 29, 72, 110))
    glow = glow.filter(ImageFilter.GaussianBlur(35))
    fav.alpha_composite(glow)

    # Fit J in center: width 410, proportional height
    target_w = 410
    target_h = int(j_h * (target_w / j_w))
    j_resized = j_im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    pos_x = (size - target_w) // 2
    pos_y = (size - target_h) // 2

    fav.alpha_composite(j_resized, (pos_x, pos_y))

    # Save 512x512 master
    fav.save('public/favicon-jds-512.png', 'PNG')
    fav.save('public/logo/jds/favicon-jds-512.png', 'PNG')

    # Save multiple sizes
    for s in [16, 32, 48, 96, 180, 192]:
        resized = fav.resize((s, s), Image.Resampling.LANCZOS)
        if s == 180:
            resized.save('public/apple-touch-icon-jds.png', 'PNG')
            resized.save('public/logo/jds/apple-touch-icon.png', 'PNG')
        else:
            resized.save(f'public/favicon-jds-{s}.png', 'PNG')
            resized.save(f'public/logo/jds/favicon-jds-{s}.png', 'PNG')

    # Multi-resolution ICO (16, 32, 48)
    ico_16 = fav.resize((16, 16), Image.Resampling.LANCZOS)
    ico_32 = fav.resize((32, 32), Image.Resampling.LANCZOS)
    ico_48 = fav.resize((48, 48), Image.Resampling.LANCZOS)
    ico_16.save(
        'public/favicon-jds.ico',
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[ico_32, ico_48]
    )
    ico_16.save(
        'public/logo/jds/favicon.ico',
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[ico_32, ico_48]
    )
    print("PNG and ICO Favicons created.")

    # Vector SVG Favicon using OpenCV contours
    cv_im = cv2.imread('public/logo/jds/j-clean.png', cv2.IMREAD_UNCHANGED)
    b, g, r, a = cv2.split(cv_im)
    red_mask = ((r > 170) & (g < 80) & (b < 80) & (a > 100)).astype(np.uint8) * 255
    chrome_mask = ((a > 100) & ~((r > 170) & (g < 80) & (b < 80))).astype(np.uint8) * 255

    red_cnts, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_TC89_KCOS)
    chrome_cnts, _ = cv2.findContours(chrome_mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)

    scale = 1.15
    ox = (512 - j_w * scale) / 2
    oy = (512 - j_h * scale) / 2

    def to_svg(cnts):
        out = ""
        for c in cnts:
            if cv2.contourArea(c) > 40:
                pts = c.reshape(-1, 2)
                out += f"M {pts[0][0]*scale + ox:.1f} {pts[0][1]*scale + oy:.1f} "
                for p in pts[1:]:
                    out += f"L {p[0]*scale + ox:.1f} {p[1]*scale + oy:.1f} "
                out += "Z "
        return out

    red_path = to_svg(red_cnts)
    chrome_path = to_svg(chrome_cnts)

    svg_str = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#f1f5f9"/>
      <stop offset="70%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2e5b"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#3f3f46" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#e11d48" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <rect x="12" y="12" width="488" height="488" rx="112" fill="#09090c" stroke="url(#borderGrad)" stroke-width="4"/>
  <rect x="16" y="16" width="480" height="480" rx="108" fill="none" stroke="#27272a" stroke-width="2"/>
  <circle cx="230" cy="270" r="120" fill="#e11d48" opacity="0.12"/>

  <path d="{chrome_path.strip()}" fill="url(#chromeGrad)" fill-rule="evenodd"/>
  <path d="{red_path.strip()}" fill="url(#redGrad)"/>
</svg>'''

    with open('public/favicon-jds.svg', 'w', encoding='utf-8') as f:
        f.write(svg_str)
    with open('public/logo/jds/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_str)
    print("SVG Favicon created.")


def make_og_preview():
    print("Generating WhatsApp & Social OpenGraph Preview (1200x630)...")
    W, H = 1200, 630
    og = Image.new('RGB', (W, H), (7, 7, 9))
    draw = ImageDraw.Draw(og)

    # 1. Subtle background gradients & studio atmosphere
    # Subtle radial glow in the center-top behind the logo
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    # Red radial ambient
    glow_draw.ellipse([W//2 - 380, 80, W//2 + 380, 480], fill=(225, 29, 72, 45))
    # Deep slate center spotlight
    glow_draw.ellipse([W//2 - 450, 40, W//2 + 450, 420], fill=(255, 255, 255, 12))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    og.paste(glow, (0, 0), glow)

    # Subtle horizontal speed/studio lines
    for y_line in [70, 560]:
        draw.line([(60, y_line), (W - 60, y_line)], fill=(255, 255, 255, 20), width=1)
        # Red center accent tick
        draw.line([(W//2 - 60, y_line), (W//2 + 60, y_line)], fill=(225, 29, 72, 140), width=2)

    # Fonts
    font_segoe_bold = "C:/Windows/Fonts/segoeuib.ttf"
    font_segoe = "C:/Windows/Fonts/segoeui.ttf"

    font_badge = ImageFont.truetype(font_segoe_bold, 19)
    font_tagline = ImageFont.truetype(font_segoe_bold, 28)
    font_services = ImageFont.truetype(font_segoe_bold, 17)
    font_trust = ImageFont.truetype(font_segoe, 18)
    font_trust_bold = ImageFont.truetype(font_segoe_bold, 18)

    # 2. Top Location Pill
    badge_text = "TALLER DE ESTÉTICA DEL AUTOMOTOR  ·  VILLA BALLESTER"
    bbox_b = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw = bbox_b[2] - bbox_b[0] + 44
    bh = 38
    bx = (W - bw) // 2
    by = 92
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=19, fill=(18, 18, 24), outline=(225, 29, 72, 180), width=1)
    # Red dot
    draw.ellipse([bx + 16, by + 13, bx + 28, by + 25], fill=(225, 29, 72))
    draw.text((bx + 36, by + 8), badge_text, font=font_badge, fill=(244, 244, 245))

    # 3. Official Clean JDS Logo
    # jds-logo-full-clean.png is (1045, 312). Let's fit it at width ~540
    full_logo = Image.open('public/logo/jds/jds-logo-full-clean.png').convert('RGBA')
    logo_w, logo_h = full_logo.size
    target_logo_w = 560
    target_logo_h = int(logo_h * (target_logo_w / logo_w))
    logo_resized = full_logo.resize((target_logo_w, target_logo_h), Image.Resampling.LANCZOS)
    lx = (W - target_logo_w) // 2
    ly = 150
    og.paste(logo_resized, (lx, ly), logo_resized)

    # 4. Tagline
    tagline = "TU AUTO, EN LAS MEJORES MANOS"
    bbox_t = draw.textbbox((0, 0), tagline, font=font_tagline)
    tw = bbox_t[2] - bbox_t[0]
    tx = (W - tw) // 2
    ty = ly + target_logo_h + 20
    draw.text((tx, ty), tagline, font=font_tagline, fill=(255, 255, 255))

    # 5. Service Pills Row
    services = [
        "Tratamientos Cerámicos 9H",
        "PPF Film Protector",
        "Pulido & Corrección",
        "Limpieza de Motor a Vapor"
    ]
    pill_y = ty + 50
    total_pills_w = 0
    pill_boxes = []
    for s in services:
        tb = draw.textbbox((0, 0), s, font=font_services)
        sw = tb[2] - tb[0] + 32
        pill_boxes.append((s, sw))
        total_pills_w += sw
    gap = 14
    total_row_w = total_pills_w + gap * (len(services) - 1)
    cur_x = (W - total_row_w) // 2

    for s, pw in pill_boxes:
        draw.rounded_rectangle([cur_x, pill_y, cur_x + pw, pill_y + 36], radius=18, fill=(15, 15, 20), outline=(255, 255, 255, 35), width=1)
        # Small red tick
        draw.ellipse([cur_x + 12, pill_y + 13, cur_x + 20, pill_y + 21], fill=(225, 29, 72))
        draw.text((cur_x + 26, pill_y + 8), s, font=font_services, fill=(228, 228, 231))
        cur_x += pw + gap

    # 6. Bottom Trust Bar
    trust_items = [
        ("⭐ 5.0 en Google (20 opiniones)", (250, 204, 21)),
        ("•", (113, 113, 122)),
        ("🛡️ Garantía Escrita", (228, 228, 231)),
        ("•", (113, 113, 122)),
        ("🚗 Cuidado Artesanal Sin Atajos", (228, 228, 231)),
        ("•", (113, 113, 122)),
        ("📲 11 5451-4393", (52, 211, 153)),
    ]
    trust_line_y = pill_y + 58
    total_trust_w = 0
    trust_measures = []
    for text, color in trust_items:
        tb = draw.textbbox((0, 0), text, font=font_trust)
        tw = tb[2] - tb[0]
        trust_measures.append((text, color, tw))
        total_trust_w += tw
    trust_gap = 12
    total_row_w = total_trust_w + trust_gap * (len(trust_items) - 1)
    start_tx = (W - total_row_w) // 2

    for text, color, tw in trust_measures:
        draw.text((start_tx, trust_line_y), text, font=font_trust_bold if "11" in text or "5.0" in text else font_trust, fill=color)
        start_tx += tw + trust_gap

    # Outer border rim
    draw.rectangle([0, 0, W - 1, H - 1], outline=(39, 39, 42), width=2)
    # Red corner brackets for premium sporty detailing feel
    bracket_len = 28
    # Top-left
    draw.line([(0, 0), (bracket_len, 0)], fill=(225, 29, 72), width=4)
    draw.line([(0, 0), (0, bracket_len)], fill=(225, 29, 72), width=4)
    # Top-right
    draw.line([(W - bracket_len, 0), (W, 0)], fill=(225, 29, 72), width=4)
    draw.line([(W - 1, 0), (W - 1, bracket_len)], fill=(225, 29, 72), width=4)
    # Bottom-left
    draw.line([(0, H - 1), (bracket_len, H - 1)], fill=(225, 29, 72), width=4)
    draw.line([(0, H - bracket_len), (0, H - 1)], fill=(225, 29, 72), width=4)
    # Bottom-right
    draw.line([(W - bracket_len, H - 1), (W, H - 1)], fill=(225, 29, 72), width=4)
    draw.line([(W - 1, H - bracket_len), (W - 1, H - 1)], fill=(225, 29, 72), width=4)

    # Save to public/ and public/logo/jds/
    og_path1 = 'public/og-jds.jpg'
    og_path2 = 'public/logo/jds/og-jds.jpg'
    og.save(og_path1, 'JPEG', quality=90, optimize=True)
    og.save(og_path2, 'JPEG', quality=90, optimize=True)

    size_kb1 = os.path.getsize(og_path1) / 1024
    print(f"OG Preview created! File size: {size_kb1:.1f} KB (under WhatsApp 300KB limit)")

if __name__ == '__main__':
    make_favicons()
    make_og_preview()
