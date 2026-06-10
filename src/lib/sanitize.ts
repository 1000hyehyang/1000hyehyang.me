const XSS_PATTERN = /[<>]/g;
const JS_PROTOCOL = /javascript:/gi;
const EVENT_HANDLER = /on\w+=/gi;

export function sanitizeTextInput(
  input: string,
  options?: { maxLength?: number }
): string {
  let sanitized = input
    .replace(XSS_PATTERN, "")
    .replace(JS_PROTOCOL, "")
    .replace(EVENT_HANDLER, "")
    .trim();

  if (options?.maxLength != null) {
    sanitized = sanitized.slice(0, options.maxLength);
  }

  return sanitized;
}
