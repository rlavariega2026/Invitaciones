import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/Invitaciones/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          // QR pages are standalone HTML tickets, never the React app shell.
          navigateFallbackDenylist: [/^\/Invitaciones\/QR(?:\/|$)/],
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/Invitaciones/',
          name: 'LAV Invitations',
          short_name: 'LAV Invit',
          description: 'Plataforma premium para crear, personalizar y compartir invitaciones digitales interactivas.',
          theme_color: '#FBF9F5',
          background_color: '#FBF9F5',
          display: 'standalone',
          start_url: '/Invitaciones/',
          scope: '/Invitaciones/',
          icons: [
            {
              src: '/Invitaciones/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/Invitaciones/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/Invitaciones/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
