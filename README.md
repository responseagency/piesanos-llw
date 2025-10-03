# Piesanos LBW - Beverage Menu System

A Vue.js 3 application for displaying restaurant beverage menus with intelligent categorization and dynamic data integration from Airtable.

## Location URLs

- **Bradenton**: https://drinks.piesanostogo.com/?location=bradenton
- **Clermont**: https://drinks.piesanostogo.com/?location=clermont
- **East Orlando - Town Park**: https://drinks.piesanostogo.com/?location=east-orlando-town-park
- **Gainesville - Millhopper Rd**: https://drinks.piesanostogo.com/?location=gainesville-millhopper-rd
- **Gainesville - Tower Rd**: https://drinks.piesanostogo.com/?location=gainesville-tower-rd
- **Gainesville - University Ave**: https://drinks.piesanostogo.com/?location=gainesville-university-ave
- **Lake City**: https://drinks.piesanostogo.com/?location=lake-city
- **Ocala - Canopy Oaks OTOW**: https://drinks.piesanostogo.com/?location=ocala-canopy-oaks-otow
- **Ocala - Grand Oaks by Trinity**: https://drinks.piesanostogo.com/?location=ocala-grand-oaks-by-trinity
- **St Augustine - Cobble Stone Village**: https://drinks.piesanostogo.com/?location=st-augustine-cobble-stone-village
- **Tallahasse**: https://drinks.piesanostogo.com/?location=tallahasse
- **The Villages - Lake Deaton**: https://drinks.piesanostogo.com/?location=the-villages-lake-deaton
- **The Villages - Southern Trace**: https://drinks.piesanostogo.com/?location=the-villages-southern-trace
- **Viera**: https://drinks.piesanostogo.com/?location=viera
- **Windemere**: https://drinks.piesanostogo.com/?location=windemere

## Features

### 🍷 Smart Wine Grouping
- Groups wines by brand and varietal (e.g., Canyon Road Merlot vs Canyon Road Pinot Noir)
- Multiple serving options (glass vs bottle) with individual pricing
- Wine subcategories: Red, White, Blush/Rosé, Other
- Clean serving display format: "Glass - 6oz", "Bottle - 25.4oz"

### 🍺 Beer Organization
- Subcategorized into Draught, Bottles, and Other
- Clean name display using producer and beverage item fields
- Format information control (can be hidden for cleaner display)
- Volume display integration

### 🍸 Cocktails & Other Beverages
- Smart categorization for cocktails, hard seltzers, ciders
- Configurable display options (hide glass information for cocktails)
- Format information can be toggled per beverage type

### 🤖 Dynamic Category Mapping
- Auto-detection of beverage categories from item names
- Fallback to manual category mapping for undetected items
- Real-time statistics showing mapping effectiveness
- Confidence-based categorization system

### 📊 Menu Analytics
- Summary statistics for each beverage type
- Average, minimum, and maximum pricing
- Item counts per category
- Smart category mapping statistics

## Technical Architecture

### Data Integration
- **Airtable API**: Token-based authentication with environment variables
- **Pagination**: Automatic handling of Airtable's 100-record limit to fetch all records
- **Caching**: 24-hour file-based cache for performance (`airtable-cache.json`, `locations-cache.json`, `lookup-tables-cache.json`)
- **Data Refresh**: Manual cache clearing via `/api/refresh-data` endpoint

### Components Structure
```
App.vue (main application)
├── WineSection.vue (specialized wine display)
│   └── WineItem.vue (individual wine with multiple servings)
├── BeerSection.vue (beer categorization)
│   └── BeverageSection.vue (reusable beverage display)
└── BeverageSection.vue (other beverages)
```

### Key Utilities
- `beverageOrganizer.js`: Core categorization and grouping logic
- `useDynamicCategoryMapping.js`: Intelligent category detection
- `useAirtable.js`: Data fetching and caching

## Configuration Options

### Display Flags
- `hideGlassInfo`: Remove glass/container information
- `hideFormatInfo`: Hide format details
- `showFormatInfo`: Toggle format display (default: true)
- `useCleanNames`: Build names from structured fields instead of composite names

### Beverage Type Specific Settings
- **Cocktails**: Glass info hidden, format info optional
- **Beer**: Format info disabled, clean names enabled
- **Hard Seltzer**: Format info disabled, category display hidden
- **Wine**: Enhanced serving display with format + volume

## Recent Improvements

### Wine Enhancements
- Fixed wine grouping to separate varietals properly
- Updated serving display format from "Bottle 25.4oz (Bottle)" to "Bottle - 25.4oz"
- Integrated actual Airtable fields ('Beverage Format', 'Volume') instead of parsing names
- Added beverage category badges with purple styling

### UI/UX Improvements
- Removed "is valid size" badges from all items
- Configurable format information display
- Clean beer names using producer + beverage item fields
- Hidden redundant category information for cocktails and hard seltzers

### Data Architecture
- Moved from parsing composite "Name" field to using structured Airtable fields
- Implemented proper null handling for optional fields like producer
- Added Volume field integration for accurate serving size display
- Enhanced category mapping with confidence scoring

## Environment Setup

### Prerequisites
- Node.js 18+
- Vue 3
- Tailwind CSS
- Airtable API access

### Environment Variables
```env
VITE_AIRTABLE_API_KEY=your_api_key_here
VITE_AIRTABLE_BASE_ID=your_base_id_here
```

### Installation
```bash
npm install
npm run dev     # Development server
npm run build   # Production build
```

## Data Schema

### Expected Airtable Fields
- `Name`: Composite display name (used for fallback only)
- `Price`: Numeric pricing
- `Beverage Type`: Category classification
- `Beverage Categories (from Beverage Item)`: Detailed categorization
- `Beverage Format`: Glass/Bottle format IDs
- `Volume`: Serving size in ounces
- `Producer (from Beverage Item)`: Brand/producer name
- `ABV (from Beverage Item)`: Alcohol by volume
- `Is valid size?`: Availability validation

### Format ID Mapping
```javascript
{
  'recDlaYGEmS23x6gB': 'Glass',
  'recJOuYK67z0S23Gg': 'Bottle'
}
```

## Performance Features
- Intelligent caching with automatic expiration
- Batch API requests
- Optimized component rendering with computed properties
- Minimal re-renders through reactive data management

## Future Enhancements
- Notes field integration (pending Airtable schema update)
- Additional beverage format support
- Enhanced filtering and sorting options
- Mobile-responsive improvements