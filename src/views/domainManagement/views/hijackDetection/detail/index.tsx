import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton, ElMessage } from 'element-plus'
import {
  getDetailApi,
  createApi,
  editApi,
  getNodesApi,
} from '~/api/domainManagement/hijackDetection'
import type { ILocationItem } from '~/api/domainManagement/dnsInspect/interfaces'
import { Field } from '@formily/core'
import Space from '~/basicComponents/space'
import FormilyForm from '~/basicComponents/formilyCmps/formilyForm'
import CommonLocations from '~/businessComponents/commonLocations'
import getSchema from './schema'
import styles from './index.module.scss'
import { hasPermission } from '~/utils/auth'

import type { IFormilyFormExpose } from '~/basicComponents/formilyCmps/formilyForm'

export default defineComponent({
  name: 'Detail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref<IFormilyFormExpose>()
    const schema = ref({})
    const isCreate = computed(() => route.path.includes('hijackDetectionCreate'))
    const confirm = async () => {
      try {
        const formData = await formRef.value?.formRef?.submit()
        const data = {
          ...(formData as Record<string, any>),
          whitelist: (formData as any).whitelist?.trim()?.split(/\s+/),
        }
        isCreate.value ? await createApi(data) : await editApi(data)
        router.back()
        ElMessage({
          message: `${isCreate ? '新增' : '编辑'}成功`,
          type: 'success',
        })
      } catch (error: any) {
        console.error(`提交失败，失败原因：${error}`)
      }
    }
    const foramt = (list: Record<string, ILocationItem[]>[]) => {
      try {
        const result = list.reduce((initVal, curItem) => {
          const formattedCurItem = (Object.entries(curItem)?.[0]?.[1] || []).map(
            (v1: ILocationItem) => ({
              /** 节点id */
              nodeId: v1.nodeId,
              /** 所属地区id */
              regionId: v1.zone,
              /** 所属地区名称 */
              regionName: v1.zone,
              /** 所属省份 */
              subdivision: v1.zone,
              /** 所属城市 */
              city: v1.nodeName,
              /** 运营商唯一标识 */
              asn: v1.ispCode,
              /** 运营商 */
              ispName: v1.ispName,
              /** 区域名称，比如：浙江杭州电信 */
              friendlyArea: `${v1.nodeName}`,
            }),
          )
          initVal = [...initVal, ...formattedCurItem]
          return initVal
        }, [])
        const nodesField = formRef.value.formRef.query('nodes')?.take() as Field
        nodesField.setComponentProps({
          ...(nodesField.componentProps || {}),
          options: result || [],
        })
        nodesField.value = result.map((v) => v.nodeId)
        // return nodesField.value
      } catch (error: any) {
        console.error(`【节点】数据格式转换失败，失败原因：${error}`)
      }
    }
    const init = async () => {
      schema.value = getSchema({ formRef })
      const res = await getNodesApi()
      foramt(res)
      if (!isCreate.value) {
        const res = await getDetailApi({ id: route.query.id })
        setTimeout(() => {
          const formValues = { ...res }
          if (Array.isArray(formValues.whitelist)) {
            formValues.whitelist = formValues.whitelist.join(' ')
          }
          formRef.value?.formRef?.setValues(formValues)
        }, 500)
      } else {
        setTimeout(async () => {
          formRef.value?.formRef?.setValues({ taskStatus: false })
        }, 500)
      }
    }
    onMounted(() => {
      init()
    })
    return () => (
      <Space direction='column' fill>
        <FormilyForm
          ref={formRef}
          class={styles.container}
          config={schema.value}
          components={{ CommonLocations }}
        />
        <Space class={styles.btnGroup} fill justify='end'>
          <ElButton
            onClick={() => {
              router.back()
            }}
          >
            取消
          </ElButton>
          <ElButton type='primary' onClick={confirm} disabled={!hasPermission(['domain:post'])}>
            保存
          </ElButton>
        </Space>
      </Space>
    )
  },
})
