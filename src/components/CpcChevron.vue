<script setup lang="ts">
interface CpcChevronProps {
  dimensions?: number;
}

withDefaults(defineProps<CpcChevronProps>(), {
  dimensions: 24,
});
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :height="dimensions" viewBox="0 -960 960 960" :width="dimensions" fill="currentColor">
    <path d="m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z"/>
  </svg>
</template>
