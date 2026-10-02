export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
export const round = (v: number, digits = 2) => Number(v.toFixed(digits));
