import { defineComponent, onMounted, ref, reactive, PropType, watch } from 'vue'
import styles from './index.module.scss'
import { QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { FormItem } from './type'
import { Options } from '../../type'
import { existIndexApi, createIndexApi } from '~/api/logsPanel'
export default defineComponent({
  name: 'AddDialog',
  props: {
    options: {
      type: Array as PropType<Options[]>,
      default: () => [{}],
    },
  },
  emits: ['getList'],
  setup(props, { emit, expose }) {
    const form = ref<FormItem>({
      indexName: '',
      numberOfShards: '',
      numberOfReplicas: '',
      dataSourceId: null,
    })
    const visible = ref(false)
    /**提交表单 */
    const formRef = ref<FormInstance>()
    const handleSubmit = async () => {
      if (!formRef.value) return
      try {
        const valid = await formRef.value?.validate()
        if (valid) {
          createIndexApi(form.value).then((res) => {
            closeDialog()
            emit('getList')
          })
        }
      } catch {
        // 校验失败
      }
    }

    const closeDialog = () => {
      visible.value = false
      formRef.value?.resetFields()
    }
    const showDialog = () => {
      visible.value = true
    }
    /**校验indexName */
    const validatorIndexName = (_rule: any, value: any, callback: any) => {
      const rex = /^[a-z][a-z0-9-]*$/
      if (value) {
        if (!rex.test(value))
          return callback(new Error('名称必须以小字母开头，并且只能包含小写字母、数字或“-”字符'))
        if (form.value.dataSourceId) {
          existIndexApi({ indexName: value, dataSourceId: form.value.dataSourceId }).then((res) => {
            if (res.data.exist) {
              callback(new Error('索引名称已存在'))
            } else {
              callback()
            }
          })
        } else {
          callback()
        }
      } else {
        callback(new Error('请输入名称'))
      }
    }
    /**表单校验 */
    const rules = reactive<FormRules<typeof form>>({
      indexName: [
        { min: 3, max: 999, message: '请输入正确索引名', trigger: 'blur' },
        { required: true, validator: validatorIndexName, trigger: 'blur' },
      ],
      numberOfShards: [{ required: true, message: '请设置索引分片数', trigger: 'blur' }],
      numberOfReplicas: [{ required: true, message: '请设置索引分片副本数量', trigger: 'blur' }],
      dataSourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
    })

    expose({ showDialog })

    onMounted(() => {})
    watch(
      () => form.value.dataSourceId,
      () => {
        if (form.value.indexName) formRef.value?.validateField('indexName')
      },
    )
    return () => (
      <el-dialog
        v-model={visible.value}
        width={800}
        before-close={closeDialog}
        v-slots={{
          header: () => <h3 style='text-align: left;'>新增索引</h3>,
          footer: () => (
            <div class='dialog-footer'>
              <el-button onClick={closeDialog}>取消</el-button>
              <el-button type='primary' onClick={handleSubmit}>
                提交
              </el-button>
            </div>
          ),
        }}
      >
        <el-form
          ref={formRef}
          model={form}
          label-width='auto'
          label-position='left'
          style='max-width: 600px'
          rules={rules}
        >
          <el-steps direction='vertical' active={-1}>
            <el-step
              v-slots={{
                title: (
                  <>
                    <span>设置索引名</span>
                    <el-tooltip
                      effect='dark'
                      content='索引名称必须是唯一的。'
                      placement='top-start'
                    >
                      <el-icon>
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </>
                ),
                description: (
                  <el-form-item label='索引名' prop='indexName'>
                    <el-input v-model={form.value.indexName} />
                  </el-form-item>
                ),
              }}
            />
            <el-step
              title='选择索引源'
              v-slots={{
                description: (
                  <el-form-item label='索引源' prop='dataSourceId'>
                    <el-select
                      v-model={form.value.dataSourceId}
                      placeholder='请选择索引源'
                      style='width: 240px'
                    >
                      {props.options.map((item) => (
                        <el-option label={item.name} value={item.id} />
                      ))}
                    </el-select>
                  </el-form-item>
                ),
              }}
            />
            <el-step
              title='设置索引分片数'
              v-slots={{
                description: (
                  <>
                    <el-form-item label='索引分片数' prop='numberOfShards'>
                      <el-input-number
                        v-model={form.value.numberOfShards}
                        min={1}
                        max={9999}
                        controls-position='right'
                      />
                    </el-form-item>
                  </>
                ),
              }}
            />
            <el-step
              title='设置索引分片副本数量'
              v-slots={{
                description: (
                  <>
                    <el-form-item label='副本数量' prop='numberOfReplicas'>
                      <el-input-number
                        v-model={form.value.numberOfReplicas}
                        min={1}
                        max={9999}
                        controls-position='right'
                      />
                    </el-form-item>
                  </>
                ),
              }}
            />
          </el-steps>
        </el-form>
      </el-dialog>
    )
  },
})
