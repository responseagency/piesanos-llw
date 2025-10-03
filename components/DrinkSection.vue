<template>
  <div class="drink-section mb-12" :data-section-id="sectionId">
    <!-- Section Header -->
    <div class="text-center mb-8">
      <h1 class="text-gold-50 text-5xl font-bold mb-2 tracking-wide stroke-text">{{ section.title }}</h1>
      <p v-if="section.subtitle" class="text-light text-gray-600">{{ section.subtitle }}</p>
    </div>




    <!-- Groups within this section -->
    <div class="space-y-8">
      <DrinkGroup
        v-for="(group, groupId) in section.groups"
        :key="groupId"
        :group="group"
        :group-id="groupId"
        :section-id="sectionId"
      />
    </div>
  </div>
</template>

<script>
import DrinkGroup from './DrinkGroup.vue'

export default {
  name: 'DrinkSection',
  components: {
    DrinkGroup
  },
  props: {
    sectionId: {
      type: String,
      required: true
    },
    section: {
      type: Object,
      required: true
    }
  }
}
</script>