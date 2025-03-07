import NodeCache from 'node-cache';

// Cache with 1 hour TTL
export const cache = new NodeCache({ stdTTL: 3600 });