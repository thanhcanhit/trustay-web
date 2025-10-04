import { NextResponse } from 'next/server';

export function middleware() {
	// Middleware disabled - client-side routing will handle authentication
	// JWT tokens are stored in localStorage, not accessible from server-side middleware
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
