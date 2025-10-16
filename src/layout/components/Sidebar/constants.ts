import { ElMessageBox, ElMessage } from 'element-plus'
import { loginOut } from '@/api/login/index'

export const getActions = (router, UserStore, TagsViewStore, PermissionStore) => [
  {
    label: '账户信息',
    click: () => {
      router.push({ name: 'basicInfo' })
    },
  },
  {
    label: '退出登录',
    click: () => {
      ElMessageBox.confirm('您是否确认退出登录?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          // const res = await UserStore.logout({ userId: UserStore.userOrg.userId })
          const res = await loginOut({ userId: UserStore.userOrg.userId })
          UserStore.clearInfo()
          if (res.code == 200 && res.message == 'success') {
            TagsViewStore.clearVisitedView()
            PermissionStore.clearRoutes()
            ElMessage({
              type: 'success',
              message: '退出登录成功！',
            })
          }
          router.push('/login')
        })
        .catch((error) => {
          console.error(`退出登陆失败，失败原因：${error}`)
        })
    },
  },
]
