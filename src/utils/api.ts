// src/utils/api.ts
import { API_BASE_URL } from '@/config/Config';

type ApiContext = {
	getToken: () => string | null;
	refreshAccessToken: () => Promise<string | null>;
	logout: () => Promise<void>;
};

export function createApiClient(ctx: ApiContext) {
	const authFetch = async (
		input: string,
		init?: RequestInit
	): Promise<Response> => {
		const makeRequest = async (t?: string | null) => {
			const headers = new Headers(init?.headers || {});
			if (t) headers.set('Authorization', `Bearer ${t}`);
			if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
				headers.set('Content-Type', 'application/json');
			}

			return fetch(
				input.startsWith('http') ? input : `${API_BASE_URL}${input}`,
				{
					...init,
					headers,
					credentials: 'include',
				}
			);
		};

		let res = await makeRequest(ctx.getToken());
		if (res.status !== 401) return res;

		const newToken = await ctx.refreshAccessToken();
		if (!newToken) {
			await ctx.logout();
			return res;
		}

		res = await makeRequest(newToken);
		if (res.status === 401) {
			await ctx.logout();
		}
		return res;
	};

	const parse = async (res: Response) => {
		const text = await res.text();
		try {
			return text ? JSON.parse(text) : null;
		} catch {
			return text;
		}
	};

	const handle = async <T>(res: Response): Promise<T> => {
		if (!res.ok) {
			const data = await parse(res);
			const err: any = new Error(res.statusText);
			err.status = res.status;
			err.data = data;
			throw err;
		}
		return parse(res);
	};

	return {
		get: async <T>(url: string, params?: Record<string, any>) => {
			let finalUrl = url;
			if (params) {
				const q = new URLSearchParams(params as any).toString();
				finalUrl += `?${q}`;
			}
			return handle<T>(await authFetch(finalUrl, { method: 'GET' }));
		},
		post: async <T>(url: string, body?: any) =>
			handle<T>(
				await authFetch(url, {
					method: 'POST',
					body: body ? JSON.stringify(body) : undefined,
				})
			),
		put: async <T>(url: string, body?: any) =>
			handle<T>(
				await authFetch(url, {
					method: 'PUT',
					body: body ? JSON.stringify(body) : undefined,
				})
			),
		del: async <T>(url: string) =>
			handle<T>(await authFetch(url, { method: 'DELETE' })),
	};
}
