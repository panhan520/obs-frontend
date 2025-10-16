import { defineComponent, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'
import { useRect } from '~/store/modules/useRect'
import styles from './index.module.scss'

import type { IRouteRecordRaw } from '~/interfaces/common'

export default defineComponent({
  name: 'Hamburger',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const breadcrumbRef = ref()
    const rectStore = useRect()
    const handleLink = (item) => {
      router.push({ name: item.name })
    }
    const matched = computed(() => (route.matched || []).filter((item) => item.meta && item.meta.title && item.meta.breadcrumb !== false))
    watch(() => route.name, async () => {
      await nextTick()
      rectStore.headerHeight = breadcrumbRef.value?.$el?.clientHeight || 0
    }, { immediate: true, deep: true })
    const customBreadcrumb = (breadcrumb: IRouteRecordRaw['meta']['breadcrumbConfig'] = []) => (
      breadcrumb.map(v => (
        <ElBreadcrumbItem key={v.name}>
          {
            v.name === route.name
              ? <span class="no-redirect">{ v.label }</span>
              : <a onClick={() => { handleLink(v) }}>{ v.label }</a>
          }
        </ElBreadcrumbItem>
      ))
    )
    const defaultBreadcrumb = (breadcrumb = []) => (
      breadcrumb.map((v, index) => (
        <ElBreadcrumbItem key={v.name}>
          {
            (v.redirect === 'noRedirect' || index == matched.value.length - 1)
              ? <span class="no-redirect">{ v.meta.title }</span>
              : <a onClick={() => { handleLink(v) }}>{ v.meta.title }</a>
          }
        </ElBreadcrumbItem>
      ))
    )
    return () => (
      <ElBreadcrumb ref={breadcrumbRef} class={['app-breadcrumb', styles.container]} separator="/">
        <transition-group name="breadcrumb">
          {
            route.meta?.breadcrumbConfig
              ? customBreadcrumb((route.meta?.breadcrumbConfig as IRouteRecordRaw['meta']['breadcrumbConfig']))
              : defaultBreadcrumb(matched.value)
          }
        </transition-group>
      </ElBreadcrumb>
    )
  }
})
