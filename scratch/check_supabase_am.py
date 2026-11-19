import os
import json
import urllib.request

env = {}
with open('Code/black-line-detailing/.env.local', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
api_key = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

url = f"{supabase_url}/rest/v1/businesses?select=slug,updated_at,data&slug=like.*am-*"
req = urllib.request.Request(url, headers={
    'apikey': api_key,
    'Authorization': f'Bearer {api_key}'
})

with urllib.request.urlopen(req) as resp:
    rows = json.loads(resp.read().decode('utf-8'))
    print(f"Found {len(rows)} rows matching am-*")
    for r in rows:
        print(f"\n=== Slug: {r.get('slug')} | Updated: {r.get('updated_at')} ===")
        data = r.get('data') or {}
        trabajos = data.get('trabajos') or []
        print(f"  Trabajos ({len(trabajos)}):")
        for t in trabajos:
            print(f"    - [{t.get('fecha')}] {t.get('vehiculo')} | Cliente: {t.get('cliente')} | Estado: {t.get('estadoTrabajo')}")
        presupuestos = data.get('presupuestos') or []
        print(f"  Presupuestos ({len(presupuestos)}):")
        for p in presupuestos:
            print(f"    - [{p.get('fechaCreacion')}] {p.get('vehiculo')} | Cliente: {p.get('cliente')} | Estado: {p.get('estado')}")
