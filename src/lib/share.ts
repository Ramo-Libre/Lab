import { decodeUrlData, encodeUrlData } from '$lib/utils/url_data';
import type { Simulacion } from '$lib/state/simulaciones.svelte';

export async function shareLab(labData: unknown): Promise<string> {
	const origin = window.location.origin;

	try {
		const res = await fetch('/api/lab', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(labData)
		});

		if (!res.ok) throw new Error(`status ${res.status}`);

		const { id } = (await res.json()) as { id: string };
		return `${origin}/?s=${id}`;
	} catch (err) {
		console.warn('[share] fallback a Base64 por fallo de red/KV', err);
		const payload = encodeUrlData(labData);
		return `${origin}/?share=${payload}`;
	}
}

export async function hydrateFromUrl(): Promise<Simulacion | null> {
	const params = new URLSearchParams(window.location.search);

	const shortId = params.get('s');
	if (shortId) {
		try {
			const res = await fetch(`/api/lab/${shortId}`);
			if (res.ok) {
				return (await res.json()) as Simulacion;
			}
		} catch (err) {
			console.warn('[share] error hidratando desde enlace corto', err);
		}
		return null;
	}

	const shared = params.get('share');
	if (shared) {
		try {
			return decodeUrlData<Simulacion>(shared);
		} catch (err) {
			console.warn('[share] enlace share inválido', err);
		}
	}

	return null;
}
