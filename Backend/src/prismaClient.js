// src/prismaClient.js
const { PrismaClient } = require('@prisma/client');

const withStatementCacheDisabled = (url) => {
	if (!url) return url;
	const parts = url.split('?');
	const base = parts[0];
	const params = new URLSearchParams(parts[1] || '');

	if (!params.has('statement_cache_size')) {
		// Avoid prepared statement name collisions in pooled connections.
		params.set('statement_cache_size', '0');
	}

	if (!params.has('pgbouncer')) {
		// Safe for pooled connections and helps avoid prepared statement conflicts.
		params.set('pgbouncer', 'true');
	}

	if (!params.has('connection_limit')) {
		params.set('connection_limit', '5');
	}

	if (!params.has('pool_timeout')) {
		params.set('pool_timeout', '20');
	}

	const query = params.toString();
	return query ? `${base}?${query}` : base;
};

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: withStatementCacheDisabled(process.env.DATABASE_URL),
		},
	},
});

const prismaSingleton = globalThis.__prismaClient || prisma;
if (process.env.NODE_ENV !== 'production') {
	globalThis.__prismaClient = prismaSingleton;
}

module.exports = prismaSingleton;