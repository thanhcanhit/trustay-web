import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type ImageSize = '128x128' | '256x256' | '512x512' | '1024x1024' | 'original';

export interface ImageUrlOptions {
	size?: ImageSize;
	quality?: number;
	format?: 'jpg' | 'png' | 'webp';
}

export function getImageUrl(imagePath: string, options: ImageUrlOptions = {}): string {
	if (!imagePath) return '';

	// If it's already a full URL (starts with http:// or https://), return as-is
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		return imagePath;
	}

	const { size = 'original', quality, format } = options;
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustay.life';

	// Clean the image path (remove leading slash if present)
	const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

	// If original size requested, return full URL without sizing
	if (size === 'original') {
		const url = `${baseUrl}/${cleanPath}`;
		const params = new URLSearchParams();

		if (quality) params.append('quality', quality.toString());
		if (format) params.append('format', format);

		return params.toString() ? `${url}?${params.toString()}` : url;
	}

	// For sized images, insert size into the path
	// Transform: /images/filename.jpg -> /images/128x128/filename.jpg
	const pathParts = cleanPath.split('/');
	if (pathParts.length >= 2 && pathParts[0] === 'images') {
		pathParts.splice(1, 0, size);
		const sizedPath = pathParts.join('/');

		const url = `${baseUrl}/${sizedPath}`;
		const params = new URLSearchParams();

		if (quality) params.append('quality', quality.toString());
		if (format) params.append('format', format);

		return params.toString() ? `${url}?${params.toString()}` : url;
	}

	// Fallback: return original path with base URL
	return `${baseUrl}/${cleanPath}`;
}

export function getOptimizedImageUrl(
	imagePath: string,
	context: 'listing' | 'detail' | 'thumbnail' | 'gallery' = 'listing',
): string {
	const sizeMap: Record<typeof context, ImageSize> = {
		thumbnail: '128x128',
		listing: '256x256',
		detail: '512x512',
		gallery: '1024x1024',
	};

	return getImageUrl(imagePath, {
		size: sizeMap[context],
		format: 'webp',
		quality: context === 'thumbnail' ? 80 : 90,
	});
}
