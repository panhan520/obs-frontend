import getReqByProxyModule from '~/config/request'
import type { LoginParams } from './types'

import { PROXY } from '~/config/constants'
const userAxios = getReqByProxyModule({ proxyModule: PROXY.USER })

// 登录
export const loginApi = (data: LoginParams) => {
  return userAxios.post('/login', {
    ...data,
    type: 'ACCOUNT_TYPE_USERNAME'
  })
  // return userAxios.post('/user/login', data)
}
// 注册
export const registerUser = (data: registerUserParams) => {
  return userAxios.post('/registry', data)
}
// 发送邮件
export const sendEmail = (data: sendEmailParams) => {
  return userAxios.post('/code', data)
}
// 登出
export const loginOut = (params) => {
  return userAxios.get('/logout', params)
}
// 密码验证
export const checkApi = (data) => {
  return userAxios.post('/pwd/check', data)
}
// 邮箱验证
export const checkCodeApi = (data) => {
  return userAxios.post('/verify_code', data)
}
// 忘记密码
export const forgetPwsApi = (data) => {
  return userAxios.post('/pwd/forget', data)
}
// 修改密码
export const changePswApi = (data) => {
  return userAxios.patch('/pwd', data)
}
// 获取基本信息
export const infoApi = (data) => {
  return userAxios.get('/info/' + data)
}
// 修改邮箱
export const changeEmailApi = (data) => {
  return userAxios.post('/email', data)
}
