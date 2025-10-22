// LogChart.tsx
import { defineComponent, ref, onMounted, onUnmounted, watch, PropType } from 'vue'
import * as echarts from 'echarts'
import type { StatusKey } from '../StatusFilter'
import styles from './LogChart.module.scss'

interface LogChartData {
  time: string
  level: string
  count: string
}

interface ChartDataPoint {
  time: string
  info: number
  error: number
  warn: number
}

export default defineComponent({
  name: 'LogChart',
  props: {
    logChartData: {
      type: Array as PropType<LogChartData[]>,
      required: true,
    },
    selectedStatuses: {
      type: Array as PropType<StatusKey[]>,
      required: true,
    },
  },
  setup(props) {
    const chartRef = ref<HTMLDivElement>()
    let chartInstance: echarts.ECharts | null = null

    // 处理日志数据，按时间分组统计
    const processLogData = (data: LogChartData[]): ChartDataPoint[] => {
      const timeMap = new Map<string, { info: number; error: number; warn: number }>()

      data.forEach((item) => {
        const level = item.level
        const count = parseInt(item.count, 10)

        if (!level || isNaN(count)) return

        // 检查是否在选中的状态中
        const statusKey = (level[0].toUpperCase() + level.slice(1)) as StatusKey
        if (!props.selectedStatuses.includes(statusKey)) return

        // 使用时间作为键
        const timeKey = item.time

        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { info: 0, error: 0, warn: 0 })
        }

        const counts = timeMap.get(timeKey)!

        if (statusKey === 'Info') counts.info += count
        else if (statusKey === 'Error') counts.error += count
        else if (statusKey === 'Warn') counts.warn += count
      })

      // 转换为数组并按时间排序
      return Array.from(timeMap.entries())
        .map(([time, counts]) => ({
          time,
          ...counts,
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    }

    // 生成图表配置
    const generateChartOption = (data: ChartDataPoint[]) => {
      const times = data.map((item) => item.time)
      const infoData = data.map((item) => item.info)
      const errorData = data.map((item) => item.error)
      const warnData = data.map((item) => item.warn)

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: (params: any[]) => {
            const time = params[0]?.axisValue || ''
            const date = new Date(time)
            const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`

            let result = `<div style="margin-bottom: 6px; font-weight: bold; color: #333;">${timeStr}</div>`
            let total = 0

            params.forEach((param) => {
              if (param.value > 0) {
                total += param.value
                result += `<div style="margin: 3px 0; display: flex; align-items: center;">
                  <span style="display:inline-block;margin-right:6px;border-radius:2px;width:12px;height:12px;background-color:${param.color};"></span>
                  <span style="color: #666;">${param.seriesName}:</span>
                  <span style="margin-left: 4px; font-weight: bold; color: #333;">${param.value}</span>
                </div>`
              }
            })

            if (total > 0) {
              result += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee; font-weight: bold; color: #333;">
                总计: ${total}
              </div>`
            }

            return result
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: times,
          // axisLabel: {
          //   formatter: (value: string) => {
          //     const date = new Date(value)
          //     return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`
          //   },
          // },
        },
        yAxis: {
          type: 'value',
          nameLocation: 'middle',
          nameGap: 30,
        },
        series: [
          {
            name: 'Info',
            type: 'bar',
            data: infoData,
            itemStyle: {
              color: '#67c1ff',
            },
            barWidth: '5%',
            barGap: '5%',
            barCategoryGap: '20%',
          },
          {
            name: 'Error',
            type: 'bar',
            data: errorData,
            itemStyle: {
              color: '#ff4d4f',
            },
            barWidth: '5%',
            barGap: '5%',
            barCategoryGap: '20%',
          },
          {
            name: 'Warn',
            type: 'bar',
            data: warnData,
            itemStyle: {
              color: '#ffb020',
            },
            barWidth: '5%',
            barGap: '5%',
            barCategoryGap: '20%',
          },
        ],
      }
    }

    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      updateChart()
    }

    // 更新图表数据
    const updateChart = () => {
      if (!chartInstance) return

      const processedData = processLogData(props.logChartData)
      const option = generateChartOption(processedData)
      chartInstance.setOption(option, true)
    }

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    // 监听数据变化
    watch(
      () => [props.logChartData, props.selectedStatuses],
      () => {
        updateChart()
      },
      { deep: true },
    )

    onMounted(() => {
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.dispose()
      }
      window.removeEventListener('resize', handleResize)
    })

    return () => (
      <div class={styles.logChart}>
        <div ref={chartRef} class={styles.chartContainer}></div>
      </div>
    )
  },
})
