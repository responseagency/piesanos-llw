<template>
  <div class="bg-red-950 w-full">
    <div class="max-w-[1024px] mx-auto px-4 py-4 flex items-center justify-between">

      <div class="flex w-full justify-between md:justify-start md:w-auto items-center gap-x-10  flex-row-reverse md:flex-row">
        <!-- Top Section with Logo centered -->
        <div class="flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" viewBox="0 0 195 70" class="hidden md:block h-15 w-auto">
            <rect x="7.05865" y="12.1715" width="180" height="44.5" fill="#241f20"/>
            <path fill="#D1B574" d="M93.7 35c.3 0 .5-.2.7-.4l.4-.6 5.4-11.2c0-.3.2-.6.3-.8l.1-.5v-.3l-.3-.1v-.6h5.4v.6h-.2l-.1.4.1.5.4.6 5.8 11.7a1.3 1.3 0 0 0 .8.7v.6h-5v-.5l.3-.1c.2 0 .2-.2.2-.4v-.4l-.2-.4-1-2h-7.7l-1 1.9-.2.5v.4l.1.3h.5v.7h-4.8V35Zm12-5.7-3-5.8-2.5 5.8h5.5ZM116 35c.4 0 .6-.2.6-.5v-13c0-.3-.2-.4-.6-.4v-.7h5.3v.7l-.3.1c0 .2.3.5.8 1l8.6 8.7v-9.3c0-.4-.2-.5-.7-.5v-.7h4.3v.7c-.4 0-.6.1-.6.5v12.9c0 .3.2.5.6.5v.6h-4.6V35c.2 0 .2 0 .2-.2 0 0 0-.2-.3-.5l-.8-.8-8.9-9v10c0 .3.3.5.8.5v.6H116V35Zm35.6-14.3a9 9 0 0 1 3 1.5 7 7 0 0 1 2.8 5.8c0 1.3-.2 2.5-.7 3.5a7 7 0 0 1-2 2.4c-1 .6-2 1-3 1.4a15.4 15.4 0 0 1-7.5 0 8.4 8.4 0 0 1-3-1.4 7 7 0 0 1-2.8-5.9c0-1.3.2-2.4.7-3.4a7 7 0 0 1 2-2.4 9 9 0 0 1 3.1-1.5 13.9 13.9 0 0 1 7.4 0Zm-6 2.5a5 5 0 0 0-1.9 1c-.6.4-1 1-1.4 1.6-.3.7-.5 1.4-.5 2.2a4.8 4.8 0 0 0 1.9 3.9c.6.4 1.2.8 2 1a7 7 0 0 0 6.4-1A4.8 4.8 0 0 0 154 28c0-.8-.2-1.5-.5-2.2-.4-.6-.8-1.2-1.4-1.6-.6-.5-1.2-.8-2-1a7.1 7.1 0 0 0-4.4 0Zm17.5 7.1v.7c0 .3.2.6.7.9.4.3 1 .5 1.6.7a16.3 16.3 0 0 0 3.4.7 13.2 13.2 0 0 0 2.7-.4c.5-.1.9-.4 1.2-.6.3-.3.5-.6.5-1 0-.6-.3-1-.9-1.2a146.7 146.7 0 0 0-5-1c-1 0-2-.2-3-.5-.8-.3-1.5-.7-2.1-1.2a3 3 0 0 1-.9-2.3 4 4 0 0 1 1.9-3.5c1.3-1 3-1.4 5.3-1.4a14 14 0 0 1 6.3 1.4l.8.3h.4l.4-.3.3.4-1.7 3.2-.7-.2v-.4l-.4-.4c-.5-.4-1.2-.7-2.2-1a12.7 12.7 0 0 0-4.7-.3c-.5 0-.8.1-1.2.3a2 2 0 0 0-.8.5c-.2.2-.3.5-.3.8 0 .5.3.9 1 1.1a134 134 0 0 0 5 .9c1 .1 2 .3 2.9.6.8.3 1.6.8 2.2 1.4.5.5.8 1.3.8 2.3 0 1-.2 1.9-.7 2.5a5 5 0 0 1-2 1.5 8 8 0 0 1-2.5.7 21 21 0 0 1-5 0 21.2 21.2 0 0 1-4.7-1.3c-.1 0-.3 0-.4.2l-.5-.4 1.6-3.8.7.1ZM20.2 35.6V35c.9 0 1.3-.2 1.3-.6V18.7c0-.4-.4-.6-1.3-.6v-.6h12.6c2.3 0 4.1.4 5.4 1.2 1.3.8 2 2.2 2 4.2s-.7 3.3-2 4.1a10 10 0 0 1-5.4 1.2h-7.2v6.2c0 .4.4.6 1.2.6v.6h-6.6Zm13-10.5a4 4 0 0 0 2-.5c.6-.3 1-.9 1-1.7 0-1-.4-1.5-1-1.8a4 4 0 0 0-2-.4h-7.6V25h7.6ZM44.6 35l.8-.1.2-.4v-13s0-.2-.2-.3l-.8-.1v-.6h5.5v.6c-.7 0-1 .1-1 .5v12.9c0 .3.3.5 1 .5v.6h-5.5V35ZM70 23.7c0-.5-.3-.7-1-.7h-8.8v3.4h6.5l.2-.5h.7v3.6h-.7c0-.2 0-.4-.3-.4l-1.1-.1h-5.3v4h9.2l.7-.1c.2-.2.3-.3.3-.5h.6V36h-.6c0-.2-.1-.3-.3-.4a6 6 0 0 0-.7 0H56.2V35l.4-.1.2-.4v-13s0-.2-.2-.3a.6.6 0 0 0-.4-.1v-.6H69c.7 0 1-.3 1-.7h.7v3.9h-.6Zm7.4 6.6v.7c0 .3.2.6.6.9l1.7.7a16.3 16.3 0 0 0 3.3.7 13.1 13.1 0 0 0 2.7-.4 4 4 0 0 0 1.3-.6c.3-.3.5-.6.5-1 0-.6-.3-1-1-1.2a147.8 147.8 0 0 0-5-1c-1 0-2-.2-2.9-.5-.8-.3-1.6-.7-2.2-1.2a3 3 0 0 1-.8-2.3 4 4 0 0 1 1.9-3.5c1.2-1 3-1.4 5.3-1.4a14 14 0 0 1 6.2 1.4l.8.3h.5l.3-.3.4.4-1.8 3.2-.6-.2-.1-.4-.3-.4c-.5-.4-1.2-.7-2.3-1a12.7 12.7 0 0 0-4.7-.3 2 2 0 0 0-1.1.3 2 2 0 0 0-.8.5c-.2.2-.3.5-.3.8 0 .5.3.9.9 1.1a132.6 132.6 0 0 0 5 .9l3 .6a6 6 0 0 1 2.1 1.4c.6.5.9 1.3.9 2.3a4 4 0 0 1-.8 2.5c-.5.6-1.1 1.2-1.9 1.5a8 8 0 0 1-2.5.7 21 21 0 0 1-5 0 21.3 21.3 0 0 1-4.7-1.3c-.2 0-.3 0-.4.2L75 34l1.6-3.8.7.1Z"/>
            <path fill="#88221A" d="M11.3 58.3A4.3 4.3 0 0 1 7 54.2v-39c0-2.2 2-4 4.3-4H184c2.4 0 4.4 1.8 4.4 4v39c0 2.3-2 4.1-4.4 4.1H11.3Zm-2.6-43v38.9c0 1.3 1.2 2.5 2.6 2.5H184c1.5 0 2.6-1.2 2.7-2.5v-39c0-1.3-1.2-2.4-2.7-2.4H11.3a2.6 2.6 0 0 0-2.6 2.5Z"/>
            <path fill="#D0B26D" d="M11.3 58.8v-1H184c2.2 0 4-1.6 4-3.6v-39c0-2-1.8-3.6-4-3.6H11.3a3.8 3.8 0 0 0-3.9 3.7v38.9c0 2 1.8 3.6 4 3.6v1c-2.7 0-4.9-2-4.9-4.6v-39c0-2.5 2.2-4.6 4.8-4.6H184c2.7 0 4.8 2 4.8 4.7v38.9c0 2.6-2.1 4.6-4.8 4.6H11.3ZM184 57H11.3a3 3 0 0 1-3-3V15.4a3 3 0 0 1 3-3H184a3 3 0 0 1 3.1 3v38.9a3 3 0 0 1-3 3ZM9.2 15.3v38.9c0 1 1 2 2.1 2H184c1.3 0 2.2-1 2.2-2v-39c0-1-1-2-2.2-2H11.3a2 2 0 0 0-2.1 2Z"/>
            <path fill="#D0B26D" d="m18.6 48.8.2.1v.3l.6.4.8.3a7.8 7.8 0 0 0 2 .4 9.7 9.7 0 0 0 1.7-.2l.9-.4c.2-.2.3-.4.3-.7l-.3-.6-.8-.2a34 34 0 0 1-3.9-.4c-.5 0-.8-.2-1.2-.4l-.8-.8c-.2-.3-.3-.8-.3-1.3 0-.4 0-.7.2-1l.8-1c.4-.2.8-.5 1.4-.6a6 6 0 0 1 2-.3 8.8 8.8 0 0 1 2.8.5c.4 0 .7.2 1 .3h.9l.2.1-1.3 2.2h-.1l-.2-.5-.5-.4-.8-.3a6.7 6.7 0 0 0-2.8-.3c-.3 0-.6 0-.8.2l-.6.3-.2.5c0 .3.1.5.3.6.2.1.5.3.9.3l1.1.2a57 57 0 0 1 2.7.2l1.2.4c.4.2.6.5.9.8a2.7 2.7 0 0 1-.2 2.8c-.4.4-.8.7-1.3.9l-1.6.4a12.4 12.4 0 0 1-3.3 0 6.7 6.7 0 0 1-1.9-.6h-1l1-2.2ZM32 51.3l.1-.2v-5.8h-2.6l-.1.3H29v-2h.4v.3l.4.1h6.7l.1-.4h.3v2h-.3l-.1-.2h-2.6V51c0 .2 0 .3.3.3v.3h-2.4v-.3h.2Zm13-7.1c.5.1 1 .4 1.4.7a3.5 3.5 0 0 1 1.5 3c0 .6-.2 1.2-.4 1.7a4 4 0 0 1-1 1.2c-.5.3-1 .6-1.6.7a7.7 7.7 0 0 1-3.7 0c-.6-.1-1.1-.4-1.6-.7a3.5 3.5 0 0 1-1.4-3c0-.6.1-1.2.4-1.7a4 4 0 0 1 1-1.2c.5-.3 1-.6 1.6-.7a7 7 0 0 1 3.7 0Zm-3.1 1.2-1 .5-.7.8c-.2.4-.2.7-.2 1.2 0 .4 0 .7.2 1 .2.4.4.7.7.9l1 .5a3.6 3.6 0 0 0 3.3-.5l.7-.8.2-1.1c0-.5 0-.8-.2-1.2l-.7-.8-1-.5a3.6 3.6 0 0 0-2.3 0Zm8.1 6c.3 0 .4-.1.4-.3v-6.5c0-.2-.1-.3-.4-.3V44h2.7v.3l-.1.1.4.5 4.3 4.4v-4.7c0-.2 0-.3-.3-.3V44h2.2v.3c-.2 0-.3.1-.3.3V51c0 .2 0 .3.3.3v.3h-2.4v-.3l.1-.1-.1-.3-.4-.4-4.5-4.6V51c0 .2.1.3.4.3v.3H50v-.3Zm19.1-5.8c0-.2-.2-.3-.5-.3h-4.4V47h3.2l.1-.2h.4v1.8h-.4l-.1-.2h-3.2v2h4.6l.4-.1.1-.3h.3v2h-.3l-.1-.2H62v-.3h.2l.1-.3v-6.7H62V44h6.5c.4 0 .5 0 .5-.3h.4v2H69Zm17.4-1.2-.1-.3a1 1 0 0 0-.5 0h-6v2h4.2c.1 0 .2-.1.2-.3h.3v2.5h-.3c0-.3 0-.4-.2-.5l-.6-.1H80V51l.1.2h.4v.4h-3v-.3c.3 0 .4-.1.4-.3v-8c0-.2-.1-.3-.4-.3v-.3h8.9l.1-.4h.4v2.3h-.4Zm2.5 7h.4v-7H89V44h2.7v.3c-.3 0-.5.1-.5.3V51c0 .2.2.3.5.3v.3H89v-.3Zm13.3-6.9c.6.4.9 1 .9 1.8 0 .3 0 .6-.2.8a2 2 0 0 1-.5.7l-.6.4-.8.2L103 51l.3.3.4.2v.3h-2.8v-.3c.2 0 .3 0 .3-.2l-.3-.5-1.4-2h-2.6V51c0 .1 0 .2.2.2h.2v.4h-2.4v-.3c.2 0 .3-.1.3-.3v-6.5c0-.2-.1-.3-.3-.3V44h5c1 0 1.9.2 2.5.5Zm-2.6 2.8c1.2 0 1.8-.3 1.8-1 0-.3-.1-.6-.4-.7-.3-.2-.8-.3-1.4-.3H97v2h2.8Zm13.2-1.7c0-.2-.2-.3-.6-.3H108V47h3.3l.1-.2h.3v1.8h-.3c0-.1 0-.2-.2-.2H108v2h4.7l.3-.1.2-.3h.3v2h-.3c0-.1 0-.2-.2-.2h-7v-.3h.2v-7h-.2V44h6.4c.4 0 .6 0 .6-.3h.3v2h-.3Zm2.8 5.8c.3 0 .4-.1.4-.3v-6.5c0-.2-.1-.3-.4-.3V44h5c.8 0 1.4.1 1.9.4.5.2.9.5 1.2.8.3.4.6.8.7 1.2a4.5 4.5 0 0 1 0 2.9 3.3 3.3 0 0 1-1.9 2c-.5.3-1 .4-1.8.4h-5v-.3Zm4.5-1h1l1-.4.6-.8.2-1.4c0-.6 0-1-.2-1.4l-.6-.7a2 2 0 0 0-1-.3H118v5h2.3Zm12.3 1.3v-.3c.4 0 .6-.1.6-.3v-8c0-.2-.2-.3-.6-.3v-.3h6.3c1.2 0 2.1.2 2.8.6.6.5 1 1.2 1 2.1 0 1-.4 1.7-1 2.1-.7.5-1.6.7-2.8.7h-3.6v3c0 .3.2.4.6.4v.3h-3.3Zm6.6-5.3c.4 0 .7-.1 1-.3.3-.1.4-.4.4-.9 0-.4-.1-.7-.4-.9l-1-.2h-3.9v2.3h3.9Zm5.7 5h.4l.1-.3v-6.5l-.1-.2h-.4V44h2.8v.3c-.4 0-.6.1-.6.3V51c0 .2.2.3.6.3v.3h-2.8v-.3Zm10.4-6.1H151l-.3.1-.1.3h-.4v-2h.4c0 .2.1.3.4.3h7.2v.3l-5 6h4.3c.3 0 .4 0 .4-.3h.3v2h-.3c0-.2-.1-.2-.4-.2h-7.3v-.3l5-6Zm10 0h-4.1l-.4.1v.3h-.4v-2h.3c0 .2.2.3.5.3h7.2v.3l-5 6h4.3c.2 0 .4 0 .4-.3h.3v2h-.3c0-.2-.2-.2-.4-.2h-7.3v-.3l5-6Zm4.4 6.1.4-.2.2-.3 2.7-5.7a15 15 0 0 0 .2-.7v-.1h-.1V44h2.7v.3h-.1v.5l.2.3 3 6 .1.2h.2v.4h-2.5v-.3h.2v-.6l-.6-1h-3.8l-.5.9-.2.3v.3h.3v.4h-2.4v-.3Zm6-3-1.4-2.8-1.3 2.9h2.8Z" opacity=".8"/>
            <path fill="#D1B574" d="M180.9 39.7H15.2v-.5H181v.5Z"/>
            <path fill="#D0B26D" d="M15.2 40.3v-1.7H181v1.7H15.2Z"/>
            <path fill="#231F20" d="M181.1 40.6H15v-2.3h166v2.3Zm-165.6-.5h165.1v-1.3h-165v1.3Z"/>
          </svg>

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 52 53" class="block md:hidden aspect-1 w-12">
          <g>
            <rect width="46.8" height="46.8" x="2.7" y="2.6" fill="#832524" rx="2.3"/>
            <rect width="46.4" height="46.4" x="2.9" y="2.8" stroke="#d1b574" stroke-width=".5" rx="2.1"/>
          </g>
          <rect width="43.6" height="43.6" x="4.3" y="4.2" stroke="#d1b36d" stroke-width=".5" rx="1.2"/>
          <rect width="43.8" height="43.8" x="4.2" y="4.1" fill="#231f20" stroke="#d1b36d" stroke-width=".5" rx="1.2"/>
          <path fill="#d1b574" stroke="#d1b574" stroke-width=".4" d="M20 23.7h10q1.6 0 2.7-.6 1-.5 1-2.3t-1-2.3-2.7-.6H20zM21.5 39h-9.2v-1.2h.2q.9 0 1.3-.2l.2-.2.1-.3V14.7l-.3-.2-1.3-.2h-.2V13h17.3q4.6 0 7.4 1.7 2.7 1.8 2.7 6t-2.7 6a14 14 0 0 1-7.4 1.8H20v8.7l.3.2 1 .2h.2z"/>

        </svg>

        </div>

        <!-- Hamburger Menu Button (Mobile Only) -->
        <button
          @click="toggleMenu"
          class="md:hidden text-gold-50 hover:text-gold-200 transition-colors"
          aria-label="Toggle menu"
        >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 49 48" class="aspect-1 w-10 block">
  <path fill="#fbf9f1" d="M18.5 33.4q0-1 1-1h10q1 0 1 1v1.2q0 1-1 1h-10a1 1 0 0 1-1-1zm-4-10q0-1 1-1h18q1 0 1 1v1.2q0 1-1 1h-18a1 1 0 0 1-1-1zm-4-10q0-1 1-1h26q1 0 1 1v1.2q0 1-1 1h-26a1 1 0 0 1-1-1z"/>
</svg>
        </button>

        <!-- Navigation Menu (Desktop) -->
        <nav class="hidden md:flex justify-center">
          <ul class="flex space-x-8 text-gold-50 font-medium text-sm uppercase tracking-wide">
            <li><a href="https://www.piesanostogo.com/menu/" class="hover:text-gold-200 transition-colors">Menu</a></li>
            <li><a href="https://www.piesanostogo.com/location-hours/" class="hover:text-gold-200 transition-colors">Locations</a></li>
            <li><a href="https://www.piesanostogo.com/catering/" class="hover:text-gold-200 transition-colors">Catering</a></li>
            <li><a href="https://piesanostogo.cardfoundry.com/giftcards" class="hover:text-gold-200 transition-colors">Gift Cards</a></li>
            <li><a href="https://www.piesanostogo.com/careers/?loc=head" class="hover:text-gold-200 transition-colors">Careers</a></li>
          </ul>
        </nav>

      </div>

      <!-- Order Now Button (Desktop Only) -->
      <a href="https://www.piesanostogo.com/" class="hidden md:block px-4 py-2 bg-gold-400 rounded-xs font-medium text-sm uppercase tracking-wide hover:bg-gold-100 transition">Order Now</a>
    </div>

    <!-- Mobile Navigation Menu -->
    <nav
      v-if="isMenuOpen"
      class="md:hidden bg-red-950 border-t border-gold-900/50"
    >
      <ul class="flex flex-col text-gold-50 font-medium text-sm uppercase tracking-wide text-center">
          <li><a href="https://www.piesanostogo.com/menu/" class="border-b border-gold-900/50 block px-4 py-6 hover:bg-red-900 transition-colors">Menu</a></li>
            <li><a href="https://www.piesanostogo.com/location-hours/" class="border-b border-gold-900/50 block px-4 py-6 hover:bg-red-900 transition-colors">Locations</a></li>
            <li><a href="https://www.piesanostogo.com/catering/" class="border-b border-gold-900/50 block px-4 py-6 hover:bg-red-900 transition-colors">Catering</a></li>
            <li><a href="https://piesanostogo.cardfoundry.com/giftcards" class="border-b border-gold-900/50 block px-4 py-6 hover:bg-red-900 transition-colors">Gift Cards</a></li>
            <li><a href="https://www.piesanostogo.com/careers/?loc=head" class="border-b border-gold-900/50 block px-4 py-6 hover:bg-red-900 transition-colors">Careers</a></li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>