import { ref, computed, watch, onMounted } from 'vue'
import { themeManager, type MenuTheme } from '@/themes/themeSystem'

/**
 * Composable for theme management
 */
export function useTheme() {
  const currentThemeName = ref<string>('default')
  const availableThemes = ref<string[]>([])

  /**
   * Current theme object
   */
  const currentTheme = computed(() => {
    return themeManager.getCurrentTheme()
  })

  /**
   * Set the active theme
   */
  function setTheme(themeName: string): void {
    themeManager.setTheme(themeName)
    currentThemeName.value = themeName

    // Store in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('menu-theme', themeName)
    }
  }

  /**
   * Register a custom theme
   */
  function registerTheme(theme: MenuTheme): void {
    themeManager.registerTheme(theme)
    refreshAvailableThemes()
  }

  /**
   * Create a theme variant
   */
  function createThemeVariant(
    baseThemeName: string,
    variantName: string,
    modifications: Partial<MenuTheme>
  ): MenuTheme {
    const variant = themeManager.createThemeVariant(baseThemeName, variantName, modifications)
    refreshAvailableThemes()
    return variant
  }

  /**
   * Get CSS variables for the current theme
   */
  const themeVariables = computed(() => {
    const theme = currentTheme.value
    return {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-accent': theme.colors.accent,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-text-primary': theme.colors.text.primary,
      '--color-text-secondary': theme.colors.text.secondary,
      '--color-text-accent': theme.colors.text.accent,
      '--color-border': theme.colors.border,
      '--color-success': theme.colors.success,
      '--color-warning': theme.colors.warning,
      '--color-error': theme.colors.error,
      '--font-family-primary': theme.typography.fontFamily.primary,
      '--font-family-secondary': theme.typography.fontFamily.secondary,
      '--max-width': theme.layout.maxWidth,
      '--border-radius-sm': theme.layout.borderRadius.sm,
      '--border-radius-md': theme.layout.borderRadius.md,
      '--border-radius-lg': theme.layout.borderRadius.lg
    }
  })

  /**
   * Get Tailwind classes based on current theme
   */
  const themeClasses = computed(() => {
    const theme = currentTheme.value
    return {
      background: 'bg-[var(--color-background)]',
      surface: 'bg-[var(--color-surface)]',
      textPrimary: 'text-[var(--color-text-primary)]',
      textSecondary: 'text-[var(--color-text-secondary)]',
      textAccent: 'text-[var(--color-text-accent)]',
      border: 'border-[var(--color-border)]',
      primary: 'bg-[var(--color-primary)] text-white',
      secondary: 'bg-[var(--color-secondary)] text-white',
      accent: 'bg-[var(--color-accent)] text-white',
      success: 'bg-[var(--color-success)] text-white',
      warning: 'bg-[var(--color-warning)] text-white',
      error: 'bg-[var(--color-error)] text-white'
    }
  })

  /**
   * Get grid classes based on theme layout
   */
  const gridClasses = computed(() => {
    const layout = currentTheme.value.layout
    return {
      mobile: `grid-cols-${layout.gridCols.mobile}`,
      tablet: `md:grid-cols-${layout.gridCols.tablet}`,
      desktop: `lg:grid-cols-${layout.gridCols.desktop}`,
      responsive: `grid-cols-${layout.gridCols.mobile} md:grid-cols-${layout.gridCols.tablet} lg:grid-cols-${layout.gridCols.desktop}`
    }
  })

  /**
   * Get section header border color based on section type
   */
  function getSectionBorderColor(sectionName: string): string {
    const name = sectionName.toLowerCase()

    if (name.includes('wine')) return 'border-l-purple-600'
    if (name.includes('beer')) return 'border-l-yellow-600'
    if (name.includes('cocktail')) return 'border-l-pink-600'
    if (name.includes('food') || name.includes('pizza')) return 'border-l-red-600'
    if (name.includes('appetizer')) return 'border-l-green-600'
    if (name.includes('dessert')) return 'border-l-indigo-600'

    return 'border-l-[var(--color-primary)]'
  }

  /**
   * Get category badge classes based on category type
   */
  function getCategoryBadgeClasses(categoryName: string): string {
    const category = categoryName.toLowerCase()

    // Beer styles
    if (category.includes('ipa')) return 'bg-yellow-100 text-yellow-800'
    if (category.includes('stout') || category.includes('porter')) return 'bg-amber-100 text-amber-800'
    if (category.includes('lager') || category.includes('pilsner')) return 'bg-blue-100 text-blue-800'
    if (category.includes('wheat')) return 'bg-orange-100 text-orange-800'

    // Wine styles
    if (category.includes('cabernet') || category.includes('merlot')) return 'bg-red-100 text-red-800'
    if (category.includes('chardonnay') || category.includes('sauvignon')) return 'bg-green-100 text-green-800'
    if (category.includes('rosé')) return 'bg-pink-100 text-pink-800'

    // Food categories
    if (category.includes('pizza')) return 'bg-red-100 text-red-800'
    if (category.includes('pasta')) return 'bg-orange-100 text-orange-800'
    if (category.includes('salad')) return 'bg-green-100 text-green-800'
    if (category.includes('dessert')) return 'bg-purple-100 text-purple-800'

    // Default
    return 'bg-gray-100 text-gray-800'
  }

  /**
   * Refresh available themes list
   */
  function refreshAvailableThemes(): void {
    availableThemes.value = themeManager.getAvailableThemes()
  }

  /**
   * Load theme from localStorage on mount
   */
  onMounted(() => {
    refreshAvailableThemes()

    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('menu-theme')
      if (savedTheme && themeManager.getTheme(savedTheme)) {
        setTheme(savedTheme)
      }
    }
  })

  return {
    currentThemeName,
    currentTheme,
    availableThemes,
    themeVariables,
    themeClasses,
    gridClasses,
    setTheme,
    registerTheme,
    createThemeVariant,
    getSectionBorderColor,
    getCategoryBadgeClasses,
    refreshAvailableThemes
  }
}