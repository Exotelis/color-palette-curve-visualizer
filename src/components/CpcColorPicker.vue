<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';
import CpcChevron from '@/components/CpcChevron.vue';
import { getContrastColor, hexToHsb, hexToRgb, hsbToHex, hsbToRgb, normalizeHex, rgbToCmyk, rgbToHex, rgbToHsb, rgbToHsl } from '@/utils';
import type { Colors, ColorsWithMeta } from '@/types';
import CpcInput from '@/components/CpcInput.vue';

interface CpcColorPickerProps {
  additionalIndicators?: Map<string, Colors>;
  dimensions?: number;
}

const props = withDefaults(defineProps<CpcColorPickerProps>(), {
  dimensions: 500,
});

const additionalIndicatorDimension = 8;
const indicatorColorDimension = 16;
const indicatorSelectingDimension = 24;

const color = reactive<ColorsWithMeta<string> & { selected: boolean }>({
  coords: [0,0],
  contrast: '000000',
  hex: 'FFFFFF',
  rgb: {
    r: '255',
    g: '255',
    b: '255',
  },
  hsb: {
    h: '360',
    s: '0',
    b: '100',
  },
  hsl: {
    h: '360',
    s: '0',
    l: '100',
  },
  cmyk: {
    c: '0',
    m: '0',
    y: '0',
    k: '0',
  },
  selected: false,
});

const selectingColor = ref(false);
const selectingHue = ref(false);

function selectColor(e: MouseEvent) {
  if (selectingHue.value) return;
  if (e.type === 'mousedown') selectingColor.value = true;
  if (e.type === 'mouseup') selectingColor.value = false;

  if (selectingColor.value) {
    color.coords = [e.offsetX, e.offsetY];
    const saturationBrightness = coordsToSaturationBrightness(props.dimensions, props.dimensions, e.offsetX, e.offsetY);
    color.hsb.s = saturationBrightness[0].toFixed(1);
    color.hsb.b = saturationBrightness[1].toFixed(1);
    updateFromHsb();
  }
}

function selectHue(e: MouseEvent) {
  if (selectingColor.value) return;
  if (e.type === 'mousedown') selectingHue.value = true;
  if (e.type === 'mouseup') selectingHue.value = false;

  if (selectingHue.value) {
    const hue = offsetToHue(props.dimensions, e.offsetY);
    if (hue !== Number(color.hsb.h)) {
      color.hsb.h = String(hue);
      updateFromHsb();
    }
  }
}

function updateFromHsb() {
  const hex = hsbToHex({ h: Number(color.hsb.h), s: Number(color.hsb.s), b: Number(color.hsb.b) });
  const rgb = hsbToRgb({ h: Number(color.hsb.h), s: Number(color.hsb.s), b: Number(color.hsb.b) });

  // Set hex
  color.hex = hex;

  // Set RGB
  color.rgb.r = String(rgb.r);
  color.rgb.g = String(rgb.g);
  color.rgb.b = String(rgb.b);

  updateMeta(hex);
  updateMisc();
}

function updateFromHex() {
  const hex = normalizeHex(color.hex);
  const rgb = hexToRgb(hex);
  const hsb = hexToHsb(hex);

  // Set HSB
  color.hsb.h = String(hsb.h);
  color.hsb.s = String(hsb.s);
  color.hsb.b = String(hsb.b);

  // Set RGB
  color.rgb.r = String(rgb.r);
  color.rgb.g = String(rgb.g);
  color.rgb.b = String(rgb.b);

  updateMeta(hex);
  updateMisc();
}

function updateFromRgb() {
  const hex = rgbToHex({ r: Number(color.rgb.r), g: Number(color.rgb.g), b: Number(color.rgb.b) });
  const hsb = rgbToHsb({ r: Number(color.rgb.r), g: Number(color.rgb.g), b: Number(color.rgb.b) });

  // Set hex
  color.hex = hex;

  // Set HSB
  color.hsb.h = String(hsb.h);
  color.hsb.s = String(hsb.s);
  color.hsb.b = String(hsb.b);

  updateMeta(hex);
  updateMisc();
}

function updateMeta(hex: string) {
  color.contrast = getContrastColor(hex);
  color.coords = saturationBrightnessToCoords(props.dimensions, props.dimensions, Number(color.hsb.s), Number(color.hsb.b));
  color.selected = true;
}

function updateMisc() {
  const cmyk = rgbToCmyk({ r: Number(color.rgb.r), g: Number(color.rgb.g), b: Number(color.rgb.b) })
  const hsl = rgbToHsl({ r: Number(color.rgb.r), g: Number(color.rgb.g), b: Number(color.rgb.b) })

  // Set CMYK
  color.cmyk.c = String(cmyk.c);
  color.cmyk.m = String(cmyk.m);
  color.cmyk.y = String(cmyk.y);
  color.cmyk.k = String(cmyk.k);
  // color.cmyk.c = '0';
  // color.cmyk.m = '0';
  // color.cmyk.y = '0';
  // color.cmyk.k = '0';

  // Set HSL
  color.hsl.h = String(hsl.h);
  color.hsl.s = String(hsl.s);
  color.hsl.l = String(hsl.l);
}

function offsetToHue(size: number, offset: number, inverted = true): number {
  offset = inverted ? (offset - size) * -1 : offset;
  const hue = offset / (size / 360);
  return +Math.max(0, Math.min(360, hue)).toFixed(2);
}

function hueToOffset(size: number, hue: number, inverted = true): number {
  hue = inverted ? (hue - 360) * -1 : hue;
  const offset = size / 360 * hue;
  return Math.max(0, Math.min(props.dimensions, offset));
}

function coordsToSaturationBrightness(width: number, height: number, x: number, y: number): [number, number] {
  // saturation = width = x | brightness = height = y
  return [100 / width * x, 100 - (100 / height * y)];
}
function saturationBrightnessToCoords(width: number, height: number, s: number, b: number): [number, number] {
  // saturation = width = x | brightness = height = y
  return [width / 100 * s, height - (height / 100 * b)];
}

const additionalIndicatorsWithMeta = computed(() => {
  if (!props.additionalIndicators) return;

  const map = new Map<string, ColorsWithMeta>();
  for (const [key, color] of props.additionalIndicators.entries()) {
    const cmyk = rgbToCmyk({ r: Number(color.rgb.r), g: Number(color.rgb.g), b: Number(color.rgb.b) })
    const hsl = rgbToHsl({ r: Number(color.rgb.r), g: Number(color.rgb.g), b: Number(color.rgb.b) })

    map.set(
        key,
        {
          ...color,
          cmyk,
          hsl,
          contrast: getContrastColor(color.hex),
          coords: saturationBrightnessToCoords(props.dimensions,props.dimensions, color.hsb.s, color.hsb.b)
        }
    );
  }
  return map;
});

function setHex(hex: string) {
  color.hex = normalizeHex(hex);
  updateFromHex();
}

defineExpose({ setHex });

function toFixedIfNecessary(value: string, dp = 2){
  return +parseFloat(value).toFixed( dp );
}

const pickerStyleObject = computed(() => ({
  background: `linear-gradient(to right, #fff, hsl(${color.hsb.h}, 100%, 50%)), linear-gradient(to top, #000, transparent)`,
  backgroundBlendMode: 'multiply',
  height: `${props.dimensions}px`,
  width: `${props.dimensions}px`,
}));
const selectorStyleObject = computed(() => ({
  background: `linear-gradient(to bottom, #f00, #f0f, #00f, #0ff, #0f0, #ff0, #f00)`,
  height: `${props.dimensions}px`,
}));
const selectorColorStyleObject = computed(() => ({
  width: `${indicatorColorDimension}px`,
  height: `${indicatorColorDimension}px`,
  top: `${color.coords[1] - indicatorColorDimension / 2}px`,
  left: `${color.coords[0] - indicatorColorDimension / 2}px`,
  borderColor: `#${color.contrast}`,
}));
const selectorIndicatorStyleObject = computed(() => ({
  top: `${hueToOffset(props.dimensions, Number(color.hsb.h))}px`,
}));
</script>

<template>
  <div class="flex justify-center">
    <div class="inline-flex bg-gray-950 p-6 rounded-lg gap-x-6">
      <!-- ColorPicker -->
      <div class="cursor-pointer relative" :style="pickerStyleObject" @mousemove="selectColor" @mouseup="selectColor" @mousedown="selectColor" v-on-click-outside="() => { selectingColor = false}">
        <!-- Indicator -->
        <div class="absolute inline-block pointer-events-none rounded-full border-2" :style="selectorColorStyleObject" v-if="color.selected"></div>
        <!-- additional indicators -->
        <div class="pointer-events-none absolute rounded-full"
             :style="{ left: `${v.coords[0] - additionalIndicatorDimension / 2}px`, top: `${v.coords[1] - additionalIndicatorDimension / 2}px`, background: `#${v.contrast}`, width: `${additionalIndicatorDimension}px`, height: `${additionalIndicatorDimension}px` }"
             v-for="[key, v] in additionalIndicatorsWithMeta"
             :key="key"></div>
      </div>
      <!-- HUESelector -->
      <div :style="selectorStyleObject" class="w-10 cursor-pointer" @mousemove="selectHue" @mouseup="selectHue" @mousedown="selectHue" v-on-click-outside="() => { selectingHue = false}">
        <!-- Indicator -->
        <div class="relative w-full pointer-events-none" :style="selectorIndicatorStyleObject">
          <CpcChevron
              class="absolute rotate-90"
              :style="{ top: -indicatorSelectingDimension / 2, left: -indicatorSelectingDimension / 1.3 }"
              :dimensions="indicatorSelectingDimension"
              disabled />
          <CpcChevron
              class="absolute -rotate-90"
              :style="{ top: -indicatorSelectingDimension / 2, right: -indicatorSelectingDimension / 1.3 }"
              :dimensions="indicatorSelectingDimension" />
        </div>
      </div>
      <!-- Fields/Information -->
      <div class="flex flex-col gap-6 w-[250px]">
        <!-- Color preview -->
        <div class="flex flex-col items-center">
          <span class="text-sm mb-1">Selected color</span>
          <div :style="{ background: `#${color.hex}` }" class="w-full h-[50px] border border-gray-800"></div>
        </div>
        <div class="grid grid-cols-2 gap-6 items-start">
          <!-- HSB -->
          <div class="grid grid-cols-[25px_1fr_auto] gap-x-1 gap-y-2 items-center">
            <label for="hue">H:</label>
            <CpcInput id="hue" v-model="color.hsb.h" small type="number" :min="0" :max="360" class="rounded-none min-w-[70px] appearance-none" @enter="updateFromHsb" @blur="updateFromHsb" />
            <span>°</span>

            <label for="saturation">S:</label>
            <CpcInput id="saturation" v-model="color.hsb.s" small type="number" :min="0" :max="100" class="rounded-none min-w-[70px] appearance-none" @enter="updateFromHsb" @blur="updateFromHsb" />
            <span>%</span>

            <label for="brightness">B:</label>
            <CpcInput id="brightness" v-model="color.hsb.b" small type="number" :min="0" :max="100" class="rounded-none min-w-[70px] appearance-none" @enter="updateFromHsb" @blur="updateFromHsb" />
            <span>%</span>
          </div>
          <!-- RGB -->
          <div class="grid grid-cols-[25px_1fr_auto] gap-x-1 gap-y-2 items-center">
            <label for="red">R:</label>
            <CpcInput id="red" v-model="color.rgb.r" small type="number" :min="0" :max="255" class="rounded-none min-w-[70px] appearance-none" @enter="updateFromRgb" @blur="updateFromRgb" />
            <span></span>

            <label for="green">G:</label>
            <CpcInput id="green" v-model="color.rgb.g" small type="number" :min="0" :max="255" class="rounded-none min-w-[70px] appearance-none" @enter="updateFromRgb" @blur="updateFromRgb" />
            <span></span>

            <label for="blue">B:</label>
            <CpcInput id="blue" v-model="color.rgb.b" small type="number" :min="0" :max="255" class="rounded-none min-w-[70px] appearance-none" @enter="updateFromRgb" @blur="updateFromRgb" />
            <span></span>
          </div>
          <!-- HSL -->
          <div class="grid grid-cols-[25px_1fr_auto] gap-x-1 gap-y-2 items-center">
            <span>H:</span>
            <span>{{ toFixedIfNecessary(color.hsl.h) }}</span>
            <span>°</span>

            <span>S:</span>
            <span>{{ toFixedIfNecessary(color.hsl.s) }}</span>
            <span>%</span>

            <span>L:</span>
            <span>{{ toFixedIfNecessary(color.hsl.l) }}</span>
            <span>%</span>
          </div>
          <!-- CMYK -->
          <div class="grid grid-cols-[25px_1fr_auto] gap-x-1 gap-y-2 items-center">
            <span>C:</span>
            <span>{{ toFixedIfNecessary(color.cmyk.c) }}</span>
            <span>%</span>

            <span>M:</span>
            <span>{{ toFixedIfNecessary(color.cmyk.m) }}</span>
            <span>%</span>

            <span>Y:</span>
            <span>{{ toFixedIfNecessary(color.cmyk.y) }}</span>
            <span>%</span>

            <span>K:</span>
            <span>{{ toFixedIfNecessary(color.cmyk.k) }}</span>
            <span>%</span>
          </div>
          <!-- Hex -->
          <div class="col-span-2">
            <CpcInput label="#" v-model="color.hex" label-left small :pattern="/^#?([a-f\d]{3}|[a-f\d]{6})$/i" class="rounded-none" @enter="updateFromHex" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
