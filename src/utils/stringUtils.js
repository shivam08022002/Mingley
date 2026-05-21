/**
 * Unescapes unicode sequences in a string (e.g., \uD83C\uDF73 -> 🍳)
 */
export const unescapeUnicode = (str) => {
  if (!str) return '';
  try {
    // If it's already a proper emoji, this won't hurt.
    // If it contains literal \uXXXX sequences, this will convert them.
    return str.replace(/\\u([a-fA-F0-0]{4})/g, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    }).replace(/\\u([a-fA-F0-9]{4})/g, (match, grp) => {
        // Handle double escaped unicode or just single escaped
        return String.fromCharCode(parseInt(grp, 16));
    });
  } catch (e) {
    return str;
  }
};

/**
 * A more robust way to handle JSON-style unicode escaping
 */
export const decodeEmoji = (str) => {
  if (!str) return '';
  try {
    // This handles both simple and surrogate pair unicode sequences
    return str.replace(/\\u[a-fA-F0-9]{4}/g, (match) => {
      return JSON.parse(`"${match}"`);
    });
  } catch (e) {
    return str;
  }
};
