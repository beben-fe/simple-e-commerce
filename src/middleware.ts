import { NextRequest, NextResponse } from 'next/server';

const publicPages = ['/login'];

const authMiddleware = async (req: NextRequest, isAuthorized: boolean) => {
	if (isAuthorized) {
		return NextResponse.next();
	}
	const url = req.nextUrl.clone();
	url.pathname = '/login';
	return NextResponse.redirect(url);
};

export default async function middleware(req: NextRequest) {
	const publicPathnameRegex = new RegExp(
		`^(${publicPages.map((page) => page.replace(/\//g, '\\/')).join('|')})$`
	);
	const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

	const token = req.cookies.get('auth_token')?.value;

	if (isPublicPage && !token) {
		return NextResponse.next();
	}

	if (isPublicPage && token) {
		const url = req.nextUrl.clone();
		url.pathname = '/cart';
		return NextResponse.redirect(url);
	}

	return authMiddleware(req, Boolean(token));
}

export const config = {
	matcher: ['/((?!api|_next|.*\\..*).*)'],
};
