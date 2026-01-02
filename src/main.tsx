import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
	import('virtual:pwa-register').then(({ registerSW }) => {
		const updateSW = registerSW({
			onNeedRefresh() {
				// Show a prompt when a new version is available
				if (confirm('A new version of Spndy is available. Reload now?')) {
					updateSW(true);
				}
			},
			onOfflineReady() {
				console.log('Spndy is ready to work offline 🎉');
			},
		});
	});
}
