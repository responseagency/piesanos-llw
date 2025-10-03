# Static Site Generation (SSG) Deployment Guide

## Overview

This application now uses **Vite SSG** to pre-render all 15 location pages at build time, enabling deployment to Netlify as pure static files with no server dependency.

## What Changed

### 1. Routing
- **Before:** URL parameters (`?location=bradenton`)
- **After:** Clean URLs (`/bradenton`, `/clermont`, etc.)

### 2. Data Fetching
- **Before:** Runtime API calls to Express server
- **After:** Build-time data fetching from Airtable into cache files

### 3. Services
- Both `airtable.js` and `location.js` now use static cache files
- No more Express server dependency in production

## Development Workflow

### Fetch Fresh Data
```bash
npm run prebuild
```
This fetches fresh data from Airtable and updates all cache files.

### Start Development Server
```bash
npm run dev
```
App runs using cached data (no Express server needed).

### Build for Production
```bash
npm run build
```
This runs `prebuild` automatically, then generates static files.

### Preview Production Build
```bash
npm run preview
```

## Netlify Deployment

### Initial Setup

1. **Create Netlify Site**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings** (should auto-detect from `netlify.toml`):
   - **Build command:** `npm run prebuild && npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18

3. **Set Environment Variables**
   Go to Site Settings → Environment Variables and add:
   - `VITE_AIRTABLE_TOKEN` - Your Airtable API token
   - `VITE_AIRTABLE_BASE_ID` - Your Airtable base ID
   - `VITE_AIRTABLE_TABLE_NAME` - Your beverages table name
   - `VITE_AIRTABLE_VIEW_ID` - Your beverages view ID
   - `VITE_AIRTABLE_LOCATIONS_TABLE_NAME` - Your locations table name

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live!

### Daily Auto-Rebuild Setup

To automatically fetch fresh data daily:

1. **Get Netlify Build Hook URL**
   - Go to Site Settings → Build & Deploy → Build Hooks
   - Click "Add build hook"
   - Name it "Daily Rebuild"
   - Select branch: `main`
   - Copy the webhook URL (e.g., `https://api.netlify.com/build_hooks/xxxxx`)

2. **Add GitHub Secret**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NETLIFY_BUILD_HOOK_URL`
   - Value: Paste your Netlify build hook URL

3. **Done!**
   - The GitHub Action in `.github/workflows/daily-rebuild.yml` will automatically trigger a Netlify rebuild every day at 6:00 AM UTC
   - You can also manually trigger it from GitHub Actions tab

## Location URLs

All 15 locations have clean URLs:

- `/bradenton`
- `/clermont`
- `/east-orlando-town-park`
- `/gainesville-millhopper-rd`
- `/gainesville-tower-rd`
- `/gainesville-university-ave`
- `/lake-city`
- `/ocala-canopy-oaks-otow`
- `/ocala-grand-oaks-by-trinity`
- `/st-augustine-cobble-stone-village`
- `/tallahasse`
- `/the-villages-lake-deaton`
- `/the-villages-southern-trace`
- `/viera`
- `/windemere`

## Files Modified

### Created
- `scripts/prebuild.js` - Fetches data from Airtable at build time
- `src/router.js` - Vue Router with location-based routes
- `src/composables/useLocationFilter.router.js` - Router-based location filtering
- `.github/workflows/daily-rebuild.yml` - GitHub Action for daily rebuilds
- `SSG_DEPLOYMENT_GUIDE.md` - This file

### Modified
- `package.json` - Added `prebuild` script, changed `build` to use `vite-ssg`
- `src/main.js` - Converted to ViteSSG entry point
- `src/services/airtable.js` - Uses static cache files
- `src/services/location.js` - Uses static cache files
- `src/App.vue` - Uses router-based location filtering
- `vite.config.js` - Added SSG configuration
- `netlify.toml` - Updated build command and redirects

## Troubleshooting

### Build Fails
- Check that all environment variables are set in Netlify
- Verify Airtable API token has proper permissions
- Check build logs in Netlify dashboard

### Data Not Updating
- Verify GitHub Action ran successfully
- Check that `NETLIFY_BUILD_HOOK_URL` secret is set correctly
- Manually trigger rebuild from Netlify or GitHub Actions

### Routes Not Working
- Verify `netlify.toml` has the redirect rule for SPA fallback
- Check that all location slugs match the generated routes

### Missing Data
- Run `npm run prebuild` locally to verify data fetching works
- Check cache files in `src/data/` directory
- Verify table names and view IDs in environment variables

## Manual Data Refresh

To manually update menu data:

1. Update data in Airtable
2. Either:
   - **Option A:** Go to Netlify dashboard → Deploys → Trigger deploy
   - **Option B:** Go to GitHub → Actions → Daily Netlify Rebuild → Run workflow
   - **Option C:** Push any commit to trigger automatic deploy

## Performance

- **Build time:** ~2-3 minutes (includes data fetching + SSG)
- **Page load:** <1 second (pre-rendered HTML)
- **SEO:** ✅ All pages crawlable
- **Cost:** FREE (Netlify free tier + GitHub Actions free tier)

## Next Steps

1. Deploy to Netlify
2. Set up environment variables
3. Configure GitHub secret for build hook
4. Test all 15 location URLs
5. Monitor first automated rebuild

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check GitHub Actions logs
3. Verify all environment variables are set
4. Ensure Airtable API token is valid
