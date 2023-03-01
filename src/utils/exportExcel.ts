import querystring from 'qs'

type ExportExcelParamsType = {
  url: string,
  params: Record<string, any>
}


export default function exportExcel({
  url,
  params = {},
}: ExportExcelParamsType) {
  window.open(`${url}?${querystring.stringify(params)}`)
}