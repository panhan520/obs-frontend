// components/FilterDialog.tsx
import { defineComponent, PropType, reactive } from 'vue'
import { LogDocument, LogField, FilterCondition } from '@/api/logsPanel/discover/interfaces'
import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElInput, ElButton } from 'element-plus'
import styles from '../index.module.scss'

export default defineComponent({
  name: 'FilterDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    availableFields: {
      type: Array as PropType<LogField[]>,
      required: true,
    },
    currentDocument: {
      type: Object as PropType<LogDocument>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'addFilter'],
  setup(props, { emit }) {
    const newFilter = reactive<FilterCondition>({
      field: '',
      operator: 'is',
      value: '',
    })

    const handleAddFilter = () => {
      if (newFilter.field) {
        emit('addFilter', { ...newFilter })
        newFilter.field = ''
        newFilter.value = ''
        emit('update:modelValue', false)
      }
    }

    const handleClose = () => {
      emit('update:modelValue', false)
    }

    return () => (
      <ElDialog
        modelValue={props.modelValue}
        onUpdate:modelValue={handleClose}
        title='编辑筛选条件'
        width='600px'
        v-slots={{
          footer: () => (
            <span class={styles.dialogFooter}>
              <ElButton onClick={handleClose}>取消</ElButton>
              <ElButton type='primary' onClick={handleAddFilter}>
                保存
              </ElButton>
            </span>
          ),
        }}
      >
        <div class={styles.filterDialog}>
          <ElForm model={newFilter} labelWidth='80px'>
            <ElFormItem label='字段'>
              <ElSelect v-model={newFilter.field} placeholder='选择字段'>
                {props.availableFields.map((field) => (
                  <ElOption key={field.name} label={field.name} value={field.name} />
                ))}
              </ElSelect>
            </ElFormItem>
            <ElFormItem label='运算符'>
              <ElSelect v-model={newFilter.operator}>
                <ElOption label='是' value='is' />
                <ElOption label='包含' value='contains' />
                <ElOption label='大于' value='gt' />
                <ElOption label='小于' value='lt' />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label='值'>
              <ElInput v-model={newFilter.value} />
            </ElFormItem>
          </ElForm>
        </div>
      </ElDialog>
    )
  },
})
