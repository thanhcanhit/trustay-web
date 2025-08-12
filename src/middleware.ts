import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Get access token from cookies
	const accessToken = request.cookies.get('accessToken')?.value;

	// Define auth routes that should only be accessible when NOT logged in
	const authRoutes = ['/login', '/register'];

	// Define protected routes that require authentication
	const protectedRoutes = ['/dashboard', '/profile'];

	// Check if current path is an auth route (login/register)
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// Check if current path is a protected route
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	// If user is authenticated and trying to access auth routes (login/register)
	if (accessToken && isAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = '/';
		return NextResponse.redirect(url);
	}

	// If user is not authenticated and trying to access protected routes
	if (!accessToken && isProtectedRoute) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		return NextResponse.redirect(url);
	}

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
