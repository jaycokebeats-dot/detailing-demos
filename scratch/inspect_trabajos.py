import urllib.request, json, os

env_vars = {}
with open(r'Code/black-line-detailing/.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
key = env_vars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if url and key:
    req = urllib.request.Request(
        f"{url}/rest/v1/businesses?select=slug,data&slug=eq.taller_am-centro-de-estetica-vehicular",
        headers={'apikey': key, 'Authorization': f'Bearer {key}'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            if data:
                trabajos = data[0].get('data', {}).get('trabajos', [])
                for t in trabajos:
                    print('VEH:', t.get('vehiculo'), '| MONTO:', t.get('monto'))
                    print('SERVICIOS:', t.get('servicios'))
                    print('DETALLE:', t.get('serviciosDetalle'))
                    print('---')
    except Exception as e:
        print('Error:', e)
