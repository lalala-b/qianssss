import { defineConfig } from '@zz-common/zapi-to-typescript'
import type { SharedConfig } from '@zz-common/zapi-to-typescript/lib/esm'

type OriginParams = NonNullable<SharedConfig['getRequestFunctionName']>
type GetRequestFunctionNameFnType = (pathNum: number,...args: Parameters<OriginParams>) => string
function fileNameFromInfo(interfaceInfo: any) {
  const basepath = interfaceInfo._project.basepath
  if (!basepath || basepath.indexOf('/') < 0) return `projectId_${interfaceInfo._project._id}`
  const path = basepath.split('/')
  return path[path.length - 1]
}
const getRequestFunctionNameFn: GetRequestFunctionNameFnType = (
  pathNum,
  interfaceInfo,
  changeCase
) => {
  const dirData = interfaceInfo.parsedPath.dir.split('/').slice(-pathNum)
  dirData.push(interfaceInfo.parsedPath.name)
  return changeCase.camelCase(dirData.join(' '))
}
export default defineConfig([
  {
    serverUrl: 'http://zapi.zhuanspirit.com/',
    typesOnly: true,
    target: 'typescript',
    reactHooks: {
      enabled: true,
    },
    prodEnvName: 'production',
    outputFilePath: interfaceInfo => `src/api/types/${fileNameFromInfo(interfaceInfo)}.ts`,
    dataKey: 'data',
    projects: [
      {
        token: '50864d39f8c3e28b8247',
        categories: [
          {
            id: [131582],
            getRequestFunctionName:  (...arg)=>getRequestFunctionNameFn(1,...arg),
          },
        ],
      },
    ],
  },
])
