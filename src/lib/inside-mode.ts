/**
 * Inside Mode Detection Utility
 * 
 * Detects if the user is accessing the platform in "Inside Mode" 
 * (for prison tablet access with restricted external links)
 * 
 * Detection methods:
 * 1. Subdomain: inside.h3network.org
 * 2. Query parameter: ?mode=inside
 */

/**
 * Check if the current request is in Inside Mode
 * Works on both server and client side
 */
export function isInsideMode(url?: string | URL): boolean {
    // Server-side: check headers or passed URL
    if (typeof window === 'undefined') {
        if (!url) return false;
        
        const urlObj = typeof url === 'string' ? new URL(url) : url;
        
        // Check subdomain
        if (urlObj.hostname === 'inside.h3network.org' || 
            urlObj.hostname === 'inside.localhost' ||
            urlObj.hostname.startsWith('inside.')) {
            return true;
        }
        
        // Check query parameter
        if (urlObj.searchParams.get('mode') === 'inside') {
            return true;
        }
        
        return false;
    }
    
    // Client-side: check window location
    const currentUrl = new URL(window.location.href);
    
    // Check subdomain
    if (currentUrl.hostname === 'inside.h3network.org' || 
        currentUrl.hostname === 'inside.localhost' ||
        currentUrl.hostname.startsWith('inside.')) {
        return true;
    }
    
    // Check query parameter
    if (currentUrl.searchParams.get('mode') === 'inside') {
        return true;
    }
    
    return false;
}

/**
 * Get the Inside Mode query parameter to append to links
 * Only returns '?mode=inside' if currently in query param mode
 */
export function getInsideModeParam(): string {
    if (typeof window === 'undefined') return '';
    
    const currentUrl = new URL(window.location.href);
    
    // Only preserve query param if we're using query param mode
    // (not subdomain mode)
    if (!currentUrl.hostname.startsWith('inside.') && 
        currentUrl.searchParams.get('mode') === 'inside') {
        return '?mode=inside';
    }
    
    return '';
}

/**
 * Sanitize a URL for Inside Mode
 * Returns '#' for external links, keeps internal navigation
 */
export function sanitizeUrl(url: string, insideMode: boolean = isInsideMode()): string {
    if (!insideMode) return url;
    
    // Empty or hash links are safe
    if (!url || url.startsWith('#')) return url;
    
    // Relative internal links are safe
    if (url.startsWith('/')) {
        return url + getInsideModeParam();
    }
    
    // Check if it's an internal link
    try {
        const urlObj = new URL(url);
        const currentHost = typeof window !== 'undefined' 
            ? window.location.hostname 
            : '';
        
        // If it's the same domain, allow it
        if (urlObj.hostname === currentHost || 
            urlObj.hostname.endsWith('h3network.org')) {
            return url;
        }
    } catch {
        // Invalid URL, return as-is if relative, block if not
        return url.startsWith('/') ? url : '#';
    }
    
    // External link - block it
    return '#';
}

/**
 * Get YouTube embed parameters for Inside Mode
 * Returns URL parameters that disable external navigation
 */
export function getYouTubeParams(insideMode: boolean = isInsideMode()): string {
    if (!insideMode) {
        // Normal mode - default YouTube params
        return 'rel=0&modestbranding=1';
    }
    
    // Inside mode - strict restrictions
    return [
        'rel=0',              // Don't show related videos
        'modestbranding=1',   // Minimal YouTube branding
        'fs=0',               // Disable fullscreen (prevents escape to YouTube)
        'disablekb=1',        // Disable keyboard shortcuts
        'iv_load_policy=3',   // Disable video annotations
        'playsinline=1',      // Play inline, not in separate player
        'controls=1',         // Show basic controls
        'showinfo=0',         // Hide video info
        'enablejsapi=0',      // Disable JavaScript API
    ].join('&');
}

/**
 * Strip external links from HTML content
 * Used for blog posts and rich text content
 */
export function stripExternalLinks(html: string, insideMode: boolean = isInsideMode()): string {
    if (!insideMode) return html;
    
    // Remove all <a> tags that point to external sites
    // Keep the text content, just remove the link
    return html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>(.*?)<\/a>/gi, 
        (match, href, attrs, text) => {
            // Keep internal links
            if (href.startsWith('/') || href.startsWith('#')) {
                return match;
            }
            
            // Check if it's an internal domain
            try {
                const url = new URL(href);
                if (url.hostname.endsWith('h3network.org')) {
                    return match;
                }
            } catch {
                // Invalid URL - keep text only
                return text;
            }
            
            // External link - remove the link, keep the text
            return text;
        });
}
