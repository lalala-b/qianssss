/* eslint-disable import/prefer-default-export */
/**
 * @param {number} stamp
 * @returns {string}
 */
 export function formateDate(stamp: number) {
      if (!stamp) {
        return '--'
      }
      const dateObj = new Date(stamp)
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth() + 1
      const date = dateObj.getDate()
      return `${year}-${month.toString().length < 2 ? `0${month}` : month}-${date.toString().length < 2 ? `0${date}` : date}`
  }
  