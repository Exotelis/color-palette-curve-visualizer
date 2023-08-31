export interface Colors {
  hex: string;
  rgb: RGB;
  hsb: HSB;
}

export interface ColorsWithMeta<T = number> {
  coords: [number, number];
  contrast: string;
  hex: string;
  rgb: RGB<T>;
  hsb: HSB<T>;
  hsl: HSL<T>;
  cmyk: CMYK<T>;
}

export interface RGB<T = number> {
  r: T;
  g: T;
  b: T;
}

export interface HSB<T = number> {
  h: T;
  s: T;
  b: T;
}

export interface HSL<T = number> {
  h: T;
  s: T;
  l: T;
}

export interface CMYK<T = number> {
  c: T;
  m: T;
  y: T;
  k: T;
}

export interface Preset {
  name: string;
  keyColor: string;
  colors: string[];
}