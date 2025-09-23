import type { MenuPlugin } from '@/core/types'
import { beverageMenuConfig } from '@/configs/beverageConfig'
import BeverageMenuItem from './components/BeverageMenuItem.vue'
import BeverageSection from './components/BeverageSection.vue'
import { useWineGrouping } from './composables/useWineGrouping'
import { useBeverageStats } from './composables/useBeverageStats'

/**
 * Beverage-specific plugin that provides specialized components and logic
 * for displaying beverage menus with wine grouping and beer categorization
 */
export const beveragePlugin: MenuPlugin = {
  name: 'beverage-menu',
  type: 'beverage',
  defaultConfig: beverageMenuConfig,

  customComponents: {
    BeverageMenuItem,
    BeverageSection
  },

  customComposables: {
    useWineGrouping,
    useBeverageStats
  }
}

export default beveragePlugin