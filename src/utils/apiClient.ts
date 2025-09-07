// src/utils/apiClient.ts
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/Config';

/**
 * useAuthFetch
 * - Attach the current access token
 * - If 401 => calls refreshAccessToken() and retries once
 * - Uses a single refresh promise handled by AuthContext
 */
export function useAuthFetch() {
	const { token, refreshAccessToken, logout } = useAuth();

	const authFetch = useCallback(
		async (input: string, init?: RequestInit): Promise<Response> => {
			const makeRequest = async (t?: string | null) => {
				const headers = new Headers((init?.headers as HeadersInit) || {});
				if (t) headers.set('Authorization', `Bearer ${t}`);
				// Ensure JSON as default unless caller overrides
				if (
					!headers.has('Content-Type') &&
					!(init && init.body instanceof FormData)
				) {
					headers.set('Content-Type', 'application/json');
				}

				const res = await fetch(
					input.startsWith('http') ? input : `${API_BASE_URL}${input}`,
					{
						...init,
						headers,
						credentials: 'include', // necessary for cookie-based refresh flow
					}
				);

				return res;
			};

			// initial attempt
			let response = await makeRequest(token);

			if (response.status !== 401) return response;

			// 401: try to refresh token
			const newToken = await refreshAccessToken();
			if (!newToken) {
				// refresh failed => logout
				await logout();
				return response; // original 401
			}

			// retry once with the new token
			response = await makeRequest(newToken);

			// if still 401, force logout
			if (response.status === 401) {
				await logout();
			}

			return response;
		},
		[token, refreshAccessToken, logout]
	);

	return authFetch;
}

/**
 * useApiClient
 * - Small typed wrapper around useAuthFetch for convenience
 * - Throws Error with useful message on non-ok responses
 * - All urls passed here should be relative to API_BASE_URL (e.g. '/expenses')
 */
export function useApiClient() {
	const authFetch = useAuthFetch();

	const parseJsonSafe = async (res: Response) => {
		const text = await res.text();
		try {
			return text ? JSON.parse(text) : null;
		} catch {
			return text;
		}
	};

	const handleRes = async (res: Response) => {
		if (res.ok) {
			return await parseJsonSafe(res);
		}

		const body = await parseJsonSafe(res);
		const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
		// @ts-ignore
		err['status'] = res.status;
		// @ts-ignore
		err['data'] = body;
		throw err;
	};

	// Updated get to accept optional params
	const get = async <T = any>(
		url: string,
		options?: { params?: Record<string, any>; init?: RequestInit }
	): Promise<T> => {
		let finalUrl = url;

		if (options?.params) {
			const query = new URLSearchParams();
			for (const key in options.params) {
				const value = options.params[key];
				if (value !== undefined && value !== null) {
					query.append(key, value.toString());
				}
			}
			finalUrl += `?${query.toString()}`;
		}

		const res = await authFetch(finalUrl, { method: 'GET', ...options?.init });
		return handleRes(res);
	};

	const post = async <T = any>(
		url: string,
		body?: any,
		options?: RequestInit
	): Promise<T> => {
		const res = await authFetch(url, {
			method: 'POST',
			body: body !== undefined ? JSON.stringify(body) : undefined,
			...options,
		});
		return handleRes(res);
	};

	const put = async <T = any>(
		url: string,
		body?: any,
		options?: RequestInit
	): Promise<T> => {
		const res = await authFetch(url, {
			method: 'PUT',
			body: body !== undefined ? JSON.stringify(body) : undefined,
			...options,
		});
		return handleRes(res);
	};

	const del = async <T = any>(
		url: string,
		options?: RequestInit
	): Promise<T> => {
		const res = await authFetch(url, { method: 'DELETE', ...options });
		return handleRes(res);
	};

	const postForm = async <T = any>(url: string, formData: FormData) => {
		const res = await authFetch(url, {
			method: 'POST',
			body: formData,
		});
		return handleRes(res);
	};

	return { get, post, put, del, postForm };
}
