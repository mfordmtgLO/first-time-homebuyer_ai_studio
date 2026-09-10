// Utility to strictly detect, block, and sanitize Social Security Numbers (SSN) from all chatbot inputs and messages.

/**
 * Checks whether a text string contains a US Social Security Number in common formats:
 * - 123-45-6789 (standard formatted 3-2-4)
 * - 123 45 6789 (space separated)
 * - 123.45.6789 (dot separated)
 * - 123456789 (9 consecutive digits where first 3 digits are not 000, 666, or 900-999)
 * - SSN keywords with trailing numbers
 */
export function containsSSN(text: string): boolean {
  if (!text) return false;
  const clean = text.trim();

  // Pattern 1: Formatted 3-2-4 digits (with hyphens, spaces, dots)
  // e.g. 540-00-1234, 540 00 1234, 540.00.1234
  const formattedSSNRegex = /\b(?!000|666|9\d{2})\d{3}[-.\s](?!00)\d{2}[-.\s](?!0000)\d{4}\b/;
  if (formattedSSNRegex.test(clean)) return true;

  // Pattern 2: 9 raw consecutive digits (e.g. 540001234)
  const raw9DigitsRegex = /\b(?!000|666|9\d{2})\d{9}\b/;
  if (raw9DigitsRegex.test(clean)) return true;

  // Pattern 3: Any explicit mention like "ssn is 123456789" or "social: 123-45-6789"
  const ssnKeywordRegex = /(?:ssn|social\s*security|social\s*#|social\s*sec)\s*(?:is|#|:-)?\s*\d{3}[-.\s]?\d{2}[-.\s]?\d{4}/i;
  if (ssnKeywordRegex.test(clean)) return true;

  // Pattern 4: Generalized 9 digits sequence even without strict word boundaries if preceded or followed by punctuation
  const generalized9Digits = /(^|[^\d])(?!000|666|9\d{2})\d{3}[-.\s]?(?!00)\d{2}[-.\s]?(?!0000)\d{4}([^\d]|$)/;
  if (generalized9Digits.test(clean)) return true;

  return false;
}

/**
 * Strips or redacts any possible SSN pattern from stored text as a defense-in-depth sanitization layer
 */
export function sanitizeSSN(text: string): string {
  if (!text) return "";
  let sanitized = text;

  // Redact formatted SSN
  sanitized = sanitized.replace(/\b(?!000|666|9\d{2})\d{3}[-.\s](?!00)\d{2}[-.\s](?!0000)\d{4}\b/g, "[REDACTED-SSN]");

  // Redact 9 digit sequences
  sanitized = sanitized.replace(/\b(?!000|666|9\d{2})\d{9}\b/g, "[REDACTED-SSN]");

  return sanitized;
}
