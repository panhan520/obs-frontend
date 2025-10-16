import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton, ElMessage } from 'element-plus'
import { getDetailApi, createApi, editApi } from '~/api/domainManagement/dnsInspect'
import Space from '~/basicComponents/space'
import FormilyForm from '~/basicComponents/formilyCmps/formilyForm'
import CommonLocations from '~/businessComponents/commonLocations'
import getSchema from './schema'
import styles from './index.module.scss'

import type { IFormilyFormExpose } from '~/basicComponents/formilyCmps/formilyForm'

export default defineComponent({
  name: 'Detail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref<IFormilyFormExpose>()
    const schema = ref({})
    const isCreate = computed(() => route.path.includes('dnsInspectCreate'))
    const confirm = async () => {
      try {
        const formData = await formRef.value?.formRef?.submit()
        isCreate.value ? await createApi(formData) : await editApi(formData)
        router.back()
        ElMessage({
          message: `${isCreate ? '新增' : '编辑'}成功`,
          type: 'success'
        })
      } catch (error: any) {
        console.error(`提交失败，失败原因：${error}`)
      }
    }
    const init = async () => {
      schema.value = getSchema({ formRef })
      if (!isCreate.value) {
        const res = await getDetailApi({ id: route.query.id })
        setTimeout(() => {
          formRef.value?.formRef?.setValues(res)
        }, 500)
      } else {
        setTimeout(() => {
          formRef.value?.formRef?.setValues({ taskStatus: false, nodes: [] })
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
          <ElButton onClick={() => { router.back() }}>取消</ElButton>
          <ElButton type='primary' onClick={confirm}>保存</ElButton>
        </Space>
      </Space>
    )
  }
})
