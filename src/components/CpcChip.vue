<script setup lang="ts">
interface CpcChipProps {
  closable?: boolean;
}

defineProps<CpcChipProps>();
</script>

<template>
  <span class="bg-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full inline-flex shadow-md hover:shadow-xl items-center leading-none">
    <slot></slot>
    <svg v-if="closable" xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor" class="ml-1 inline-block"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>
  </span>
</template>
