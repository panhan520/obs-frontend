import NProgress from 'nprogress'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import router from '~/routers/index'
import { useUserStore } from '~/store/modules/user'
import { usePermissionStore } from '~/store/modules/permission'
import { getToken } from '~/api/token'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false }) // NProgress Configuration
const whiteList = [
  '/login',
  '/auth-redirect',
  '/register',
  '/resetPsw',
] // 设置白名单
// 记录路由
let hasRoles = true
const independentPermission = async (to, from, next, UserStore, PermissionStore) => {
  // 开启进度条
  NProgress.start()
  // 设置标题
  if (typeof to.meta.title === 'string') {
    document.title = to.meta.title || 'vue-admin-perfect'
  }
  // 确定用户是否已登录过，存在Token
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，请重定向到主页
      next({ path: '/' })
    } else {
      try {
        // 路由添加进去了没有及时更新 需要重新进去一次拦截
        if (!PermissionStore.routes?.length) {
          // 获取权限列表进行接口访问 因为这里页面要切换权限
          const accessRoutes = await PermissionStore.generateRoutes(UserStore.roles)
          hasRoles = false
          accessRoutes.forEach((item) => router.addRoute(item)) // 动态添加访问路由表
          next({ ...to, replace: true }) // // 这里相当于push到一个页面 不在进入路由拦截
        } else {
          next() // // 如果不传参数就会重新执行路由拦截，重新进到这里
        }
      } catch (error) {
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
}
const microAppPermission = async (to, from, next, UserStore, PermissionStore) => {
  NProgress.start()
  const isPublicPage = whiteList.indexOf(to.path) !== -1
  if (UserStore.userInfo || isPublicPage) {
    if (!PermissionStore.routes?.length) {
      // 获取权限列表进行接口访问 因为这里页面要切换权限
      const accessRoutes = await PermissionStore.generateRoutes(UserStore.roles)
      hasRoles = false
      accessRoutes.forEach((item) => router.addRoute(item)) // 动态添加访问路由表
      next({ ...to, replace: true }) // // 这里相当于push到一个页面 不在进入路由拦截
    } else {
      next()
    }
  } else {
    next() // 跳到没权限页面
  }
}
router.beforeEach(async (to, from, next) => {
  try {
    const UserStore = useUserStore()
    const PermissionStore = usePermissionStore()
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      console.log('🚀微前端')
      microAppPermission(
        to, from, next, UserStore, PermissionStore,
      )
    } else {
      console.log('🚀独立部署')
      await independentPermission(
        to, from, next, UserStore, PermissionStore,
      )
    }
  } catch (error: any) {
    console.error(`鉴权逻辑执行失败，失败原因：${error}`)
  }
})

router.afterEach(() => {
  NProgress.done()
})
