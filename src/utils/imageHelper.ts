// src/utils/imageHelper.ts
type ImageType = 'thumb' | 'poster' | 'backdrop' | 'auto';

/**
 * Chuyển đổi URL ảnh từ phimimg.com sang WebP qua proxy
 * @param url - URL ảnh gốc từ API
 * @returns URL ảnh WebP đã được tối ưu
 */
export function getOptimizedImageUrl(url?: string): string {
  if (!url) return '';

  if (url.includes('/image.php')) return url;

  let fullUrl = url;
  if (!url.startsWith('http')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    fullUrl = `https://phimimg.com${path}`;
  }

  // Chỉ dùng proxy cho ảnh .jpg hoặc .png
  if (/\.(jpg|jpeg|png)$/i.test(fullUrl)) {
    return `https://phimapi.com/image.php?url=${encodeURIComponent(fullUrl)}`;
  }

  return fullUrl;
}


/**
 * Lấy URL ảnh tốt nhất từ movie object, thông minh hơn để dùng cho nhiều ngữ cảnh
 * @param movie - Movie object từ API
 * @param type - Loại ảnh mong muốn ('thumb' | 'poster' | 'backdrop' | 'auto')
 * @returns URL ảnh đã được tối ưu
 */
export function getMovieImage(
  movie: {
    backdrop_url?: string;
    poster_url?: string;
    thumb_url?: string;
  },
  type: ImageType = 'auto'
): string {
  let url = '';

  if (type === 'auto') {
    // Nếu có backdrop => dùng backdrop (phim màn ảnh rộng)
    if (movie.backdrop_url) {
      url = movie.backdrop_url;
    }
    // Nếu không có backdrop mà poster là ảnh ngang => dùng poster
    else if (movie.poster_url?.toLowerCase().includes('backdrop')) {
      url = movie.poster_url;
    }
    // Ưu tiên thumb nếu poster/backdrop không có
    else if (movie.thumb_url) {
      url = movie.thumb_url;
    }
    else {
      url = movie.poster_url || '';
    }
  } else {
    switch (type) {
      case 'backdrop':
        url = movie.backdrop_url || movie.poster_url || movie.thumb_url || '';
        break;
      case 'poster':
        url = movie.poster_url || movie.thumb_url || movie.backdrop_url || '';
        break;
      case 'thumb':
        url = movie.thumb_url || movie.poster_url || movie.backdrop_url || '';
        break;
    }
  }

  return getOptimizedImageUrl(url);
}
