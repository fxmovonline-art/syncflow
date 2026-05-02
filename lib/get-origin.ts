/**
 * Get the origin (protocol + host) dynamically from the request or environment
 * This ensures proper URL generation in both development and production
 */

/**
 * Get the origin from headers (server-side)
 * @param headers - The request headers object
 * @returns The origin URL (e.g., https://example.com)
 */
export function getOriginFromHeaders(headers: Headers): string {
  const host = headers.get("x-forwarded-host") || headers.get("host");
  const protocol = headers.get("x-forwarded-proto") || "https";
  
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
  
  return `${protocol}://${host}`;
}

/**
 * Get the origin from environment variables
 * Use this in server actions or API routes when headers are not available
 * @returns The origin URL
 */
export function getOriginFromEnv(): string {
  // In Vercel, VERCEL_URL contains the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Use explicit environment variable if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback for development
  return "http://localhost:3000";
}

/**
 * Get the origin - use in API routes with headers
 * @param headers - Optional headers object for more accurate detection
 * @returns The origin URL
 */
export function getOrigin(headers?: Headers): string {
  if (headers) {
    return getOriginFromHeaders(headers);
  }
  return getOriginFromEnv();
}
