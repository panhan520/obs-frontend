import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { jwtDecode } from 'jwt-decode'
import { loginApi, loginOut } from '~/api/login/index'
import { setToken } from '~/api/token'

import type { JwtPayload } from 'jwt-decode'

export const useUserStore = defineStore('userState', () => {
  const userInfo = reactive({
    username: '',
    email: '',
    token: '',
  })
  const userOrg = reactive({
    userId: '',
    orgId: '',
    tenantId: '',
  })
  const roles = ref<string[]>(localStorage.roles ? JSON.parse(localStorage.roles) : [])
  const setUserEmail = (email: string) => {
    userInfo.email = email
  }
  const login = async (user: { username: string; password: string }) => {
    try {
      const res: Record<string, any> = await loginApi(user)
      if (res.code === 200 && res.message === 'success') {
        const token = res.data.token
        setToken(token)
        // 解析 jwt
        const decoded = jwtDecode<JwtPayload & { tenantId: string; orgId: string; username: string }>(token)
        userOrg.tenantId = decoded.tenantId
        userOrg.orgId = decoded.orgId
        userOrg.userId = res.data.uid
        userInfo.username = decoded.username
        userInfo.token = token
      } else {
        ElMessage.error(res.data)
      }
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  const getRoles = () => {
    return new Promise<string[]>((resolve) => {
      roles.value = ['admin']
      localStorage.roles = JSON.stringify(roles.value)
      resolve(roles.value)
    })
  }
  const getInfo = (newRoles: string[]) => {
    return new Promise<string[]>((resolve) => {
      roles.value = newRoles
      resolve(newRoles)
    })
  }
  const clearInfo = () => {
    // 清空状态
    userInfo.username = ''
    userInfo.email = ''
    userOrg.userId = ''
    userOrg.orgId = ''
    userOrg.tenantId = ''
    roles.value = []
    // 清空存储
    localStorage.clear()
    sessionStorage.clear()
  }
  const logout = async (data?: any) => {
    const res = await loginOut(data)
    // 清空状态
    userInfo.username = ''
    userInfo.email = ''
    userOrg.userId = ''
    userOrg.orgId = ''
    userOrg.tenantId = ''
    roles.value = []
    // 清空存储
    localStorage.clear()
    sessionStorage.clear()
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    if ((window as any).__JWT_CACHE__) delete (window as any).__JWT_CACHE__
    return Promise.resolve(res)
  }
  const setUserInfo = (globalUserInfo) => {
    userInfo.username = globalUserInfo.username
    userInfo.email = globalUserInfo.email
    userOrg.userId = globalUserInfo.userId
    userOrg.tenantId = globalUserInfo.tenantId
    userOrg.orgId = globalUserInfo.orgId
    // TODO；遗留bug，roles之前没有绑定过，所以目前只能留空数组跳过权限判断。后续再修改吧。
    // roles.value = userInfo.roles
    roles.value = []
  }
  /** 重置应用 */
  const resetApp = () => {
    console.log('子应用之默认【重置应用】方法')
  }
  return {
    userInfo,
    userOrg,
    roles,
    setUserEmail,
    login,
    getRoles,
    getInfo,
    logout,
    setUserInfo,
    resetApp,
    clearInfo,
  }
}, {
    // 持久化
    persist: {
      key: 'userState',
      storage: window.localStorage,
    },
  }
)
