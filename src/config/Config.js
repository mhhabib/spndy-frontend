export const API_BASE_URL =
	import.meta.env.MODE === 'development'
		? 'http://localhost:8008/api'
		: 'https://spndy.xyz/api';
