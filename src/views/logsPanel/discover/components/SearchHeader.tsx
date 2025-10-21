// components/SearchHeader.tsx
import { defineComponent, ref, computed, PropType, watch } from 'vue'
import {
  Search as SearchIcon,
  Refresh,
  Calendar,
  Collection,
  CirclePlus,
} from '@element-plus/icons-vue'
import {
  ElInput,
  ElButton,
  ElPopover,
  ElTabs,
  ElTabPane,
  ElIcon,
  ElDatePickerPanel,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElSwitch,
} from 'element-plus'
import { LogField } from '@/api/logsPanel/discover/interfaces'
import SearchSuggestions from './SearchSuggestions'
import styles from '../index.module.scss'
import {
  RELATIVE_TIME_OPTIONS,
  DEFAULT_RELATIVE_AMOUNT,
  DEFAULT_RELATIVE_UNIT,
  DATE_FORMAT_OPTIONS,
  POPOVER_CONFIG,
  type RelativeTimeUnit,
  type TimeTab,
} from '../constants'

export default defineComponent({
  name: 'SearchHeader',
  props: {
    searchQuery: {
      type: String,
      required: true,
    },
    viewMode: {
      type: String as PropType<'time' | 'source'>,
      required: true,
    },
    availableFields: {
      type: Array as PropType<LogField[]>,
      required: true,
    },
    initialTimeRange: {
      type: Object as PropType<{ start: string | null; end: string | null }>,
      required: false,
    },
  },
  emits: [
    'update:searchQuery',
    'update:viewMode',
    'search',
    'addFilter',
    'refresh',
    'timeRangeUpdate',
  ],
  setup(props, { emit }) {
    const handleSearch = () => emit('search')
    const handleRefresh = () => emit('refresh')
    const handleAddFilter = () => emit('addFilter')

    // 搜索建议相关状态
    const suggestionsVisible = ref(false)
    const cursorPosition = ref(0)
    const searchInputRef = ref<any>() // ElInput 组件引用

    // 时间选择弹层
    const timeRangeVisible = ref(false)
    const activeTimePart = ref<'start' | 'end'>()
    const activeTab = ref<TimeTab>('absolute')
    const startDate = ref<Date | null>(new Date())
    const endDate = ref<Date | null>(new Date())
    const relativeAmount = ref<number>(DEFAULT_RELATIVE_AMOUNT)
    const relativeUnit = ref<RelativeTimeUnit>(DEFAULT_RELATIVE_UNIT)
    const includeWeek = ref(false)

    const formatDate = (d?: Date | null) => {
      if (!d) return ''
      return `${d.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)}.${String(
        d.getMilliseconds(),
      ).padStart(3, '0')}`
    }

    const setNow = () => {
      const now = new Date()
      if (activeTimePart.value === 'start') {
        startDate.value = now
      } else {
        endDate.value = now
      }
      timeRangeVisible.value = false
      handleSearch()
      emit('timeRangeUpdate', {
        start: startDate.value ? startDate.value.toISOString() : null,
        end: endDate.value ? endDate.value.toISOString() : null,
      })
    }

    // 计算相对时间
    const calculateRelativeTime = (amount: number, unit: RelativeTimeUnit) => {
      const now = new Date()
      const calculatedTime = new Date(now)
      const isFromNow = unit.includes('_from_now')
      const timeUnit = unit.replace('_from_now', '') as Exclude<
        RelativeTimeUnit,
        `${string}_from_now`
      >

      const multiplier = isFromNow ? 1 : -1

      switch (timeUnit) {
        case 'seconds':
          calculatedTime.setSeconds(calculatedTime.getSeconds() + amount * multiplier)
          break
        case 'minutes':
          calculatedTime.setMinutes(calculatedTime.getMinutes() + amount * multiplier)
          break
        case 'hours':
          calculatedTime.setHours(calculatedTime.getHours() + amount * multiplier)
          break
        case 'days':
          calculatedTime.setDate(calculatedTime.getDate() + amount * multiplier)
          break
        case 'weeks':
          calculatedTime.setDate(calculatedTime.getDate() + amount * 7 * multiplier)
          break
        case 'months':
          calculatedTime.setMonth(calculatedTime.getMonth() + amount * multiplier)
          break
        case 'years':
          calculatedTime.setFullYear(calculatedTime.getFullYear() + amount * multiplier)
          break
      }

      // 如果启用了舍入功能，则对时间进行舍入处理
      if (includeWeek.value) {
        return roundToNearestUnit(calculatedTime, timeUnit)
      }

      return calculatedTime
    }

    // 舍入到最近的时间单位
    const roundToNearestUnit = (date: Date, unit: string) => {
      const roundedDate = new Date(date)

      switch (unit) {
        case 'seconds':
          roundedDate.setMilliseconds(0)
          break
        case 'minutes':
          roundedDate.setSeconds(0, 0)
          break
        case 'hours':
          roundedDate.setMinutes(0, 0, 0)
          break
        case 'days':
          roundedDate.setHours(0, 0, 0, 0)
          break
        case 'weeks':
          // 舍入到本周的开始（周一）
          const dayOfWeek = roundedDate.getDay()
          const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
          roundedDate.setDate(roundedDate.getDate() + daysToMonday)
          roundedDate.setHours(0, 0, 0, 0)
          break
        case 'months':
          roundedDate.setDate(1)
          roundedDate.setHours(0, 0, 0, 0)
          break
        case 'years':
          roundedDate.setMonth(0, 1)
          roundedDate.setHours(0, 0, 0, 0)
          break
      }

      return roundedDate
    }

    // 实时更新相对时间
    const updateRelativeTime = () => {
      if (activeTimePart.value) {
        const calculatedTime = calculateRelativeTime(relativeAmount.value, relativeUnit.value)

        if (activeTimePart.value === 'start') {
          startDate.value = calculatedTime
        } else {
          endDate.value = calculatedTime
        }
      }
      emit('timeRangeUpdate', {
        start: startDate.value ? startDate.value.toISOString() : null,
        end: endDate.value ? endDate.value.toISOString() : null,
      })
    }
    const generateTimeSlots = (): string[] => {
      const times: string[] = []
      for (let hour = 0; hour <= 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // 跳过24:30，因为它不存在
          if (hour === 24 && minute !== 0) break

          const formattedHour = hour.toString().padStart(2, '0')
          const formattedMinute = minute.toString().padStart(2, '0')
          times.push(`${formattedHour}:${formattedMinute}`)
        }
      }
      return times
    }

    // 计算当前活跃的日期
    const currentDate = computed(() => {
      return activeTimePart.value === 'start' ? startDate.value : endDate.value
    })

    // 计算当前活跃的日期设置函数
    const setCurrentDate = (value: Date | null) => {
      if (activeTimePart.value === 'start') {
        startDate.value = value
      } else {
        endDate.value = value
      }
      emit('timeRangeUpdate', {
        start: startDate.value ? startDate.value.toISOString() : null,
        end: endDate.value ? endDate.value.toISOString() : null,
      })
    }

    // 计算舍入单位显示文本
    const roundingUnitText = computed(() => {
      const unit = relativeUnit.value.replace('_from_now', '')
      const unitMap: Record<string, string> = {
        seconds: 'second',
        minutes: 'minute',
        hours: 'hour',
        days: 'day',
        weeks: 'week',
        months: 'month',
        years: 'year',
      }
      return unitMap[unit] || 'unit'
    })

    // 搜索建议处理函数
    const handleInputFocus = () => {
      suggestionsVisible.value = true
    }

    const handleInputBlur = () => {
      // 延迟隐藏，以便点击建议项
      setTimeout(() => {
        suggestionsVisible.value = false
      }, 200)
    }

    const handleInputChange = (value: string) => {
      emit('update:searchQuery', value)
    }

    const handleInputKeyup = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
        suggestionsVisible.value = false
      }
    }

    const handleInputClick = (e: MouseEvent) => {
      const target = e.target as HTMLInputElement
      cursorPosition.value = target.selectionStart || 0
    }

    const handleInputKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement
      cursorPosition.value = target.selectionStart || 0
    }

    const handleSuggestionSelect = (value: string) => {
      const currentQuery = props.searchQuery
      const beforeCursor = currentQuery.substring(0, cursorPosition.value)
      const afterCursor = currentQuery.substring(cursorPosition.value)

      // 如果光标前有空格，说明是选择运算符
      if (beforeCursor.endsWith(' ')) {
        const newQuery = beforeCursor + value + afterCursor
        emit('update:searchQuery', newQuery)
        // 将光标移动到插入内容的末尾
        setTimeout(() => {
          if (searchInputRef.value) {
            const newCursorPos = beforeCursor.length + value.length
            // 获取 ElInput 内部的 input 元素
            const inputElement = searchInputRef.value.input || searchInputRef.value.$refs?.input
            if (inputElement) {
              inputElement.focus() // 保持焦点
              if (inputElement.setSelectionRange) {
                inputElement.setSelectionRange(newCursorPos, newCursorPos)
                cursorPosition.value = newCursorPos
              }
            }
          }
        }, 0)
      } else {
        // 选择字段，替换整个输入内容
        emit('update:searchQuery', value)
        // 保持焦点
        setTimeout(() => {
          if (searchInputRef.value) {
            const inputElement = searchInputRef.value.input || searchInputRef.value.$refs?.input
            if (inputElement) {
              inputElement.focus()
              const newCursorPos = value.length
              if (inputElement.setSelectionRange) {
                inputElement.setSelectionRange(newCursorPos, newCursorPos)
                cursorPosition.value = newCursorPos
              }
            }
          }
        }, 0)
      }

      // 保持建议列表显示
      suggestionsVisible.value = true
    }

    const handleSuggestionsClose = () => {
      suggestionsVisible.value = false
    }

    // 监听搜索查询变化，更新光标位置
    watch(
      () => props.searchQuery,
      () => {
        if (searchInputRef.value) {
          const inputElement = searchInputRef.value.input || searchInputRef.value.$refs?.input
          if (inputElement) {
            cursorPosition.value = inputElement.selectionStart || 0
          }
        }
      },
    )
    // 从父组件恢复初始时间范围
    watch(
      () => props.initialTimeRange,
      (val) => {
        if (!val) return
        if (val.start) startDate.value = new Date(val.start)
        if (val.end) endDate.value = new Date(val.end)
      },
      { immediate: true },
    )
    return () => (
      <div class={styles.searchHeader}>
        <div class={styles.searchInputGroup}>
          {/* 搜索框 */}
          <div class={styles.searchInputWrapper}>
            <ElInput
              ref={searchInputRef}
              modelValue={props.searchQuery}
              onUpdate:modelValue={handleInputChange}
              placeholder='搜索'
              class={styles.searchInput}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyup={handleInputKeyup}
              onClick={handleInputClick}
              onKeydown={handleInputKeydown}
            >
              {{
                prepend: () => (
                  <ElButton class={styles.iconSquareBtn}>
                    <ElIcon>
                      <Collection />
                    </ElIcon>
                  </ElButton>
                ),
                append: () => <ElButton>DQL</ElButton>,
              }}
            </ElInput>

            {/* 搜索建议 */}
            <SearchSuggestions
              visible={suggestionsVisible.value}
              availableFields={props.availableFields}
              searchQuery={props.searchQuery}
              cursorPosition={cursorPosition.value}
              onSelect={handleSuggestionSelect}
              onClose={handleSuggestionsClose}
            />
          </div>
          <div class={styles.timeRangeBtnWrapper}>
            {/* 时间范围选择器 */}
            <ElPopover
              placement={POPOVER_CONFIG.placement}
              width={POPOVER_CONFIG.width}
              v-model:visible={timeRangeVisible.value}
              trigger='manual'
              append-to-body
              persistent
            >
              {{
                reference: () => (
                  <div class={styles.timeRangeBtn}>
                    <ElIcon class={styles.calendarIcon}>
                      <Calendar />
                    </ElIcon>
                    <div class={styles.timeRangeContent}>
                      <span
                        class={`${styles.timePart} ${
                          activeTimePart.value === 'start' ? styles.timePartActive : ''
                        }`}
                        onClick={() => {
                          activeTimePart.value = 'start'
                          timeRangeVisible.value = !timeRangeVisible.value
                        }}
                      >
                        {formatDate(startDate.value)}
                      </span>
                      <span class={styles.arrow}>→</span>
                      <span
                        class={`${styles.timePart} ${
                          activeTimePart.value === 'end' ? styles.timePartActive : ''
                        }`}
                        onClick={() => {
                          activeTimePart.value = 'end'
                          timeRangeVisible.value = !timeRangeVisible.value
                        }}
                      >
                        {endDate.value ? formatDate(endDate.value) : 'now'}
                      </span>
                    </div>
                  </div>
                ),
                default: () => (
                  <div class={styles.timePopover}>
                    <ElTabs
                      modelValue={activeTab.value}
                      onUpdate:modelValue={(v) => (activeTab.value = v as any)}
                    >
                      {/* 绝对时间选择器 */}
                      <ElTabPane label='Absolute' name='absolute'>
                        <div class={styles.timeAbsolute}>
                          <div class={styles.calendarCol}>
                            <ElDatePickerPanel
                              modelValue={currentDate.value}
                              onUpdate:modelValue={setCurrentDate}
                              placeholder={
                                activeTimePart.value === 'start' ? 'Start date' : 'End date'
                              }
                              border={false}
                            />
                          </div>
                          <div class={styles.timeCol}>
                            {generateTimeSlots().map((t) => {
                              const selectedDate = currentDate.value
                              return (
                                <div
                                  class={
                                    styles.timeItem +
                                    (selectedDate &&
                                    new Date(selectedDate).getHours() === Number(t.split(':')[0]) &&
                                    new Date(selectedDate).getMinutes() === Number(t.split(':')[1])
                                      ? ' ' + styles.timeItemActive
                                      : '')
                                  }
                                  onClick={() => {
                                    const targetDate =
                                      activeTimePart.value === 'start' ? startDate : endDate
                                    if (!targetDate.value) targetDate.value = new Date()
                                    const [h, m] = t.split(':').map((x) => Number(x))
                                    const d = new Date(targetDate.value)
                                    d.setHours(h, m, 0, 0)
                                    targetDate.value = d
                                  }}
                                >
                                  {t}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div class={styles.timeFooterRow}>
                          <span>
                            {activeTimePart.value === 'start' ? 'Start date' : 'End date'}
                          </span>
                          <div class={styles.timeFooterValue}>
                            {formatDate(
                              activeTimePart.value === 'start' ? startDate.value : endDate.value,
                            )}
                          </div>
                        </div>
                      </ElTabPane>
                      {/* 相对时间选择器 */}
                      <ElTabPane label='Relative' name='relative'>
                        <div class={styles.timeRelative}>
                          <ElInputNumber
                            min={1}
                            v-model={relativeAmount.value}
                            controls-position='right'
                            onChange={updateRelativeTime}
                            onClick={(e: Event) => e.stopPropagation()}
                          />
                          <ElSelect
                            v-model={relativeUnit.value}
                            class={styles.relativeUnitSel}
                            onChange={updateRelativeTime}
                            onClick={(e: Event) => e.stopPropagation()}
                            teleported={false}
                          >
                            {RELATIVE_TIME_OPTIONS.map((option) => (
                              <ElOption
                                key={option.value}
                                label={option.label}
                                value={option.value}
                              />
                            ))}
                          </ElSelect>
                        </div>
                        <div class={styles.timeRelativeOptions}>
                          <ElSwitch
                            v-model={includeWeek.value}
                            onChange={updateRelativeTime}
                            onClick={(e: Event) => e.stopPropagation()}
                          />
                          <span class={styles.timeRelativeOptionsText}>
                            舍入为 {roundingUnitText.value}
                          </span>
                        </div>
                        <div class={styles.timeFooterRow}>
                          <span>{activeTimePart.value === 'start' ? 'Start' : 'End'} 日期</span>
                          <div class={styles.timeFooterValue}>
                            {formatDate(
                              activeTimePart.value === 'start' ? startDate.value : endDate.value,
                            )}
                          </div>
                        </div>
                      </ElTabPane>
                      {/* 现在时间选择器 */}
                      <ElTabPane label='Now' name='now'>
                        <div class={styles.timeNow}>
                          <div class={styles.timeTabBody}>
                            Setting the time to "now" means that on every refresh this time will be
                            set to the time of the refresh.
                          </div>
                          <ElButton type='primary' onClick={setNow}>
                            Set {activeTimePart.value} date and time to now
                          </ElButton>
                        </div>
                      </ElTabPane>
                    </ElTabs>
                  </div>
                ),
              }}
            </ElPopover>

            <ElButton icon={Refresh} onClick={handleRefresh} class={styles.refreshBtn}>
              刷新
            </ElButton>
          </div>
        </div>
        <div class={styles.addFilterBtn} onclick={handleAddFilter}>
          <el-icon>
            <CirclePlus />
          </el-icon>
          添加过滤条件
        </div>
      </div>
    )
  },
})
