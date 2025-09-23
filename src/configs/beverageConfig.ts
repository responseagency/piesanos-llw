import type { MenuConfig, CategoryMappingRule, GroupingRule } from '../core/types'

/**
 * Default configuration for beverage menus
 * This demonstrates how to configure the system for your current use case
 */

// Wine varietal patterns for auto-categorization
const WINE_CATEGORY_RULES: CategoryMappingRule[] = [
  {
    field: 'name',
    patterns: [
      { pattern: /\b(cabernet\s+sauvignon|cab\s+sauv)\b/i, categoryName: 'Cabernet Sauvignon' },
      { pattern: /\b(sauvignon\s+blanc|sauv\s+blanc)\b/i, categoryName: 'Sauvignon Blanc' },
      { pattern: /\b(pinot\s+noir)\b/i, categoryName: 'Pinot Noir' },
      { pattern: /\b(pinot\s+grigio|pinot\s+gris)\b/i, categoryName: 'Pinot Grigio' },
      { pattern: /\bchardonnay\b/i, categoryName: 'Chardonnay' },
      { pattern: /\bmerlot\b/i, categoryName: 'Merlot' },
      { pattern: /\briesling\b/i, categoryName: 'Riesling' },
      { pattern: /\bmoscato\b/i, categoryName: 'Moscato' },
      { pattern: /\bprosecco\b/i, categoryName: 'Prosecco' },
      { pattern: /\bchianti\b/i, categoryName: 'Chianti' },
      { pattern: /\brosé|rose\b/i, categoryName: 'Rosé' },
      { pattern: /\bmalbec\b/i, categoryName: 'Malbec' },
      { pattern: /\bzinfandel\b/i, categoryName: 'Zinfandel' },
      { pattern: /\bshiraz|syrah\b/i, categoryName: 'Shiraz' },
    ]
  }
]

// Beer style patterns for auto-categorization
const BEER_CATEGORY_RULES: CategoryMappingRule[] = [
  {
    field: 'name',
    patterns: [
      { pattern: /\b(double\s+ipa|imperial\s+ipa|dipa)\b/i, categoryName: 'Double IPA' },
      { pattern: /\b(hazy\s+ipa|new\s+england\s+ipa|neipa)\b/i, categoryName: 'Hazy IPA' },
      { pattern: /\b(session\s+ipa)\b/i, categoryName: 'Session IPA' },
      { pattern: /\bipa\b/i, categoryName: 'IPA' },
      { pattern: /\b(pale\s+ale)\b/i, categoryName: 'Pale Ale' },
      { pattern: /\b(wheat\s+beer|hefeweizen|witbier)\b/i, categoryName: 'Wheat Beer' },
      { pattern: /\b(light\s+beer|lite\s+beer)\b/i, categoryName: 'Light Beer' },
      { pattern: /\bstout\b/i, categoryName: 'Stout' },
      { pattern: /\bporter\b/i, categoryName: 'Porter' },
      { pattern: /\blager\b/i, categoryName: 'Lager' },
      { pattern: /\bpilsner\b/i, categoryName: 'Pilsner' },
    ]
  }
]

// Cocktail patterns for auto-categorization
const COCKTAIL_CATEGORY_RULES: CategoryMappingRule[] = [
  {
    field: 'name',
    patterns: [
      { pattern: /\bmartini\b/i, categoryName: 'Martini' },
      { pattern: /\bmargarita\b/i, categoryName: 'Margarita' },
      { pattern: /\bmojito\b/i, categoryName: 'Mojito' },
      { pattern: /\bcosmopolitan\b/i, categoryName: 'Cosmopolitan' },
      { pattern: /\b(old\s+fashioned)\b/i, categoryName: 'Old Fashioned' },
      { pattern: /\bmanhattan\b/i, categoryName: 'Manhattan' },
      { pattern: /\bnegroni\b/i, categoryName: 'Negroni' },
      { pattern: /\bcocktail\b/i, categoryName: 'Cocktail' },
    ]
  }
]

// Grouping rules that determine how items are organized into sections
const BEVERAGE_GROUPING_RULES: GroupingRule[] = [
  {
    name: 'wine',
    condition: (item) => {
      const name = item.name.toLowerCase()
      const type = item.metadata?.type?.toLowerCase() || ''
      return name.includes('wine') ||
             type.includes('wine') ||
             /\b(cabernet|merlot|chardonnay|sauvignon|pinot|riesling|moscato|chianti|rosé)\b/i.test(name)
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      // Determine wine subcategory (Red, White, Blush, Other)
      if (/\b(cabernet|merlot|pinot noir|shiraz|zinfandel|chianti|bordeaux|burgundy|barolo|brunello|tempranillo|malbec|sangiovese)\b/i.test(name)) {
        return 'Red'
      }
      if (/\b(chardonnay|sauvignon blanc|pinot grigio|pinot gris|riesling|moscato|gewürztraminer|albariño|viognier|prosecco|champagne)\b/i.test(name)) {
        return 'White'
      }
      if (/\b(rosé|rose|blush|pink|white zinfandel)\b/i.test(name)) {
        return 'Blush'
      }
      return 'Other'
    },
    displayName: 'Wine',
    icon: '🍷',
    order: 1
  },
  {
    name: 'beer',
    condition: (item) => {
      const name = item.name.toLowerCase()
      const type = item.metadata?.type?.toLowerCase() || ''
      return name.includes('beer') ||
             name.includes('ale') ||
             name.includes('lager') ||
             name.includes('ipa') ||
             name.includes('stout') ||
             name.includes('porter') ||
             type.includes('beer')
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      // Determine beer serving style (Draught, Bottles, Other)
      if (name.includes('draught') || name.includes('draft') || name.includes('tap') ||
          name.includes('glass') || name.includes('pint') || name.includes('snifter')) {
        return 'Draught'
      }
      if (name.includes('bottle') || name.includes('can')) {
        return 'Bottles'
      }
      return 'Other'
    },
    displayName: 'Beer',
    icon: '🍺',
    order: 2
  },
  {
    name: 'cocktails',
    condition: (item) => {
      const name = item.name.toLowerCase()
      const type = item.metadata?.type?.toLowerCase() || ''
      return name.includes('cocktail') ||
             name.includes('martini') ||
             name.includes('margarita') ||
             type.includes('cocktail')
    },
    displayName: 'Cocktails',
    icon: '🍸',
    order: 3
  },
  {
    name: 'hard-seltzer',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return name.includes('seltzer') || name.includes('white claw') || name.includes('truly')
    },
    displayName: 'Hard Seltzer',
    icon: '🥤',
    order: 4
  },
  {
    name: 'cider',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return name.includes('cider') || name.includes('angry orchard')
    },
    displayName: 'Cider',
    icon: '🍎',
    order: 5
  },
  {
    name: 'other',
    condition: () => true, // Catch-all for anything not matched above
    displayName: 'Other Beverages',
    icon: '🥃',
    order: 99
  }
]

export const beverageMenuConfig: MenuConfig = {
  title: 'Beverage Menu',
  fieldMapping: {
    id: 'id',                                    // Airtable record ID
    name: 'fields.Name',                         // Beverage name
    price: 'fields.Price',                       // Price field
    isAvailable: 'fields.Is valid size?',        // Availability field
    description: 'fields.Description',           // Optional description
    categories: 'fields.Beverage Categories (from Beverage Item)', // Category relationships
    type: 'fields.Beverage Type'                 // Type relationships
  },
  categoryRules: [
    ...WINE_CATEGORY_RULES,
    ...BEER_CATEGORY_RULES,
    ...COCKTAIL_CATEGORY_RULES
  ],
  groupingRules: BEVERAGE_GROUPING_RULES,
  displayOptions: {
    showStats: true,
    showFilters: true,
    allowSorting: true,
    itemsPerRow: 3,
    theme: 'default'
  },
  metadata: {
    version: '1.0.0',
    type: 'beverage-menu'
  }
}