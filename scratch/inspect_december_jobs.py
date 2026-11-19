import json
import os
import urllib.request

env = {}
with open('Code/black-line-detailing/.env.local', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

url = f"{env.get('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/businesses?select=data&slug=eq.taller_am-centro-de-estetica-vehicular"
req = urllib.request.Request(url, headers={
    'apikey': env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')}"
})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))[0]['data']
    trabajos = data.get('trabajos', [])
    for i, t in enumerate(trabajos):
        if '2026-12' in t.get('fecha', ''):
            print(f"\n--- Trabajo {i} ---")
            print(json.dumps(t, indent=2, ensure_ascii=False))
