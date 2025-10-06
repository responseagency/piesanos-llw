<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Inline vanilla JS for hamburger menu toggle
useHead({
  script: [
    {
      innerHTML: `
        window.addEventListener('DOMContentLoaded', function() {
          var btn = document.querySelector('[aria-label="Toggle menu"]');
          var menu = document.getElementById('mobile-menu');
          if (btn && menu) {
            btn.addEventListener('click', function() {
              menu.classList.toggle('hidden');
            });
          }
        });
      `,
      type: 'text/javascript',
      tagPosition: 'bodyClose'
    }
  ]
})
</script>
