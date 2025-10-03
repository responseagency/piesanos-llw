<template>
  <div
    class="sticky z-40 bg-gold-50"
    style="border-bottom: 1px solid #7A580A"
    :style="{ top: promoBarHeight + 'px' }"
  >
    <div class="max-w-[1024px] mx-auto md:px-4">
      <nav
        class="flex md:justify-center space-x-8 relative overflow-x-auto md:overflow-x-visible scrollbar-hide px-4 md:px-0"
        ref="nav"
        @scroll="handleNavScroll"
      >
        <!-- Navigation Items -->
        <button
          v-for="(item, index) in allNavigationItems"
          :key="item.id"
          :ref="`navItem-${index}`"
          :data-nav-item="item.id"
          @click="scrollToItem(item.id, item.type)"
          :class="[
            'px-6 py-6 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap uppercase flex-shrink-0',
            activeItem === item.id
              ? 'text-[#3E1501]'
              : 'text-gray-600 hover:text-[#3E1501]'
          ]"
        >
          {{ item.title }}
        </button>

        <!-- Active Indicator Bar -->
        <div
          class="absolute bottom-0 h-0.5 transition-all duration-300 ease-in-out"
          style="background-color: #3E1501"
          :style="activeBarStyle"
        ></div>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { getSections, getAllGroups } from '../config/drinkGroupings'
import { getSimpleSubmenuItems } from '../config/submenuConfig'

export default {
  name: 'DrinkSubmenu',
  setup() {
    const activeItem = ref('')
    const sections = ref([])
    const groups = ref([])
    const allNavigationItems = ref([])
    const menuItems = ref([])
    const promoBarHeight = ref(0)
    const nav = ref(null)
    const isUserScrollingNav = ref(false)

    // Calculate promo bar height
    const updatePromoBarHeight = () => {
      const promoBar = document.querySelector('.promo-bar')
      promoBarHeight.value = promoBar ? promoBar.offsetHeight : 0
    }

    // Load sections and groups from config
    onMounted(() => {
      sections.value = getSections()
      groups.value = getAllGroups()

      // Use filtered navigation items from submenu config
      allNavigationItems.value = getSimpleSubmenuItems(sections.value, groups.value)

      if (allNavigationItems.value.length > 0) {
        activeItem.value = allNavigationItems.value[0].id
      }

      // Calculate promo bar height
      updatePromoBarHeight()

      // Get menu item refs after next tick
      nextTick(() => {
        menuItems.value = document.querySelectorAll('[data-section-id], [data-group-id]')
        setupScrollListener()
      })

      // Watch for promo bar changes (in case it gets closed)
      const observer = new MutationObserver(updatePromoBarHeight)
      observer.observe(document.body, { childList: true, subtree: true })

      onUnmounted(() => {
        observer.disconnect()
      })
    })

    // Computed style for the active indicator bar
    const activeBarStyle = computed(() => {
      const activeIndex = allNavigationItems.value.findIndex(item => item.id === activeItem.value)
      if (activeIndex === -1) return { width: '0px', left: '0px', opacity: '0' }

      // Always use the actual button element to calculate precise position
      const buttonElement = document.querySelector(`[data-nav-item="${activeItem.value}"]`)
      if (buttonElement) {
        const navElement = buttonElement.closest('nav')
        if (navElement) {
          const navRect = navElement.getBoundingClientRect()
          const buttonRect = buttonElement.getBoundingClientRect()
          // Add nav's scroll position to account for horizontal scrolling on mobile
          const left = buttonRect.left - navRect.left + navElement.scrollLeft
          const width = buttonRect.width

          return {
            width: `${width}px`,
            left: `${left}px`,
            opacity: '1'
          }
        }
      }

      // If button not found yet, hide the bar
      return {
        width: '0px',
        left: '0px',
        opacity: '0'
      }
    })

    // Scroll to item (section or group)
    const scrollToItem = (itemId, itemType) => {
      let element
      if (itemType === 'section') {
        element = document.querySelector(`[data-section-id="${itemId}"]`)
      } else {
        element = document.querySelector(`[data-group-id="${itemId}"]`)
      }

      if (element) {
        // Calculate total offset including promo bar and submenu height
        const submenuHeight = 96 // py-6 * 2 = 48px + some extra padding = ~96px
        const offset = promoBarHeight.value + submenuHeight + 20 // promo bar + submenu + extra buffer
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }

    // Handle navigation scroll (user swiping/scrolling the nav)
    const handleNavScroll = () => {
      isUserScrollingNav.value = true
      clearTimeout(handleNavScroll.timeout)
      handleNavScroll.timeout = setTimeout(() => {
        isUserScrollingNav.value = false
      }, 150)
    }

    // Scroll active nav item into view (mobile only)
    const scrollActiveItemIntoView = () => {
      if (isUserScrollingNav.value) return
      if (window.innerWidth >= 768) return // Skip on desktop (md breakpoint)

      const activeButton = document.querySelector(`[data-nav-item="${activeItem.value}"]`)
      if (activeButton && nav.value) {
        const navRect = nav.value.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()

        // Calculate if button is outside the visible area
        const isOutsideLeft = buttonRect.left < navRect.left
        const isOutsideRight = buttonRect.right > navRect.right

        if (isOutsideLeft || isOutsideRight) {
          // Scroll to center the active item
          const scrollLeft = activeButton.offsetLeft - (nav.value.offsetWidth / 2) + (activeButton.offsetWidth / 2)
          nav.value.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          })
        }
      }
    }

    // Set up scroll listener to update active item
    const setupScrollListener = () => {
      const handleScroll = () => {
        // Account for promo bar and submenu height in scroll detection
        const submenuHeight = 96
        const scrollPosition = window.scrollY + promoBarHeight.value + submenuHeight + 50

        // Find which item (section or group) is currently in view
        let currentItem = allNavigationItems.value[0]?.id || ''

        // Check all navigation items to find the one currently in view
        for (const item of allNavigationItems.value) {
          let element
          if (item.type === 'section') {
            element = document.querySelector(`[data-section-id="${item.id}"]`)
          } else {
            element = document.querySelector(`[data-group-id="${item.id}"]`)
          }

          if (element) {
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset
            if (scrollPosition >= elementTop - 100) {
              currentItem = item.id
            }
          }
        }

        if (currentItem !== activeItem.value) {
          activeItem.value = currentItem
          // Auto-scroll nav to show active item on mobile
          nextTick(() => {
            scrollActiveItemIntoView()
          })
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })

      // Cleanup
      onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
      })
    }

    return {
      activeItem,
      allNavigationItems,
      activeBarStyle,
      scrollToItem,
      promoBarHeight,
      nav,
      handleNavScroll
    }
  }
}
</script>

<style scoped>
/* Hide scrollbar for mobile navigation */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>