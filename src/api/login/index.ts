import getReqByProxyModule from '~/config/request'
import type { LoginParams } from './types'

import { PROXY } from '~/config/constants'
const userAxios = getReqByProxyModule({ proxyModule: PROXY.API })
const opensearchAxios = getReqByProxyModule({ proxyModule: PROXY.OPENSEARCH })

// 登录
export const loginApi = (data: LoginParams) => {
  data.type = 'ACCOUNT_TYPE_USERNAME'
  return userAxios.post('/api/v1/iam/login', data)
  // return userAxios.post('/user/v1/login', data)
}
// 注册
export const registerUser = (data: registerUserParams) => {
  return userAxios.post('/v1/registry', data)
}
// 发送邮件
export const sendEmail = (data: sendEmailParams) => {
  return userAxios.post('/v1/code', data)
}
// 登出
export const loginOut = (data) => {
  return userAxios.get('/api/v1/iam/logout', data)
}
// 密码验证
export const checkApi = (data) => {
  return userAxios.post('/v1/pwd/check', data)
}
// 邮箱验证
export const checkCodeApi = (data) => {
  return userAxios.post('/v1/verify_code', data)
}
// 忘记密码
export const forgetPwsApi = (data) => {
  return userAxios.post('/v1/pwd/forget', data)
}
// 修改密码
export const changePswApi = (data) => {
  return userAxios.patch('/v1/pwd', data)
}
// 获取基本信息
export const infoApi = (data) => {
  return userAxios.get('/v1/info/' + data)
}
// 修改邮箱
export const changeEmailApi = (data) => {
  return userAxios.post('/v1/email', data)
}
// openserch登录
export const opensearchLoginApi = (data) => {
  return opensearchAxios.post('auth/login?dataSourceId=', data, {
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'osd-version': '2.19.3-SNAPSHOT',
      'osd-xsrf': 'osd-fetch',
    },
  })
}
