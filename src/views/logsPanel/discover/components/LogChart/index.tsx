import { defineComponent, ref, onMounted, onUnmounted, watch, PropType, nextTick } from 'vue'
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
      default: () => [],
    },
    selectedStatuses: {
      type: Array as PropType<StatusKey[]>,
      required: true,
      default: () => ['Info', 'Error', 'Warn'],
    },
  },
  setup(props) {
    const chartRef = ref<HTMLDivElement>()
    let chartInstance: echarts.ECharts | null = null
    const isChartReady = ref(false)

    // 处理日志数据，按时间分组统计
    const processLogData = (data: LogChartData[]): ChartDataPoint[] => {
      if (!data || data.length === 0) {
        return []
      }

      const timeMap = new Map<string, { info: number; error: number; warn: number }>()

      data.forEach((item) => {
        const level = item.level?.toLowerCase()
        const count = parseInt(item.count, 10)

        if (!level || isNaN(count)) return

        // 转换为 StatusKey 格式
        const statusKey = (level.charAt(0).toUpperCase() + level.slice(1)) as StatusKey

        // 检查是否在选中的状态中
        if (props.selectedStatuses.length > 0 && !props.selectedStatuses.includes(statusKey)) {
          return
        }

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
      if (data.length === 0) {
        return {
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#999',
              fontSize: 14,
              fontWeight: 'normal',
            },
          },
          xAxis: { show: false },
          yAxis: { show: false },
        }
      }

      const times = data.map((item) => {
        // 格式化时间显示
        const date = new Date(item.time)
        return item.time
      })

      const infoData = data.map((item) => item.info)
      const errorData = data.map((item) => item.error)
      const warnData = data.map((item) => item.warn)

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: ['Info', 'Error', 'Warn'],
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
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'Info',
            type: 'bar',
            data: infoData,
            itemStyle: {
              color: '#67c1ff',
            },
            barWidth: '20%',
          },
          {
            name: 'Error',
            type: 'bar',
            data: errorData,
            itemStyle: {
              color: '#ff4d4f',
            },
            barWidth: '20%',
          },
          {
            name: 'Warn',
            type: 'bar',
            data: warnData,
            itemStyle: {
              color: '#ffb020',
            },
            barWidth: '20%',
          },
        ],
      }
    }

    // 初始化图表
    const initChart = async () => {
      await nextTick()

      if (!chartRef.value) {
        console.error('LogChart - chartRef 不存在')
        return
      }

      try {
        chartInstance = echarts.init(chartRef.value)
        isChartReady.value = true
        console.log('LogChart - 图表初始化成功')
        updateChart()
      } catch (error) {
        console.error('LogChart - 图表初始化失败:', error)
      }
    }

    // 更新图表数据
    const updateChart = () => {
      if (!chartInstance || !isChartReady.value) {
        console.log('LogChart - 图表未就绪')
        return
      }

      const processedData = processLogData(props.logChartData)
      console.log('LogChart - 更新图表，数据量:', processedData.length)

      const option = generateChartOption(processedData)
      chartInstance.setOption(option, true)

      // 确保图表重新渲染
      chartInstance.resize()
    }

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartInstance && isChartReady.value) {
        chartInstance.resize()
      }
    }

    // 监听数据变化
    watch(
      () => [...props.logChartData, ...props.selectedStatuses],
      () => {
        console.log('LogChart - 检测到数据变化')
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
        chartInstance = null
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
