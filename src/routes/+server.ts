import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    return redirect(302, '/sources');
};