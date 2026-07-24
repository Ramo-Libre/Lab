const TTL_SECONDS = 60 * 60 * 24 * 180; // 180 días

export async function onRequestGet(context) {
	const { params, env } = context;
	const id = params.id;

	if (!id || !/^[A-Za-z0-9]{4,12}$/.test(id)) {
		return Response.json({ error: 'invalid_id' }, { status: 400 });
	}

	const raw = await env.LAB_KV.get(id);
	if (raw === null) {
		return Response.json({ error: 'not_found' }, { status: 404 });
	}

	const response = new Response(raw, {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});

	context.waitUntil(
		env.LAB_KV.put(id, raw, { expirationTtl: TTL_SECONDS }).catch((err) => {
			console.error('[lab] TTL renewal failed', err);
		})
	);

	return response;
}
