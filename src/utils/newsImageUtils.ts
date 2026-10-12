// Authentic Diocesan News Photography Fallbacks
export const DIOCESE_NEWS_IMAGES = [
  "/01.jpg",
  "/02.jpg",
  "/03.jpg",
  "/001.jpg",
  "/1.jpg"
];

/**
 * Returns a consistent, distinct diocesan photograph based on article ID or slug
 */
export const getArticleFallbackImage = (identifier?: number | string): string => {
  if (!identifier) return DIOCESE_NEWS_IMAGES[0];
  const num = typeof identifier === "number"
    ? identifier
    : String(identifier).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DIOCESE_NEWS_IMAGES[Math.abs(num) % DIOCESE_NEWS_IMAGES.length];
};

/**
 * Resolves article image URL with fallback to rotating diocese photos
 */
export const getArticleImage = (
  imagePath?: string | null,
  identifier?: number | string
): string => {
  if (imagePath && typeof imagePath === "string") {
    const trimmed = imagePath.trim();
    if (trimmed && !trimmed.includes("placeholder") && !trimmed.startsWith("blob:")) {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      if (/^\/?(?:001|01|02|03|1)\.jpg$/i.test(trimmed) || /^\/?logo/i.test(trimmed)) {
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      }
      const cleanPath = trimmed.replace(/^\/+/, "").replace(/^storage\//, "");
      return `/storage/${cleanPath}`;
    }
  }

  return getArticleFallbackImage(identifier);
};
