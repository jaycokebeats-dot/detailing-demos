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

url_get = f"{env.get('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/businesses?select=data&slug=eq.taller_am-centro-de-estetica-vehicular"
req = urllib.request.Request(url_get, headers={
    'apikey': env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')}"
})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))[0]['data']

trabajos = data.get('trabajos', [])

# Filtrar: quitar el corsa de prueba y el duplicado de $1, dejando la SW4 oficial de $900.000
trabajos_limpios = []
for t in trabajos:
    if t.get('id') == 'trabajo-1794928575102': # corsa ariel
        continue
    if t.get('id') == 'trabajo-1794927830555': # sw4 $1
        continue
    if t.get('id') == 'trabajo-1794928484364': # sw4 real de $900.000
        t['servicios'] = ['INSTALACION ADAPTACION LUZ LED AMBIENTAL (desarme 4 puertas torpedo central)']
        t['serviciosDetalle'] = [{
            'nombre': 'INSTALACION ADAPTACION LUZ LED AMBIENTAL',
            'precio': 900000,
            'detalle': 'desarme 4 puertas torpedo central'
        }]
    trabajos_limpios.append(t)

data['trabajos'] = trabajos_limpios

# Guardar en Supabase
url_patch = f"{env.get('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/businesses?slug=eq.taller_am-centro-de-estetica-vehicular"
patch_data = json.dumps({'data': data}).encode('utf-8')
patch_req = urllib.request.Request(url_patch, data=patch_data, method='PATCH', headers={
    'apikey': env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')}",
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
})

with urllib.request.urlopen(patch_req) as resp:
    print("Supabase updated successfully! Status:", resp.status)

print(f"Trabajos actualizados ({len(trabajos_limpios)}):")
for t in trabajos_limpios:
    print(f"  [{t.get('fecha')}] {t.get('vehiculo')} | Cliente: {t.get('cliente')} | ${t.get('monto')}")
