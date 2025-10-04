<template>
  <div class="drink-sections">
    <DrinkSection
      v-for="(section, sectionId) in beverages?.value || beverages || {}"
      :key="sectionId"
      :section-id="sectionId"
      :section="section"
    />
  </div>
</template>

<script setup>
// Inject organized beverages from parent (could be a ref or plain object)
const injectedBeverages = inject('beverages', {})

// Unwrap if it's a ref, otherwise use as-is
const beverages = computed(() => {
  return unref(injectedBeverages) || {}
})
</script>
