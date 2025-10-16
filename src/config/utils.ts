
// 公共过滤空参数方法
export const filterEmptyParams = (obj: any) => {
  if (!obj) return obj
  const result = JSON.parse(JSON.stringify(obj))
  Object.keys(result).forEach((key) => {
    if (result[key] === '' || result[key] == null) {
      delete result[key]
    }
    if (typeof result[key] === 'object') {
      result[key] = filterEmptyParams(result[key])
    }
  })
  return result
}