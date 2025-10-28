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
      operator: 'eq',
      value: '',
    })

    const handleAddFilter = () => {
      if (newFilter.field && newFilter.operator && newFilter.value) {
        // 验证过滤条件是否有效
        // const isValid = validateFilterCondition(newFilter)
        const filterWithValidation = { ...newFilter }

        emit('addFilter', filterWithValidation)
        newFilter.field = ''
        newFilter.operator = 'eq'
        newFilter.value = ''
        emit('update:modelValue', false)
      }
    }

    // 验证过滤条件是否有效
    const validateFilterCondition = (filter: FilterCondition) => {
      // 这里可以添加具体的验证逻辑
      // 例如：某些字段不允许某些操作符，某些值格式不正确等

      // 示例验证规则：
      // 1. 时间字段不能使用包含操作符
      if (filter.field.includes('timestamp') && filter.operator === 'contains') {
        return false
      }

      // 2. 数字字段不能使用通配符操作符
      if (filter.field.includes('id') && filter.operator === 'wildcard') {
        return false
      }

      // 3. 空值检查
      if (!filter.value.trim()) {
        return false
      }

      return true
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
                <ElOption label='等于 (=)' value='eq' />
                <ElOption label='不等于 (≠)' value='ne' />
                <ElOption label='包含 (match)' value='contains' />
                <ElOption label='不包含 (not match)' value='not_contains' />
                <ElOption label='通配 (wildcard)' value='wildcard' />
                <ElOption label='反向通配 (not wildcard)' value='not_wildcard' />
                <ElOption label='存在 (exist)' value='exists' />
                <ElOption label='不存在 (not exist)' value='not_exists' />
                <ElOption label='大于 (>)' value='gt' />
                <ElOption label='大于等于 (>=)' value='gte' />
                <ElOption label='小于 (<)' value='lt' />
                <ElOption label='小于等于 (<=)' value='lte' />
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
