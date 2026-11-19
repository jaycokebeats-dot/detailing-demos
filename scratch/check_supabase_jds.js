const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('Code/black-line-detailing/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[k] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('businesses').select('*').eq('slug', 'jds-detailing');
  if (error) {
    console.error('Supabase error:', error);
    return;
  }
  console.log('Record count:', data.length);
  if (data.length > 0) {
    console.log('slug:', data[0].slug);
    console.log('video_hero:', data[0].video_hero);
    console.log('fotos:', data[0].fotos);
    console.log('hero_titulo:', data[0].hero_titulo);
    console.log('data:', JSON.stringify(data[0], null, 2));
  }
}

run();
