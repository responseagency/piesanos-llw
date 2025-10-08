/**
 * Webhook endpoint to trigger Netlify rebuild
 * POST /api/rebuild
 *
 * Usage:
 * 1. Create a Build Hook in Netlify (Site settings > Build & deploy > Build hooks)
 * 2. Add the Build Hook URL as NETLIFY_BUILD_HOOK_URL environment variable
 * 3. Optionally add REBUILD_SECRET for authentication
 *
 * Request:
 * POST /api/rebuild
 * Headers: { "x-rebuild-secret": "your-secret" }  // Optional if REBUILD_SECRET is set
 * Body: { "trigger": "airtable-update" }  // Optional metadata
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Optional: Verify secret token for security
  const secret = config.rebuildSecret || process.env.REBUILD_SECRET
  if (secret) {
    const providedSecret = getHeader(event, 'x-rebuild-secret')
    if (providedSecret !== secret) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Invalid rebuild secret'
      })
    }
  }

  // Get the Netlify Build Hook URL from environment
  const buildHookUrl = config.netlifyBuildHookUrl || process.env.NETLIFY_BUILD_HOOK_URL

  if (!buildHookUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfiguration: NETLIFY_BUILD_HOOK_URL not set'
    })
  }

  try {
    // Trigger the Netlify build
    const response = await fetch(buildHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Netlify responded with status: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      message: 'Rebuild triggered successfully',
      netlifyResponse: data,
      triggeredAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to trigger rebuild:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to trigger rebuild: ' + (error as Error).message
    })
  }
})
