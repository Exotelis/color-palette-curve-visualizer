import type { CMYK, HSB, HSL, RGB } from "@/types";

/**
 * Returns 6 char long hex
 */
export function normalizeHex(color: string): string {
  let normalizedColor = color.startsWith('#') ? color.slice(1) : color;

  if (normalizedColor.length === 3) {
    normalizedColor = normalizedColor[0].repeat(2) + normalizedColor[1].repeat(2) + normalizedColor[2].repeat(2);
  }

  return normalizedColor.toUpperCase();
}

export function hexToRgb(hex: string): RGB {
  return {
    r: Number("0x" + hex[0] + hex[1]),
    g: Number("0x" + hex[2] + hex[3]),
    b: Number("0x" + hex[4] + hex[5]),
  };
}

export function rgbToHex(rgb: RGB): string {
  return (1 << 24 | rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).slice(1);
}

export function hexToHsb(hex: string): HSB {
  return rgbToHsb(hexToRgb(hex));
}

export function hsbToHex(hsb: HSB): string {
  return rgbToHex(hsbToRgb(hsb));
}

export function rgbToHsb(rgb: RGB): HSB {
  const r = rgb.r /255;
  const g = rgb.g / 255;
  const b = rgb.b /255;
  const v = Math.max(r, g, b);
  const n = v - Math.min(r, g, b);

  const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;

  return {
    h: 60 * (h < 0 ? h + 6 : h),
    s: v && (n / v) * 100,
    b: v * 100,
  };
}

export function hsbToRgb(hsb: HSB): RGB {
  const s = hsb.s / 100;
  const b = hsb.b / 100;

  const k = (n: number) => (n + hsb.h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));

  return {
    r: Math.round(255 * f(5)),
    g: Math.round(255 * f(3)),
    b: Math.round(255 * f(1)),
  }
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;

  return {
    h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    l: (100 * (2 * l - s)) / 2,
  }
}

export function rgbToCmyk(rgb: RGB): CMYK {
  if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) return { c: 0, m: 0, y: 0, k: 1 }

  let computedC = 1 - (rgb.r / 255);
  let computedM = 1 - (rgb.g / 255);
  let computedY = 1 - (rgb.b / 255);

  const minCMY = Math.min(computedC, Math.min(computedM, computedY));
  computedC = (computedC - minCMY) / (1 - minCMY);
  computedM = (computedM - minCMY) / (1 - minCMY);
  computedY = (computedY - minCMY) / (1 - minCMY);

  return {
    c: computedC * 100,
    m: computedM * 100,
    y: computedY * 100,
    k: minCMY * 100,
  }
}

export function getContrastColor(color: string): string {
  if (!/^[\da-f]{6}$/i.test(color)) {
    throw new Error(`The parameter 'referenceColor' must be a 6-digit hex color of the format AAbb00`);
  }

  let ratioMax = 0;
  let ratioMaxColor = '';
  const contrastColors: string[] = ['ffffff', '000000'];

  for (let i = 0; i < contrastColors.length; i++) {
    const ratio: number = contrastRatio(contrastColors[i], color);

    if (ratio > ratioMax) {
      ratioMax = ratio;
      ratioMaxColor = contrastColors[i];
    }
  }

  return ratioMaxColor;
}

function contrastRatio(c1: string, c2: string): number {
  const l1: number = relativeLuminance(c1);
  const l2: number = relativeLuminance(c2);

  return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
}

function relativeLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);
  const rgb = [r / 255, g / 255, b / 255];

  for (let i = 0; i < rgb.length; i++) {
    rgb[i] = rgb[i] <= 0.03928 ? rgb[i] / 12.92 : Math.pow((rgb[i] + 0.055) / 1.055, 2.4);
  }

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}