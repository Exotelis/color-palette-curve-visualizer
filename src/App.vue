<script setup lang="ts">
import { ref, computed } from 'vue';
import { hexToRgb, hexToHsb, normalizeHex } from '@/utils';
import { presets } from '@/presets';
import type { Colors, Preset } from '@/types';
import CpcChip from '@/components/CpcChip.vue';
import CpcColorIndicator from '@/components/CpcColorIndicator.vue';
import CpcColorPicker from '@/components/CpcColorPicker.vue';
import CpcInput from '@/components/CpcInput.vue';
import CpcTooltip from '@/components/CpcTooltip.vue';

interface HoveredElement {
  color?: Colors;
  preset?: Preset;
  boundaries: Boundaries;
}

interface Boundaries {
  x: number;
  y: number;
  height: number;
  width: number;
}

const color = ref('');
const colors = ref(new Map<string, Colors>());
const colorPickerRef = ref<undefined | InstanceType <typeof CpcColorPicker>>();
const visibleTooltip = ref<undefined | HoveredElement>();

function addColor(c: string) {
  const normalizedHex = normalizeHex(c);

  colors.value.set(normalizedHex, {
    hex: normalizedHex,
    rgb: hexToRgb(normalizedHex),
    hsb: hexToHsb(normalizedHex),
  });
  color.value = '';
}

function removeColor(color: string) {
  visibleTooltip.value = undefined;
  colors.value.delete(color);
}

function onChipHover(e: MouseEvent, value: Colors | Preset) {
  if (visibleTooltip.value) return;
  if (!e.target) return;

  const rect = (e.target as HTMLElement).getBoundingClientRect();

  // Normalize keyColor if preset
  if ('keyColor' in value) {
    value.keyColor = normalizeHex(value.keyColor);
  }

  visibleTooltip.value = {
    color: ('hex' in value) ? value : undefined,
    preset: ('keyColor' in value) ? value : undefined,
    boundaries: {
      x: rect.x,
      y: rect.y,
      height: rect.height,
      width: rect.width,
    }
  };
}

function onChipLeave() {
  visibleTooltip.value = undefined;
}

const tooltipPosition = computed(() => {
  if (!visibleTooltip.value) return { x: 0, y: 0 };

  const offset = 4;

  return {
    x: visibleTooltip.value?.boundaries.x,
    y: visibleTooltip.value?.boundaries.y + visibleTooltip.value?.boundaries.height + offset,
  }
});

function applyPreset(preset: Preset) {
  for (const color of preset.colors) {
    addColor(color);
  }

  // Set keyColor as selection in picker
  if (colorPickerRef.value) {
    colorPickerRef.value.setHex(normalizeHex(preset.keyColor));
  }
}
</script>

<template>
  <h1 class="text-center">Color palette curve visualizer</h1>

  <CpcTooltip class="z-50 absolute" v-if="visibleTooltip" :style="`top: ${tooltipPosition.y}px; left: ${tooltipPosition.x}px;`">
    <div class="w-full h-6 rounded mb-2" :style="`background-color: #${ visibleTooltip.color?.hex || visibleTooltip.preset?.keyColor }`" v-if="visibleTooltip.color || visibleTooltip.preset"></div>

    <div class="grid grid-cols-[auto_auto] gap-x-4 gap-y-2" v-if="visibleTooltip.color">
      <span>HEX</span>
      <span>#{{ visibleTooltip.color.hex }}</span>

      <span>RGB</span>
      <span>
        R: {{ visibleTooltip.color.rgb.r }}<br />
        G: {{ visibleTooltip.color.rgb.g }}<br />
        B: {{ visibleTooltip.color.rgb.b }}
      </span>

      <span>HSB/HSV</span>
      <span>
        H: {{ visibleTooltip.color.hsb.h }}<br />
        S: {{ visibleTooltip.color.hsb.s }}<br />
        B: {{ visibleTooltip.color.hsb.b }}
      </span>
    </div>
    <div class="grid grid-cols-[auto_auto] gap-x-4 gap-y-2" v-else-if="visibleTooltip.preset">
      <span>Key color</span>
      <span>#{{ visibleTooltip.preset.keyColor }}</span>

      <span>Colors</span>
      <span>
        <template v-for="color in visibleTooltip.preset.colors" :key="color">
          {{ color }}<br />
        </template>
      </span>
    </div>
  </CpcTooltip>

  <div v-if="presets && presets.length > 0">
    <h2>Presets:</h2>
    <div class="flex flex-wrap gap-2 mt-2 items-center">
      <CpcChip class="cursor-pointer"
               v-for="preset in presets"
               :key="preset.name"
               @click="applyPreset(preset)"
               @mouseover="onChipHover($event, preset)"
               @mouseleave="onChipLeave">
        <CpcColorIndicator class="mr-1" :color="preset.keyColor" />
        {{ preset.name }}
      </CpcChip>
    </div>
  </div>

  <div class="flex flex-col gap-y-2">
    <CpcInput label="Color" block :pattern="/^#?([a-f\d]{3}|[a-f\d]{6})$/i" error-message="Invalid hex format" v-model="color" @enter="addColor"></CpcInput>
    <div class="flex flex-wrap gap-x-2 gap-y-1 items-center">
      <span class="text-emerald-500 underline cursor-pointer" @click="colors.clear()" v-if="colors.size > 0">Clear all</span>
      <CpcChip
          style="font-family: 'Roboto Mono', monospace;"
          class="cursor-pointer"
          closable
          v-for="[key, value] in colors"
          :key="key"
          @click="removeColor(key)"
          @mouseover="onChipHover($event, value)"
          @mouseleave="onChipLeave">
        <CpcColorIndicator class="mr-1" :color="`#${key}`" />
        #{{ key }}
      </CpcChip>
    </div>
  </div>

  <CpcColorPicker :additional-indicators="colors" ref="colorPickerRef"/>
</template>
