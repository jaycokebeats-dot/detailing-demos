/**
 * Generador y validador de credenciales para cada taller.
 * Regla:
 * 1. No es simplemente el nombre del taller (para que no sea obvio).
 * 2. No es ultra complejo.
 * 3. Usuario y contraseña son exactamente iguales (user === password).
 * 
 * Formato estándar: "pro-" + slug (ej: "pro-jds-detailing")
 * Soporta alias cortos amigables (ej: "pro-thezone" para "the-zone-car-autospa-detailing")
 */

const CUSTOM_CREDENTIALS_MAP: Record<string, string> = {
  "the-zone-car-autospa-detailing": "pro-thezone",
  "the-zone": "pro-thezone",
  "thezone": "pro-thezone",
};

const USERNAME_TO_SLUG_MAP: Record<string, string> = {
  "pro-thezone": "the-zone-car-autospa-detailing",
  "detail-thezone": "the-zone-car-autospa-detailing",
  "thezone": "the-zone-car-autospa-detailing",
  "pro-the-zone": "the-zone-car-autospa-detailing",
};

export function getWorkshopCredentials(slug: string): { username: string; password: string } {
  const clean = (slug || "").toLowerCase().trim();
  if (clean === "demo" || clean === "taller-demo") {
    return { username: "demo", password: "demo" };
  }
  if (CUSTOM_CREDENTIALS_MAP[clean]) {
    const customUser = CUSTOM_CREDENTIALS_MAP[clean];
    return { username: customUser, password: customUser };
  }
  const user = `pro-${clean}`;
  return { username: user, password: user };
}

export type AuthResult = {
  valid: boolean;
  isSuperAdmin: boolean;
  slug: string;
  error?: string;
};

export function validateWorkshopAuth(
  user: string,
  pass: string,
  targetSlug?: string
): AuthResult {
  const u = (user || "").trim().toLowerCase();
  const p = (pass || "").trim();

  // 1. Superadmin (Jay / Black Line)
  if (
    (u === "admin" && p === "admin") ||
    (u === "blackline" && p === "blackline") ||
    (u === "admin" && p === "demo")
  ) {
    return { valid: true, isSuperAdmin: true, slug: targetSlug || "demo" };
  }

  // 2. Demo pública
  if (u === "demo" && p === "demo") {
    return { valid: true, isSuperAdmin: false, slug: "demo" };
  }

  // 3. Regla general: usuario y contraseña deben ser exactamente iguales
  if (u !== p.toLowerCase()) {
    return {
      valid: false,
      isSuperAdmin: false,
      slug: "",
      error: "La contraseña debe ser idéntica al usuario asignado.",
    };
  }

  // 3.1 Revisar si coincide con alias personalizado corto
  if (USERNAME_TO_SLUG_MAP[u]) {
    const mappedSlug = USERNAME_TO_SLUG_MAP[u];
    return { valid: true, isSuperAdmin: false, slug: mappedSlug };
  }

  // 4. Si empieza con "pro-" (ej: pro-jds-detailing)
  if (u.startsWith("pro-")) {
    const extractedSlug = u.replace(/^pro-/, "");
    return { valid: true, isSuperAdmin: false, slug: extractedSlug };
  }

  // 5. Si empieza con "detail-" (ej: detail-jds-detailing)
  if (u.startsWith("detail-")) {
    const extractedSlug = u.replace(/^detail-/, "");
    return { valid: true, isSuperAdmin: false, slug: extractedSlug };
  }

  // 6. Si coincide con el taller objetivo indicado en la URL (?taller=slug)
  if (targetSlug && u === targetSlug.toLowerCase()) {
    return { valid: true, isSuperAdmin: false, slug: targetSlug };
  }

  return {
    valid: false,
    isSuperAdmin: false,
    slug: "",
    error: "Usuario o contraseña no válidos. Formato: pro-nombredeltaller",
  };
}
