import type { MenuConfig, CategoryMappingRule, GroupingRule } from '../core/types'

/**
 * Example configuration for food menus
 * This demonstrates how the same system can be configured for different menu types
 */

// Food category patterns for auto-categorization
const FOOD_CATEGORY_RULES: CategoryMappingRule[] = [
  {
    field: 'name',
    patterns: [
      // Appetizers
      { pattern: /\b(wings?|chicken wings?|buffalo wings?)\b/i, categoryName: 'Wings' },
      { pattern: /\b(nachos?|nacho)\b/i, categoryName: 'Nachos' },
      { pattern: /\b(mozzarella sticks?|cheese sticks?)\b/i, categoryName: 'Cheese Sticks' },
      { pattern: /\b(calamari|squid)\b/i, categoryName: 'Calamari' },
      { pattern: /\b(bruschetta)\b/i, categoryName: 'Bruschetta' },

      // Main courses
      { pattern: /\b(pizza|pie)\b/i, categoryName: 'Pizza' },
      { pattern: /\b(burger|hamburger|cheeseburger)\b/i, categoryName: 'Burgers' },
      { pattern: /\b(pasta|spaghetti|fettuccine|penne|ravioli|lasagna)\b/i, categoryName: 'Pasta' },
      { pattern: /\b(steak|ribeye|filet|sirloin)\b/i, categoryName: 'Steaks' },
      { pattern: /\b(chicken|poultry)\b/i, categoryName: 'Chicken' },
      { pattern: /\b(fish|salmon|cod|halibut|sea bass)\b/i, categoryName: 'Seafood' },
      { pattern: /\b(salad|caesar|garden|cobb)\b/i, categoryName: 'Salads' },
      { pattern: /\b(sandwich|sub|panini|wrap)\b/i, categoryName: 'Sandwiches' },

      // Desserts
      { pattern: /\b(cake|cheesecake|chocolate cake)\b/i, categoryName: 'Cakes' },
      { pattern: /\b(ice cream|gelato|sorbet)\b/i, categoryName: 'Ice Cream' },
      { pattern: /\b(pie|apple pie|cherry pie)\b/i, categoryName: 'Pies' },
      { pattern: /\b(tiramisu|cannoli|brownie)\b/i, categoryName: 'Desserts' },
    ]
  }
]

// Food grouping rules that determine how items are organized into sections
const FOOD_GROUPING_RULES: GroupingRule[] = [
  {
    name: 'appetizers',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return /\b(appetizer|starter|wings?|nachos?|calamari|bruschetta|mozzarella sticks?)\b/i.test(name) ||
             item.metadata?.category?.toLowerCase().includes('appetizer')
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      if (name.includes('wings')) return 'Wings'
      if (name.includes('nacho')) return 'Nachos'
      if (name.includes('calamari')) return 'Seafood'
      if (name.includes('cheese') || name.includes('mozzarella')) return 'Cheese'
      return 'Other'
    },
    displayName: 'Appetizers',
    icon: '🥨',
    order: 1
  },
  {
    name: 'pizza',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return name.includes('pizza') || name.includes(' pie')
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      if (name.includes('margherita') || name.includes('cheese')) return 'Classic'
      if (name.includes('pepperoni') || name.includes('sausage') || name.includes('meat')) return 'Meat'
      if (name.includes('veggie') || name.includes('vegetable') || name.includes('mushroom')) return 'Vegetarian'
      if (name.includes('supreme') || name.includes('deluxe')) return 'Specialty'
      return 'Other'
    },
    displayName: 'Pizza',
    icon: '🍕',
    order: 2
  },
  {
    name: 'pasta',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return /\b(pasta|spaghetti|fettuccine|penne|ravioli|lasagna|linguine|tortellini)\b/i.test(name)
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      if (name.includes('cream') || name.includes('alfredo')) return 'Cream-based'
      if (name.includes('tomato') || name.includes('marinara') || name.includes('pomodoro')) return 'Tomato-based'
      if (name.includes('pesto')) return 'Pesto'
      if (name.includes('meat') || name.includes('bolognese')) return 'Meat'
      return 'Other'
    },
    displayName: 'Pasta',
    icon: '🍝',
    order: 3
  },
  {
    name: 'main-courses',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return /\b(steak|chicken|fish|salmon|burger|entree|main)\b/i.test(name) ||
             item.metadata?.category?.toLowerCase().includes('main')
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      if (name.includes('steak') || name.includes('beef')) return 'Beef'
      if (name.includes('chicken') || name.includes('poultry')) return 'Chicken'
      if (name.includes('fish') || name.includes('salmon') || name.includes('seafood')) return 'Seafood'
      if (name.includes('burger')) return 'Burgers'
      return 'Other'
    },
    displayName: 'Main Courses',
    icon: '🍖',
    order: 4
  },
  {
    name: 'salads',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return name.includes('salad')
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      if (name.includes('caesar')) return 'Caesar'
      if (name.includes('garden') || name.includes('house')) return 'Garden'
      if (name.includes('greek')) return 'Greek'
      if (name.includes('cobb')) return 'Cobb'
      return 'Specialty'
    },
    displayName: 'Salads',
    icon: '🥗',
    order: 5
  },
  {
    name: 'desserts',
    condition: (item) => {
      const name = item.name.toLowerCase()
      return /\b(dessert|cake|ice cream|pie|tiramisu|brownie|cheesecake)\b/i.test(name) ||
             item.metadata?.category?.toLowerCase().includes('dessert')
    },
    subcategoryExtractor: (item) => {
      const name = item.name.toLowerCase()
      if (name.includes('cake')) return 'Cakes'
      if (name.includes('ice cream') || name.includes('gelato')) return 'Ice Cream'
      if (name.includes('pie')) return 'Pies'
      return 'Other'
    },
    displayName: 'Desserts',
    icon: '🍰',
    order: 6
  },
  {
    name: 'other',
    condition: () => true, // Catch-all
    displayName: 'Other Items',
    icon: '🍽️',
    order: 99
  }
]

export const foodMenuConfig: MenuConfig = {
  title: 'Food Menu',
  fieldMapping: {
    id: 'id',
    name: 'fields.Name',
    price: 'fields.Price',
    isAvailable: 'fields.Available',
    description: 'fields.Description',
    categories: 'fields.Categories',
    type: 'fields.Type'
  },
  categoryRules: FOOD_CATEGORY_RULES,
  groupingRules: FOOD_GROUPING_RULES,
  displayOptions: {
    showStats: true,
    showFilters: true,
    allowSorting: true,
    itemsPerRow: 2, // Food items might need more space for descriptions
    theme: 'food'
  },
  metadata: {
    version: '1.0.0',
    type: 'food-menu'
  }
}