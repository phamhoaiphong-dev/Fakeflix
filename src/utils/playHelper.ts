// src/utils/playHelper.ts

export interface PlayOptions {
  slug?: string;
  episode?: {
    slug?: string;
    name?: string;
    server_name?: string;
  } | null;
}

/**
 * Validate episode slug
 */
const validateEpisodeSlug = (slug: string | undefined): string | null => {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const trimmedSlug = slug.trim();
  if (!trimmedSlug) {
    return null;
  }

  // Xóa "/" thừa ở đầu
  return trimmedSlug.startsWith('/') ? trimmedSlug.slice(1) : trimmedSlug;
};

/**
 * Xây dựng URL watch
 */
export const buildWatchUrl = (options: PlayOptions): string | null => {
  if (!options.slug || typeof options.slug !== 'string' || options.slug.trim() === '') {
    console.error('[playHelper] Invalid movie slug:', options.slug);
    return null;
  }

  const movieSlug = options.slug.trim();
  let url = `/watch/${movieSlug}`;

  if (options.episode) {
    const epSlug = validateEpisodeSlug(options.episode.slug);
    if (epSlug) {
      const cleanEpSlug = epSlug.split('/').pop() || epSlug;
      url += `?ep=${encodeURIComponent(cleanEpSlug)}`;
    }
  }

  return url;
};

/**
 * Navigation cơ bản
 */
export const handlePlayClick = (options: PlayOptions): boolean => {
  const url = buildWatchUrl(options);
  
  if (!url) {
    console.error('[playHelper] Failed to build watch URL');
    return false;
  }

  try {
    window.location.href = url;
    return true;
  } catch (error) {
    console.error('[playHelper] Navigation failed:', error);
    return false;
  }
};