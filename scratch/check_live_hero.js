async function check() {
  const res = await fetch('https://detailing-demos-three.vercel.app/d/jds-detailing');
  const html = await res.text();
  console.log('Includes og-jds.jpg:', html.includes('og-jds.jpg'));
  console.log('Includes hero-compilado-blanco.mp4:', html.includes('hero-compilado-blanco.mp4'));
  
  const heroIdx = html.indexOf('id="hero"');
  if (heroIdx !== -1) {
    console.log('Hero snippet:\n', html.substring(heroIdx, heroIdx + 1200));
  } else {
    console.log('Hero not found');
  }
}

check();
