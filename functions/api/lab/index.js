const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const ID_LENGTH = 6;
const MAX_PAYLOAD_BYTES = 100_000;
const TTL_SECONDS = 60 * 60 * 24 * 180; // 180 días

function generateId() {
	const bytes = new Uint8Array(ID_LENGTH);
	crypto.getRandomValues(bytes);
	let id = '';
	for (let i = 0; i < ID_LENGTH; i++) {
		id += ALPHABET[bytes[i] % ALPHABET.length];
	}
	return id;
}

export async function onRequestPost(context) {
	const { request, env } = context;

	let payload;
	try {
		payload = await request.json();
	} catch {
		return Response.json({ error: 'invalid_json' }, { status: 400 });
	}

	const serialized = JSON.stringify(payload);
	if (serialized.length > MAX_PAYLOAD_BYTES) {
		return Response.json({ error: 'payload_too_large' }, { status: 413 });
	}

	let id;
	for (let attempt = 0; attempt < 3; attempt++) {
		const candidate = generateId();
		const existing = await env.LAB_KV.get(candidate);
		if (!existing) {
			id = candidate;
			break;
		}
	}

	if (!id) {
		return Response.json({ error: 'id_generation_failed' }, { status: 500 });
	}

	try {
		await env.LAB_KV.put(id, serialized, { expirationTtl: TTL_SECONDS });
	} catch {
		return Response.json({ error: 'kv_write_failed' }, { status: 507 });
	}

	return Response.json({ id }, { status: 201 });
}
