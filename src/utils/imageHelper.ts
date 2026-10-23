import type { ImageMetadata } from 'astro';

export interface ResolvedImage {
  /** Astro-optimized image metadata object (used with <Image src={metadata} />) */
  metadata?: ImageMetadata;
  /** Browser-ready image URL (used with <img src={src} /> or client-side scripts) */
  src: string;
}

/**
 * Resolves an image URL against an Astro `import.meta.glob` asset map.
 * 
 * - If the URL is external (http/https), it returns the URL directly.
 * - If the URL matches a local file in src/assets/ (even if extensions differ, e.g. .jpg -> .webp),
 *   it returns the Astro ImageMetadata for build-time Sharp optimization and WebP conversion.
 * 
 * @example
 * ```ts
 * const localImages = import.meta.glob<{ default: ImageMetadata }>('../assets/news/*.*', { eager: true });
 * const { metadata, src } = resolveAssetImage(article.cover_image_url, localImages);
 * ```
 */
export function resolveAssetImage(
  rawUrl: string | undefined | null,
  assetMap: Record<string, { default: ImageMetadata }>
): ResolvedImage {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { src: '' };
  }

  // 1. External remote URLs (e.g. Supabase Storage, CDN, external links)
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return { src: rawUrl };
  }

  // 2. Check for nested paths like 'albums/3/1.jpg' or '3/1.jpg'
  const nestedMatch = rawUrl.match(/(?:albums\/)?(\d+\/[^/]+)$/i);
  const relativeSuffix = (nestedMatch ? nestedMatch[1] : rawUrl.split('/').pop() || '').toLowerCase();
  const rawStem = relativeSuffix.replace(/\.[^/.]+$/, '');

  // 3. Search in the eager asset map
  for (const [path, mod] of Object.entries(assetMap)) {
    const norm = path.toLowerCase();
    const base = (path.split('/').pop() || '').toLowerCase();
    const stem = base.replace(/\.[^/.]+$/, '');

    // Match either full subpath, exact filename, or stem (ignoring extension)
    if (
      norm.endsWith(relativeSuffix) ||
      base === relativeSuffix ||
      stem === rawStem ||
      norm.includes(rawStem)
    ) {
      return {
        metadata: mod.default,
        src: mod.default.src,
      };
    }
  }

  // Fallback to the original raw path if not found in local assets
  return { src: rawUrl };
}
