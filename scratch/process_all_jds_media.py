import os
import subprocess
import glob
from PIL import Image

SOURCE_DIR = r"C:\Users\Jay\Desktop\Web JDS\videos fotos"
DEST_VIDEO_DIR = r"C:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing\public\videos\jds"
DEST_PHOTO_DIR = r"C:\Users\Jay\Documents\SecondBrain\Code\black-line-detailing\public\trabajos\jds"

os.makedirs(DEST_VIDEO_DIR, exist_ok=True)
os.makedirs(DEST_PHOTO_DIR, exist_ok=True)

# 1. PROCESS PHOTOS
photos_map = [
    ("Interior_1.jpeg", "jds-trabajo-interior-1"),
    ("Interior_2.jpeg", "jds-trabajo-interior-2"),
    ("Interior_3.jpeg", "jds-trabajo-interior-3"),
    ("Limpieza_de_motor_a_vapor.jpeg", "jds-trabajo-motor"),
    ("PPF_brillante.jpeg", "jds-trabajo-ppf"),
    ("Tratamiento_ceramico.jpeg", "jds-trabajo-ceramico"),
]

print("=== PROCESANDO FOTOS ===")
for src_name, dest_name in photos_map:
    src_path = os.path.join(SOURCE_DIR, src_name)
    if not os.path.exists(src_path):
        print(f"ERROR: No se encuentra {src_path}")
        continue
    
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        w, h = img.size
        max_dim = max(w, h)
        if max_dim > 1600:
            scale = 1600 / max_dim
            new_w = int(w * scale)
            new_h = int(h * scale)
            img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            img_resized = img
        
        jpg_dest = os.path.join(DEST_PHOTO_DIR, f"{dest_name}.jpg")
        webp_dest = os.path.join(DEST_PHOTO_DIR, f"{dest_name}.webp")
        
        img_resized.save(jpg_dest, "JPEG", quality=88, optimize=True, progressive=True)
        img_resized.save(webp_dest, "WEBP", quality=88)
        
        jpg_size_kb = os.path.getsize(jpg_dest) / 1024
        webp_size_kb = os.path.getsize(webp_dest) / 1024
        print(f"Foto {src_name} ({w}x{h}) -> {dest_name}.jpg ({img_resized.size[0]}x{img_resized.size[1]}, {jpg_size_kb:.1f} KB, webp: {webp_size_kb:.1f} KB)")

# 2. PROCESS VIDEOS
videos_map = [
    ("Video_Tratamiento_ceramico.MOV", "jds-video-ceramico"),
    ("Video_Tratamiento_ceramico_2.mov", "jds-video-ceramico-2"),
    ("Video_Tratamiento_acrilico.MOV", "jds-video-acrilico"),
    ("Video_Limpieza_de_motor.MOV", "jds-video-motor"),
    ("Video_Limpieza_integral.MOV", "jds-video-interior"),
    ("Video_Opticas.MP4", "jds-video-opticas"),
    ("Video_Lavado_premium.MP4", "jds-video-lavado-1"),
    ("Video_Lavado_premium_2.mov", "jds-video-lavado-2"),
]

print("\n=== PROCESANDO VIDEOS ===")
for src_name, dest_name in videos_map:
    src_path = os.path.join(SOURCE_DIR, src_name)
    if not os.path.exists(src_path):
        print(f"ERROR: No se encuentra {src_path}")
        continue
    
    dest_mp4 = os.path.join(DEST_VIDEO_DIR, f"{dest_name}.mp4")
    dest_poster = os.path.join(DEST_VIDEO_DIR, f"{dest_name}-poster.jpg")
    
    raw_size_mb = os.path.getsize(src_path) / (1024 * 1024)
    print(f"\nProcesando {src_name} ({raw_size_mb:.1f} MB)...")
    
    # Check if already encoded recently and valid
    if os.path.exists(dest_mp4) and os.path.getsize(dest_mp4) > 1000000 and os.path.exists(dest_poster):
        print(f"  -> Ya existe {dest_name}.mp4 ({os.path.getsize(dest_mp4)/(1024*1024):.1f} MB), saltando encode.")
        continue

    cmd_encode = [
        "ffmpeg", "-y",
        "-i", src_path,
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "23",
        "-vf", "scale=1080:-2",
        "-r", "60",
        "-c:a", "aac",
        "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        dest_mp4
    ]
    
    res = subprocess.run(cmd_encode, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  ERROR encode: {res.stderr[-300:]}")
        continue
    
    encoded_size_mb = os.path.getsize(dest_mp4) / (1024 * 1024)
    print(f"  -> Video codificado con éxito: {dest_name}.mp4 ({encoded_size_mb:.1f} MB, ahorro del {((1 - encoded_size_mb/raw_size_mb)*100):.1f}%)")
    
    # Extract poster
    cmd_poster = [
        "ffmpeg", "-y",
        "-ss", "00:00:01.5",
        "-i", dest_mp4,
        "-frames:v", "1",
        "-q:v", "2",
        dest_poster
    ]
    res_p = subprocess.run(cmd_poster, capture_output=True, text=True)
    if res_p.returncode == 0 and os.path.exists(dest_poster):
        poster_kb = os.path.getsize(dest_poster) / 1024
        print(f"  -> Poster generado: {dest_name}-poster.jpg ({poster_kb:.1f} KB)")
    else:
        # Fallback to 00:00:00.5
        subprocess.run(["ffmpeg", "-y", "-ss", "00:00:00.5", "-i", dest_mp4, "-frames:v", "1", "-q:v", "2", dest_poster], capture_output=True)
        print(f"  -> Poster generado (fallback 0.5s)")

print("\n=== PROCESO COMPLETADO EXITOSAMENTE ===")
