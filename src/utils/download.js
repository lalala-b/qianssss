/* eslint-disable import/prefer-default-export */
import axios from 'axios'

export const downloadFile = (url, params) => {
  axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    url,
    responseType: 'blob',
    data: JSON.stringify(params),
  }).then(res => {
    let fileName = ''
    const contentDisposition = res.headers['content-disposition']
    if (contentDisposition) {
      fileName = window.decodeURI(
        res.headers['content-disposition'].split('=')[1],
        'UTF-8'
      )
    }

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, fileName)
    } else {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      a.style.display = 'none'
      a.click()
      URL.revokeObjectURL(blobUrl)
    }
  })
}
