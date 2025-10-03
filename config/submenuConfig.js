// Configuration for which items appear in the drink submenu
// This allows mixing section headers and group headers in any order

export const SUBMENU_NAVIGATION = [
  // Section: ON TAP (shows the main section header)
  {
    id: 'on-tap',
    type: 'section'
  },

  // Groups from ON TAP section
  // {
  //   id: 'on-tap-sampler',
  //   type: 'group'
  // },
  // {
  //   id: 'on-tap-ciders',
  //   type: 'group'
  // },
  // {
  //   id: 'on-tap-ales-lagers-stouts',
  //   type: 'group'
  // },
  // {
  //   id: 'on-tap-wheat-wit-weiss',
  //   type: 'group'
  // },
  // {
  //   id: 'on-tap-ipas',
  //   type: 'group'
  // },
  // {
  //   id: 'on-tap-bottled',
  //   type: 'group'
  // },

  // Section: WINE (shows the main section header)
  {
    id: 'wine',
    type: 'section'
  },

  // Groups from WINE section
  {
    id: 'wine-blush',
    type: 'group'
  },
  {
    id: 'wine-white',
    type: 'group'
  },
  {
    id: 'wine-red',
    type: 'group'
  },

  // Section: COCKTAILS (shows the main section header)
  {
    id: 'signature-cocktails',
    type: 'group'
  }

  // Note: cocktails only has one group so we show the section instead
]

// Helper function to get filtered navigation items for the submenu
export function getSubmenuNavigationItems(sections, groups) {
  const navigationItems = []

  for (const configItem of SUBMENU_NAVIGATION) {
    if (configItem.type === 'section') {
      // Find the section
      const section = sections.find(s => s.id === configItem.id)
      if (section) {
        navigationItems.push({
          id: section.id,
          title: section.title,
          type: 'section'
        })
      }
    } else if (configItem.type === 'group') {
      // Find the group (groups have combinedId format like 'section-group')
      const group = groups.find(g => g.combinedId === configItem.id)
      if (group) {
        navigationItems.push({
          id: group.combinedId,
          title: group.title,
          type: 'group'
        })
      }
    }
  }

  return navigationItems
}

// Alternative: Simple array-based configuration
// If you prefer just listing the IDs you want to show:
export const SIMPLE_SUBMENU_IDS = [
  'on-tap',
  'bottled',
  'wine',
  'cocktails-cocktails',
  'cocktails-martinis'
]

// Helper for simple configuration
export function getSimpleSubmenuItems(sections, groups) {
  const navigationItems = []

  for (const itemId of SIMPLE_SUBMENU_IDS) {
    // Check if it's a section first
    const section = sections.find(s => s.id === itemId)
    if (section) {
      navigationItems.push({
        id: section.id,
        title: section.title,
        type: 'section'
      })
      continue
    }

    // Check if it's a group
    const group = groups.find(g => g.combinedId === itemId)
    if (group) {
      navigationItems.push({
        id: group.combinedId,
        title: group.title,
        type: 'group'
      })
    }
  }

  return navigationItems
}