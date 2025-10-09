// Deterministic theme color mapping helper
const PALETTE = [
  '#60A5FA', // blue-400
  '#34D399', // green-400
  '#F59E0B', // amber-500
  '#F97316', // orange-500
  '#A78BFA', // purple-400
  '#F472B6', // pink-400
  '#FCA5A5', // red-300
  '#60A5FA',
  '#7DD3FC',
  '#34D399',
];

export function getColorForTheme(name?: string | null) {
  if (!name) return PALETTE[0];
  // simple deterministic hash: sum char codes
  let s = 0;
  for (let i = 0; i < name.length; i++) s += name.charCodeAt(i) * (i + 1);
  const idx = Math.abs(s) % PALETTE.length;
  return PALETTE[idx];
}

export const THEME_PALETTE = PALETTE;

// helper: convert hex like #rrggbb to {r,g,b}
export function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// return an rgba() string for the theme color (with provided alpha)
export function getAmbientRGBA(name?: string | null, alpha = 0.14) {
  const hex = getColorForTheme(name);
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
