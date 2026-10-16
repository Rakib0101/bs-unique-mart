/** Darkens a #rrggbb hex color by `amount` (0-1) for a hover-state shade. */
export function darken(hex: string, amount = 0.12): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;

  const num = parseInt(match[1], 16);
  const channel = (shift: number) => {
    const value = (num >> shift) & 0xff;
    return Math.max(0, Math.round(value * (1 - amount)));
  };

  const r = channel(16);
  const g = channel(8);
  const b = channel(0);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
