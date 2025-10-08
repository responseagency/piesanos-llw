/**
 * Webhook endpoint to trigger Netlify rebuild via GET request
 * GET /api/rebuild?secret=your-secret
 *
 * Usage:
 * 1. Create a Build Hook in Netlify (Site settings > Build & deploy > Build hooks)
 * 2. Add the Build Hook URL as NETLIFY_BUILD_HOOK_URL environment variable
 * 3. Add REBUILD_SECRET environment variable for authentication
 *
 * Browser usage:
 * Visit: https://your-site.com/api/rebuild?secret=your-secret-here
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  // Verify secret token for security
  const secret = config.rebuildSecret || process.env.REBUILD_SECRET
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfiguration: REBUILD_SECRET not set. GET requests require authentication.'
    })
  }

  const providedSecret = query.secret as string
  if (providedSecret !== secret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid or missing rebuild secret'
    })
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
      triggeredAt: new Date().toISOString(),
      note: 'Build will start momentarily. Check Netlify dashboard for status.'
    }
  } catch (error) {
    console.error('Failed to trigger rebuild:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to trigger rebuild: ' + (error as Error).message
    })
  }
})
