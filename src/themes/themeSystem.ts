/**
 * Theme system for the generic menu application
 * Provides configurable styling and layout options
 */

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: {
    primary: string
    secondary: string
    accent: string
  }
  border: string
  success: string
  warning: string
  error: string
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface ThemeTypography {
  fontFamily: {
    primary: string
    secondary: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  fontWeight: {
    normal: string
    medium: string
    semibold: string
    bold: string
  }
}

export interface ThemeLayout {
  maxWidth: string
  gridCols: {
    mobile: number
    tablet: number
    desktop: number
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  shadow: {
    sm: string
    md: string
    lg: string
  }
}

export interface MenuTheme {
  name: string
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  layout: ThemeLayout
  customCSS?: string
}

// Default theme
export const defaultTheme: MenuTheme = {
  name: 'default',
  colors: {
    primary: '#3B82F6', // blue-500
    secondary: '#6B7280', // gray-500
    accent: '#8B5CF6', // violet-500
    background: '#F9FAFB', // gray-50
    surface: '#FFFFFF', // white
    text: {
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      accent: '#3B82F6' // blue-500
    },
    border: '#E5E7EB', // gray-200
    success: '#10B981', // emerald-500
    warning: '#F59E0B', // amber-500
    error: '#EF4444' // red-500
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Georgia, serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  layout: {
    maxWidth: '1280px',
    gridCols: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }
  }
}

// Beverage theme
export const beverageTheme: MenuTheme = {
  name: 'beverage',
  colors: {
    primary: '#7C3AED', // violet-600
    secondary: '#6B7280', // gray-500
    accent: '#F59E0B', // amber-500
    background: '#F9FAFB', // gray-50
    surface: '#FFFFFF', // white
    text: {
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      accent: '#7C3AED' // violet-600
    },
    border: '#E5E7EB', // gray-200
    success: '#10B981', // emerald-500
    warning: '#F59E0B', // amber-500
    error: '#EF4444' // red-500
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Playfair Display, serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  layout: {
    maxWidth: '1280px',
    gridCols: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }
  }
}

// Food theme
export const foodTheme: MenuTheme = {
  name: 'food',
  colors: {
    primary: '#DC2626', // red-600
    secondary: '#6B7280', // gray-500
    accent: '#F59E0B', // amber-500
    background: '#FFFBEB', // amber-50
    surface: '#FFFFFF', // white
    text: {
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      accent: '#DC2626' // red-600
    },
    border: '#FEF3C7', // amber-100
    success: '#10B981', // emerald-500
    warning: '#F59E0B', // amber-500
    error: '#EF4444' // red-500
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  typography: {
    fontFamily: {
      primary: 'Poppins, system-ui, sans-serif',
      secondary: 'Merriweather, serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  layout: {
    maxWidth: '1200px',
    gridCols: {
      mobile: 1,
      tablet: 1,
      desktop: 2
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.75rem',
      full: '9999px'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }
  }
}

// Theme registry
export const themes = {
  default: defaultTheme,
  beverage: beverageTheme,
  food: foodTheme
}

/**
 * Theme manager class
 */
export class ThemeManager {
  private currentTheme: MenuTheme = defaultTheme
  private customThemes = new Map<string, MenuTheme>()

  /**
   * Set the active theme
   */
  setTheme(themeName: string): void {
    const theme = this.getTheme(themeName)
    if (!theme) {
      console.warn(`Theme '${themeName}' not found, using default theme`)
      this.currentTheme = defaultTheme
      return
    }

    this.currentTheme = theme
    this.applyThemeToDocument()
  }

  /**
   * Get a theme by name
   */
  getTheme(themeName: string): MenuTheme | undefined {
    return themes[themeName as keyof typeof themes] || this.customThemes.get(themeName)
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): MenuTheme {
    return this.currentTheme
  }

  /**
   * Register a custom theme
   */
  registerTheme(theme: MenuTheme): void {
    this.customThemes.set(theme.name, theme)
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): string[] {
    return [
      ...Object.keys(themes),
      ...Array.from(this.customThemes.keys())
    ]
  }

  /**
   * Apply theme CSS variables to document
   */
  private applyThemeToDocument(): void {
    const root = document.documentElement
    const theme = this.currentTheme

    // Apply CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-surface', theme.colors.surface)
    root.style.setProperty('--color-text-primary', theme.colors.text.primary)
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary)
    root.style.setProperty('--color-text-accent', theme.colors.text.accent)
    root.style.setProperty('--color-border', theme.colors.border)
    root.style.setProperty('--color-success', theme.colors.success)
    root.style.setProperty('--color-warning', theme.colors.warning)
    root.style.setProperty('--color-error', theme.colors.error)

    // Apply typography
    root.style.setProperty('--font-family-primary', theme.typography.fontFamily.primary)
    root.style.setProperty('--font-family-secondary', theme.typography.fontFamily.secondary)

    // Apply layout
    root.style.setProperty('--max-width', theme.layout.maxWidth)
    root.style.setProperty('--border-radius-sm', theme.layout.borderRadius.sm)
    root.style.setProperty('--border-radius-md', theme.layout.borderRadius.md)
    root.style.setProperty('--border-radius-lg', theme.layout.borderRadius.lg)

    // Apply custom CSS if provided
    if (theme.customCSS) {
      this.injectCustomCSS(theme.customCSS)
    }
  }

  /**
   * Inject custom CSS into document
   */
  private injectCustomCSS(css: string): void {
    const existingStyle = document.getElementById('custom-theme-css')
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = 'custom-theme-css'
    style.textContent = css
    document.head.appendChild(style)
  }

  /**
   * Create a theme variant by modifying an existing theme
   */
  createThemeVariant(
    baseThemeName: string,
    variantName: string,
    modifications: Partial<MenuTheme>
  ): MenuTheme {
    const baseTheme = this.getTheme(baseThemeName)
    if (!baseTheme) {
      throw new Error(`Base theme '${baseThemeName}' not found`)
    }

    const variant: MenuTheme = {
      ...baseTheme,
      ...modifications,
      name: variantName,
      colors: { ...baseTheme.colors, ...modifications.colors },
      typography: { ...baseTheme.typography, ...modifications.typography },
      layout: { ...baseTheme.layout, ...modifications.layout }
    }

    this.registerTheme(variant)
    return variant
  }
}

// Global theme manager instance
export const themeManager = new ThemeManager()