import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// The Content Picker (tv-features-test/content-picker.html) is the entry point for every demo,
// including the Vertical Feed app itself. Visiting the app's own URL ('/') directly bounces you
// to the picker instead — but the picker's own "Vertical" card still opens it, since that link
// carries ?from=picker, which this lets straight through.
function redirectRootToPicker() {
  return {
    name: 'redirect-root-to-picker',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname, search = ''] = (req.url || '').split('?')
        const cameFromPicker = new URLSearchParams(search).get('from') === 'picker'
        if (pathname === '/' && !cameFromPicker) {
          res.statusCode = 302
          res.setHeader('Location', '/tv-features-test/content-picker.html')
          res.end()
          return
        }
        next()
      })
    },
  }
}

// GitHub Pages serves this repo under /Vertical-Play/, so production builds need that base path.
// Dev keeps '/' so `npm run dev` stays at http://127.0.0.1:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Vertical-Play/' : '/',
  server: {
    // `npm run dev` opens the TV Content Picker (the entry point for every demo)
    // instead of the Vertical Feed app root; the app is still served at '/'
    // for the "Vertical" option in that picker to link to.
    open: '/tv-features-test/content-picker.html',
  },
  plugins: [
    redirectRootToPicker(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
