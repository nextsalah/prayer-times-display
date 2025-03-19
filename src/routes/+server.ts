// src/routes/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    throw redirect(307, '/theme');
};