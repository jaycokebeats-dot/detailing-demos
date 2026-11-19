function autoCapitalizarTexto(texto) {
  if (!texto) return "";
  const trim = texto.trim();
  if (!trim) return "";

  const conectores = new Set(["de", "del", "la", "el", "y", "en"]);
  const siglas = {
    bmw: "BMW",
    vw: "VW",
    sw4: "SW4",
    gti: "GTI",
    gli: "GLI",
    amg: "AMG",
    ppf: "PPF",
    tdi: "TDI",
    hdi: "HDI",
    gr: "GR",
    rs: "RS",
    st: "ST",
    gt: "GT",
    xr: "XR",
    glx: "GLX",
    clx: "CLX",
    xlt: "XLT",
    xl: "XL",
    xls: "XLS",
    ram: "RAM",
    crv: "CR-V",
    hrv: "HR-V",
    rav4: "RAV4",
    hilux: "Hilux",
    amarok: "Amarok",
    ranger: "Ranger",
    corolla: "Corolla",
    corsa: "Corsa",
    gol: "Gol",
    vento: "Vento",
    peugeot: "Peugeot",
    chevrolet: "Chevrolet",
    volkswagen: "Volkswagen",
    ford: "Ford",
    toyota: "Toyota",
    honda: "Honda",
    fiat: "Fiat",
    renault: "Renault",
    audi: "Audi",
    mercedes: "Mercedes",
    benz: "Benz",
    nissan: "Nissan",
    jeep: "Jeep",
    citroen: "Citroën",
    hyundai: "Hyundai",
    kia: "Kia"
  };

  return trim
    .split(/\s+/)
    .map((palabra, index) => {
      if (!palabra) return "";
      const lower = palabra.toLowerCase().replace(/[^a-záéíóúüñ0-9]/g, "");
      if (siglas[lower]) {
        return palabra.replace(new RegExp(lower, "i"), siglas[lower]);
      }
      if (index > 0 && conectores.has(palabra.toLowerCase())) {
        return palabra.toLowerCase();
      }
      if (palabra === palabra.toUpperCase() && palabra.length > 3) {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      }
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
}

const tests = [
  "julian gonzalez",
  "toyota hilux",
  "toyota sw4 gr",
  "bmw 320i",
  "vw golf gti",
  "JUAN CARLOS DE LA SERNA",
  "corsa",
  "ford ranger xlt",
  "mercedes benz a200"
];

for (const t of tests) {
  console.log(t, "-->", autoCapitalizarTexto(t));
}
