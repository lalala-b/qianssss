import qs from 'qs'

/* eslint-disable import/prefer-default-export */
/**
 * @param {string} url
 * @returns {}
 */
 export const getUrlQuery = (url = window.location.href) => {
   const index = url.indexOf('?');
   if (index === -1) return {};
   const query = url.slice(index + 1);
   return qs.parse(query);
 };
  