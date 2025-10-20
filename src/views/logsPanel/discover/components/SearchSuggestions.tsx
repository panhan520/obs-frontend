// components/SearchSuggestions.tsx
import { defineComponent, PropType, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { LogField } from '@/api/logsPanel/discover/interfaces'
import styles from '../index.module.scss'

// 运算符定义
const SEARCH_OPERATORS = [
  {
    operator: '=',
    syntax: 'attribute:value',
    description: '等于',
  },
  {
    operator: '≠',
    syntax: '-attribute:value',
    description: '不等于',
  },
  {
    operator: 'match',
    syntax: 'attribute:~value',
    description: '包含',
  },
  {
    operator: 'not match',
    syntax: '-attribute:~value',
    description: '不包含',
  },
  {
    operator: 'wildcard',
    syntax: 'attribute:*value*',
    description: '通配',
  },
  {
    operator: 'not wildcard',
    syntax: '-attribute:*value*',
    description: '反向通配',
  },
  {
    operator: 'exist',
    syntax: 'attribute:*',
    description: '存在',
  },
  {
    operator: 'not exist',
    syntax: '-attribute:*',
    description: '不存在',
  },
  {
    operator: 'regexp',
    syntax: 'attribute:/.*value.*/',
    description: '正则匹配',
  },
  {
    operator: 'not regexp',
    syntax: '-attribute:/.*value.*/',
    description: '反向正则匹配',
  },
]

export default defineComponent({
  name: 'SearchSuggestions',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    availableFields: {
      type: Array as PropType<LogField[]>,
      required: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
    cursorPosition: {
      type: Number,
      required: true,
    },
    onSelect: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const selectedIndex = ref(0)
    const suggestionsRef = ref<HTMLDivElement>()

    // 判断是否应该显示运算符建议
    const shouldShowOperators = computed(() => {
      if (!props.searchQuery || props.cursorPosition === 0) return false

      // 检查光标前是否有空格
      const beforeCursor = props.searchQuery.substring(0, props.cursorPosition)
      return beforeCursor.endsWith(' ')
    })

    // 获取建议列表
    const suggestions = computed(() => {
      if (shouldShowOperators.value) {
        return SEARCH_OPERATORS.map((op) => ({
          type: 'operator' as const,
          value: op.operator,
          label: op.operator,
          description: op.description,
          syntax: op.syntax,
        }))
      } else {
        // 显示所有字段
        return props.availableFields.map((field) => ({
          type: 'field' as const,
          value: field.name,
          label: field.name,
          description: field.type,
          syntax: `${field.name}:value`,
        }))
      }
    })

    // 处理键盘事件
    const handleKeydown = (e: KeyboardEvent) => {
      if (!props.visible) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
          break
        case 'Enter':
          e.preventDefault()
          if (suggestions.value[selectedIndex.value]) {
            props.onSelect(suggestions.value[selectedIndex.value].value)
          }
          break
        case 'Escape':
          e.preventDefault()
          props.onClose()
          break
      }
    }

    // 处理建议项点击
    const handleSuggestionClick = (suggestion: any) => {
      props.onSelect(suggestion.value)
    }

    // 重置选中索引
    const resetSelectedIndex = () => {
      selectedIndex.value = 0
    }

    // 监听建议列表变化，重置选中索引
    watch(() => suggestions.value, resetSelectedIndex)

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    return () => {
      if (!props.visible || suggestions.value.length === 0) {
        return null
      }

      return (
        <div class={styles.searchSuggestions} ref={suggestionsRef}>
          {/* 预览区域 */}
          {/* <div class={styles.suggestionPreview}>
            <div class={styles.previewIcon}>📄</div>
            <div class={styles.previewContent}>
              <div class={styles.previewLabel}>预览</div>
              <div class={styles.previewQuery}>
                {shouldShowOperators.value ? 'attribute:value' : '\'field\' = ""'}
              </div>
            </div>
          </div> */}

          {/* 建议列表 */}
          <div class={styles.suggestionList}>
            {suggestions.value.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}`}
                class={[
                  styles.suggestionItem,
                  index === selectedIndex.value ? styles.suggestionItemActive : '',
                ]}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div class={styles.suggestionContent}>
                  <div class={styles.suggestionOperator}>{suggestion.label}</div>
                  <div class={styles.suggestionSyntax}>{suggestion.syntax}</div>
                  <div class={styles.suggestionDescription}>{suggestion.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  },
})
