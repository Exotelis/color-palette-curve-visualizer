<script setup lang="ts">
interface CpcColorIndicatorProps {
  color: string;
}

defineProps<CpcColorIndicatorProps>();
</script>

<template>
  <span class="w-2 h-2 rounded-full" :style="`background-color: ${color}`"></span>
</template>
