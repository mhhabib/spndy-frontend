import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: '::',
		port: 8080,
	},
	plugins: [
		react(),
		mode === 'development' && componentTagger(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: [
				'favicon.svg',
				'apple-touch-icon.png',
				'icons/icon-192x192.png',
				'icons/icon-512x512.png',
			],
			manifest: {
				name: 'Spndy - Expense Tracker',
				short_name: 'Spndy',
				description: 'Track and manage your daily expenses easily.',
				theme_color: '#0ea5e9',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				id: '/',
				icons: [
					{
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /favicon\.(svg|ico)(\?.*)?$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'favicon-cache',
							expiration: {
								maxEntries: 2,
								maxAgeSeconds: 60 * 60, // 1 hour
							},
						},
					},
					{
						urlPattern: /^https:\/\/spndy\.xyz\/api\/.*$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60, // 1 hour
							},
							networkTimeoutSeconds: 5, // fallback to cache if slow
						},
					},
					{
						// Cache Google Fonts or CDN assets
						urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'font-cache',
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
							},
						},
					},
				],
				cleanupOutdatedCaches: true,
				skipWaiting: true,
				clientsClaim: true,
			},
		}),
	].filter(Boolean),
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
}));
