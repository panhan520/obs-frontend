import { defineComponent, PropType, ref } from 'vue'
import { ElCheckbox, ElIcon } from 'element-plus'
import styles from '../index.module.scss'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

export type StatusKey = 'Error' | 'Warn' | 'Info'

export default defineComponent({
  name: 'StatusFilter',
  props: {
    title: { type: String, default: 'Status' },
    /** 选中状态集合 */
    modelValue: { type: Array as PropType<StatusKey[]>, required: true },
    /** 计数 */
    counts: {
      type: Object as PropType<Record<StatusKey, number>>,
      required: true,
    },
    /** 是否已全部选中（用于标题小对勾图标控制，可扩展） */
    allSelected: { type: Boolean, default: false },
    collapsible: { type: Boolean, default: true },
    defaultCollapsed: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const collapsed = ref<boolean>(props.defaultCollapsed)
    const toggle = (key: StatusKey, checked: boolean) => {
      const next = new Set(props.modelValue)
      if (checked) next.add(key)
      else next.delete(key)
      const arr = Array.from(next) as StatusKey[]
      emit('update:modelValue', arr)
      emit('change', arr)
    }

    return () => (
      <div class={styles.panelSection}>
        <div
          class={styles.panelHeader}
          onClick={() => {
            if (props.collapsible) collapsed.value = !collapsed.value
          }}
        >
          <ElIcon>{collapsed.value ? <ArrowRight /> : <ArrowDown />}</ElIcon>
          <h4>{props.title}</h4>
        </div>
        {!collapsed.value ? (
          <div class={styles.statusList}>
            {(['Error', 'Warn', 'Info'] as StatusKey[]).map((k) => (
              <div class={styles.statusRow} key={k}>
                <ElCheckbox
                  modelValue={props.modelValue.includes(k)}
                  onChange={(val: boolean) => toggle(k, val)}
                />
                <span class={[styles.statusDot, styles[`dot${k}`]]}></span>
                <span class={styles.statusLabel}>{k}</span>
                <span class={styles.statusCount}>{props.counts[k] ?? 0}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  },
})
