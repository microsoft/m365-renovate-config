/**
 * @typedef {{ start: string; end: string; }} Comments Marker comments for a section
 */

/**
 * Get marker comments wrapping a section
 * @param {string} desc
 * @param {string} [extraStartDesc]
 * @returns {Comments}
 */
export function getComments(desc, extraStartDesc) {
  return {
    start: `<!-- start ${desc}${extraStartDesc ? ` (${extraStartDesc})` : ''} -->`,
    end: `<!-- end ${desc} -->`,
  };
}

/**
 * Get section content between marker comments
 * @param {string} text
 * @param {Comments} comments
 * @returns {string}
 */
export function getMarkedSection(text, comments) {
  return text.split(comments.start)[1].split(comments.end)[0].trim();
}

/**
 * Get the text under each heading of the given level
 * @param {string} text
 * @param {number} level
 * @returns {string[]}
 */
export function splitByHeading(text, level) {
  return text.trim().split(new RegExp(`^(?=${'#'.repeat(level)} .*\n)`, 'gm'));
}

/**
 * Get the text of the first heading of the given level
 * @param {string} text
 * @param {number} level
 * @returns {string}
 */
export function getHeadingText(text, level) {
  return (text.match(new RegExp(`^${'#'.repeat(level)} (.*)`, 'm')) || [])[1]?.trim() || '';
}

/** @param {string} text */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]/g, '');
}
