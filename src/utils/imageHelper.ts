// src/utils/imageHelper.ts

/**
 * Chuyển đổi URL ảnh từ phimimg.com sang WebP qua proxy
 * @param url - URL ảnh gốc từ API
 * @returns URL ảnh WebP đã được tối ưu
 */
export function getOptimizedImageUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Nếu URL đã là dạng proxy, trả về luôn
  if (url.includes('/image.php')) return url;
  
  // Nếu URL không có domain, thêm domain mặc định
  let fullUrl = url;
  if (!url.startsWith('http')) {
    // CRITICAL FIX: Đảm bảo có dấu / ở đầu path
    const path = url.startsWith('/') ? url : `/${url}`;
    fullUrl = `https://phimimg.com${path}`;
  }
  
  // Chuyển đổi sang WebP qua proxy của phimapi.com
  return `https://phimapi.com/image.php?url=${encodeURIComponent(fullUrl)}`;
}

/**
 * Lấy URL ảnh tốt nhất từ movie object
 * @param movie - Movie object từ API
 * @returns URL ảnh đã được tối ưu
 */
export function getMovieImageUrl(movie: {
  poster_url?: string;
  thumb_url?: string;
}): string {
  const imageUrl = movie.poster_url || movie.thumb_url;
  return getOptimizedImageUrl(imageUrl);
}