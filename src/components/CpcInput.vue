<script setup lang="ts">
import { computed, ref } from 'vue';

interface CpcInputProps {
  block?: boolean;
  errorMessage?: string;
  label?: string;
  labelLeft?: boolean;
  modelValue: string;
  pattern?: RegExp;
  small?: boolean;
  min?: number;
  max?: number;
  type?: string;
}

defineOptions({
  inheritAttrs: false
})
const emit = defineEmits<{
  enter: [value: string];
  'update:modelValue': [value: string];
}>();
const props = withDefaults(defineProps<CpcInputProps>(), {
  type: 'text',
});

const error = ref(false);

function onEnter (e: Event) {
  if (props.pattern && !props.pattern.test(props.modelValue)) {
    error.value = true;
    return;
  }

  emit('enter', (e.target as HTMLInputElement).value);
  clearError();
}

function onUpdate(e: Event) {
  const el = e.target as HTMLInputElement;
  let val = el.value;

  if (el.type === 'number') {
    if (props.min) el.value = Math.max(props.min, Number(val)).toString();
    if (props.max) el.value = Math.min(props.max, Number(val)).toString();
  }

  emit('update:modelValue', el.value);
}

function clearError() {
  error.value = false;
}


const classObject = computed(() => ([
  'bg-gray-700',
  'border',
  'text-sm',
  'focus:ring-2',
  'focus:ring-offset-2',
  'focus:ring-offset-gray-900',
  'block',
  [props.block ? 'w-full' : 'w-auto'],
  [props.label ? props.labelLeft ? 'ml-1' : 'mt-1' : ''],
  [props.small ? 'p-1 rounded' : 'p-2.5 rounded-lg'],
  [error.value ? 'border-red-500 focus:ring-red-500 text-red-500' : 'border-gray-600 focus:ring-gray-700'],
]));
</script>

<template>
  <div>
    <div :class="['flex', labelLeft ? 'flex-row items-center' : 'flex-col']">
      <label :for="label" class="block text-sm font-medium" :class="{ 'text-red-500': error }" v-if="label">{{ label }}</label>
      <input :id="label"
             :class="classObject"
             :value="modelValue"
             :type="type"
             :min="min"
             :max="max"
             v-bind="$attrs"
             @input="onUpdate"
             @keyup.enter="onEnter" />
    </div>
    <span v-if="error && errorMessage" class="mt-1 block text-sm text-red-500">{{ errorMessage }}</span>
  </div>
</template>
