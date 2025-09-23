import type { MenuPlugin, MenuConfig, DataAdapter } from '@/core/types'

/**
 * Plugin Manager for the generic menu system
 * Allows registration and management of different menu plugins
 */
export class PluginManager {
  private plugins = new Map<string, MenuPlugin>()
  private adapters = new Map<string, DataAdapter>()
  private activePlugin: MenuPlugin | null = null

  /**
   * Register a menu plugin
   */
  registerPlugin(plugin: MenuPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`)
      return
    }

    this.plugins.set(plugin.name, plugin)
    console.log(`Registered plugin: ${plugin.name} (type: ${plugin.type})`)
  }

  /**
   * Register a data adapter
   */
  registerAdapter(adapter: DataAdapter): void {
    if (this.adapters.has(adapter.name)) {
      console.warn(`Adapter ${adapter.name} is already registered`)
      return
    }

    this.adapters.set(adapter.name, adapter)
    console.log(`Registered adapter: ${adapter.name}`)
  }

  /**
   * Get a plugin by name
   */
  getPlugin(name: string): MenuPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get an adapter by name
   */
  getAdapter(name: string): DataAdapter | undefined {
    return this.adapters.get(name)
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): MenuPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): DataAdapter[] {
    return Array.from(this.adapters.values())
  }

  /**
   * Get plugins by type
   */
  getPluginsByType(type: string): MenuPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.type === type)
  }

  /**
   * Set the active plugin
   */
  setActivePlugin(pluginName: string): void {
    const plugin = this.getPlugin(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }
    this.activePlugin = plugin
  }

  /**
   * Get the active plugin
   */
  getActivePlugin(): MenuPlugin | null {
    return this.activePlugin
  }

  /**
   * Create a menu configuration by merging plugin defaults with overrides
   */
  createConfig(pluginName: string, overrides: Partial<MenuConfig> = {}): MenuConfig {
    const plugin = this.getPlugin(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }

    // Deep merge plugin defaults with overrides
    return this.deepMerge(plugin.defaultConfig as MenuConfig, overrides)
  }

  /**
   * Get available menu types (plugin types)
   */
  getAvailableTypes(): string[] {
    const types = new Set<string>()
    this.plugins.forEach(plugin => types.add(plugin.type))
    return Array.from(types).sort()
  }

  /**
   * Check if a plugin exists
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * Check if an adapter exists
   */
  hasAdapter(name: string): boolean {
    return this.adapters.has(name)
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(name: string): boolean {
    return this.plugins.delete(name)
  }

  /**
   * Unregister an adapter
   */
  unregisterAdapter(name: string): boolean {
    return this.adapters.delete(name)
  }

  /**
   * Deep merge utility function
   */
  private deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) return source
    if (typeof source !== 'object' || source === null) return target

    const result = { ...target }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (Array.isArray(source[key])) {
          result[key] = [...(result[key] || []), ...source[key]]
        } else if (typeof source[key] === 'object' && source[key] !== null) {
          result[key] = this.deepMerge(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }

    return result
  }

  /**
   * Get plugin info for debugging
   */
  getPluginInfo(): Array<{
    name: string
    type: string
    hasCustomComponents: boolean
    hasCustomComposables: boolean
  }> {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      type: plugin.type,
      hasCustomComponents: Boolean(plugin.customComponents),
      hasCustomComposables: Boolean(plugin.customComposables)
    }))
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager()