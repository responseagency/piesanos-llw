import { defineNuxtModule } from '@nuxt/kit'
import { readFileSync, readdirSync, writeFileSync, unlinkSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Nuxt module to inline ALL CSS and remove external stylesheet links
 *
 * This module hooks into the build process after static generation completes
 * and performs the following steps:
 * 1. Finds all generated CSS files in the _nuxt directory
 * 2. Reads the CSS content
 * 3. Finds all HTML files in the dist directory
 * 4. Inlines the CSS into <style> tags in the <head>
 * 5. Removes external <link rel="stylesheet"> tags
 * 6. Deletes the external CSS files
 */
export default defineNuxtModule({
  meta: {
    name: 'inline-all-css',
    configKey: 'inlineAllCss'
  },
  setup(options, nuxt) {
    // Only run for static generation
    if (nuxt.options._generate) {
      nuxt.hook('close', async () => {
        console.log('🎨 Inlining all CSS...')

        const distDir = join(nuxt.options.rootDir, 'dist')
        const nuxtAssetsDir = join(distDir, '_nuxt')

        try {
          // Find all CSS files in _nuxt directory
          const cssFiles: string[] = []

          if (statSync(nuxtAssetsDir).isDirectory()) {
            const files = readdirSync(nuxtAssetsDir)
            for (const file of files) {
              if (file.endsWith('.css') && !file.endsWith('.gz') && !file.endsWith('.br')) {
                cssFiles.push(join(nuxtAssetsDir, file))
              }
            }
          }

          if (cssFiles.length === 0) {
            console.log('⚠️  No CSS files found to inline')
            return
          }

          // Read all CSS content
          let allCss = ''
          for (const cssFile of cssFiles) {
            const cssContent = readFileSync(cssFile, 'utf-8')
            allCss += cssContent + '\n'
            console.log(`📄 Read CSS from: ${cssFile}`)
          }

          // Find and process all HTML files
          const htmlFiles = findHtmlFiles(distDir)

          for (const htmlFile of htmlFiles) {
            let html = readFileSync(htmlFile, 'utf-8')

            // Remove all external stylesheet links
            html = html.replace(
              /<link[^>]+rel=["']stylesheet["'][^>]*>/gi,
              ''
            )

            // Check if we already have inlined styles
            const hasInlineStyles = html.includes('<style>')

            // Inject inline CSS into <head>
            if (hasInlineStyles) {
              // Append to existing style tags
              html = html.replace(
                '</style>',
                `\n${allCss}</style>`
              )
            } else {
              // Create new style tag in head
              html = html.replace(
                '</head>',
                `<style>${allCss}</style>\n</head>`
              )
            }

            // Write the modified HTML back
            writeFileSync(htmlFile, html, 'utf-8')
            console.log(`✅ Inlined CSS in: ${htmlFile}`)
          }

          // Delete the external CSS files and their compressed versions
          for (const cssFile of cssFiles) {
            try {
              unlinkSync(cssFile)
              console.log(`🗑️  Deleted: ${cssFile}`)

              // Also delete compressed versions
              const cssGz = `${cssFile}.gz`
              const cssBr = `${cssFile}.br`
              try { unlinkSync(cssGz) } catch {}
              try { unlinkSync(cssBr) } catch {}
            } catch (err) {
              console.warn(`⚠️  Could not delete ${cssFile}:`, err)
            }
          }

          console.log('✨ All CSS successfully inlined!')
        } catch (error) {
          console.error('❌ Error inlining CSS:', error)
        }
      })
    }
  }
})

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir: string): string[] {
  const htmlFiles: string[] = []

  try {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        htmlFiles.push(...findHtmlFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath)
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }

  return htmlFiles
}
