/* eslint-disable import/prefer-default-export */
/**
 * @param {string} path
 * @returns {Boolean}
 */
export function getExternal(path: string) {
  return /^(https?:|mailto:|tel:)/.test(path);
}
