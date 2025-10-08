# Webhook Setup Guide

This guide explains how to set up automatic rebuilds when your Airtable data changes.

## Setup Steps

### 1. Create a Netlify Build Hook

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Build hooks**
3. Click **Add build hook**
4. Name it something like "Airtable Data Update"
5. Select the branch to build (e.g., `main` or `feature/nuxt-4-ssr`)
6. Click **Save**
7. Copy the generated webhook URL (it looks like: `https://api.netlify.com/build_hooks/{id}`)

### 2. Add Environment Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
NETLIFY_BUILD_HOOK_URL=https://api.netlify.com/build_hooks/your-hook-id
REBUILD_SECRET=your-secret-key-here  (optional but recommended)
```

**Note:** The `REBUILD_SECRET` is optional but recommended for security. Use a strong random string.

### 3. Configure Airtable Automation (Option A)

If you want Airtable to automatically trigger rebuilds:

1. In your Airtable base, go to **Automations**
2. Create a new automation
3. **Trigger:** "When record is updated" or "When record matches conditions"
4. **Action:** "Send webhook request"
5. Configure the webhook:
   - **URL:** `https://your-site.netlify.app/api/rebuild`
   - **Method:** POST
   - **Headers:** Add `x-rebuild-secret: your-secret-key-here` (if using REBUILD_SECRET)
   - **Body:** `{"trigger": "airtable-update"}`

### 4. Manual Trigger (Option B)

You can also trigger rebuilds manually via API:

```bash
# Without authentication (if REBUILD_SECRET not set)
curl -X POST https://your-site.netlify.app/api/rebuild

# With authentication (if REBUILD_SECRET is set)
curl -X POST https://your-site.netlify.app/api/rebuild \
  -H "x-rebuild-secret: your-secret-key-here"
```

## Testing

Test your webhook endpoint:

```bash
curl -X POST https://your-site.netlify.app/api/rebuild \
  -H "x-rebuild-secret: your-secret-key-here" \
  -H "Content-Type: application/json"
```

You should receive a response like:

```json
{
  "success": true,
  "message": "Rebuild triggered successfully",
  "netlifyResponse": { ... },
  "triggeredAt": "2024-01-01T12:00:00.000Z"
}
```

## Security Notes

- Always use `REBUILD_SECRET` in production to prevent unauthorized rebuilds
- Keep your build hook URL and rebuild secret private
- Consider rate limiting if needed (Airtable automations have built-in limits)
- Monitor your Netlify build minutes usage

## Troubleshooting

**Error: "NETLIFY_BUILD_HOOK_URL not set"**
- Make sure you added the environment variable in Netlify
- Redeploy your site after adding the variable

**Error: "Unauthorized: Invalid rebuild secret"**
- Check that your `x-rebuild-secret` header matches the `REBUILD_SECRET` env variable
- Verify no extra spaces or characters

**Build not triggering:**
- Check Netlify's build logs for any errors
- Verify the build hook URL is correct
- Ensure your Airtable automation is enabled
