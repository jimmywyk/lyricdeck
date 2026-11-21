/**
 * CSS injection sanitization utilities.
 * Prevents malicious CSS values from being injected via inline styles.
 */

/** Valid CSS color pattern: hex, rgb/rgba, hsl/hsla, or named colors */
const SAFE_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$|^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+))?\s*\)$/;

/** CSS named colors (subset of most common ones) */
const CSS_NAMED_COLORS = new Set([
  'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange',
  'purple', 'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
  'teal', 'maroon', 'olive', 'aqua', 'fuchsia', 'silver', 'inherit', 'initial',
  'unset', 'currentcolor', 'currentColor',
]);

/**
 * Validates and sanitizes a CSS color value.
 * Returns the value if safe, otherwise returns the fallback.
 */
export function sanitizeColor(value: string | undefined | null, fallback: string = '#000000'): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (SAFE_COLOR_RE.test(trimmed)) return trimmed;
  if (CSS_NAMED_COLORS.has(trimmed)) return trimmed;
  return fallback;
}

/**
 * Validates a CSS gradient value.
 * Gradients must start with linear-gradient, radial-gradient, or conic-gradient
 * and must not contain dangerous patterns like `expression(` or `url(javascript:`.
 */
export function sanitizeGradient(value: string | undefined | null, fallback: string = 'linear-gradient(135deg, #1a1a2e, #16213e)'): string {
  if (!value) return fallback;
  const trimmed = value.trim().toLowerCase();

  // Must start with a valid gradient function
  if (!trimmed.startsWith('linear-gradient(') &&
      !trimmed.startsWith('radial-gradient(') &&
      !trimmed.startsWith('conic-gradient(') &&
      !trimmed.startsWith('repeating-linear-gradient(') &&
      !trimmed.startsWith('repeating-radial-gradient(') &&
      !trimmed.startsWith('repeating-conic-gradient(')) {
    return fallback;
  }

  // Reject dangerous patterns
  const dangerous = [
    'expression(',
    'javascript:',
    'vbscript:',
    'data:text/html',
    '-moz-binding',
    'behavior:',
    'binding:',
  ];
  for (const pattern of dangerous) {
    if (value.toLowerCase().includes(pattern)) {
      return fallback;
    }
  }

  return value;
}

/**
 * Validates an image URL for use in `backgroundImage`.
 * Only allows the safe `lyricdeck-img://` protocol or safe data URLs.
 */
export function sanitizeImageUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  // Allow our custom protocol
  if (trimmed.startsWith('lyricdeck-img://')) return trimmed;

  // Allow safe data URLs (images only)
  if (trimmed.startsWith('data:image/png') ||
      trimmed.startsWith('data:image/jpeg') ||
      trimmed.startsWith('data:image/gif') ||
      trimmed.startsWith('data:image/webp') ||
      trimmed.startsWith('data:image/bmp') ||
      trimmed.startsWith('data:image/svg+xml')) {
    return trimmed;
  }

  // Reject everything else
  return null;
}

/**
 * Validates a numeric value for use in CSS (e.g. overlay opacity).
 * Ensures the value is a finite number within the given range.
 */
export function sanitizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

/**
 * Builds a safe background CSS style object from a background settings object.
 * This is the recommended way to apply background styles from user data.
 */
export function safeBackgroundStyle(bg: {
  type: string;
  value?: string;
  overlayOpacity?: number;
  blur?: number;
}, fallbackColor: string = '#000000'): React.CSSProperties {
  switch (bg.type) {
    case 'color':
      return { backgroundColor: sanitizeColor(bg.value, fallbackColor) };
    case 'gradient':
      return { background: sanitizeGradient(bg.value) };
    case 'image': {
      const safeUrl = sanitizeImageUrl(bg.value);
      return safeUrl
        ? {
            backgroundImage: `url("${safeUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: bg.blur ? `blur(${sanitizeNumber(bg.blur, 0, 100, 0)}px)` : undefined,
          }
        : { backgroundColor: fallbackColor };
    }
    default:
      return { backgroundColor: fallbackColor };
  }
}
