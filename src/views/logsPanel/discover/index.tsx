// LogSearchView.tsx
import { defineComponent, ref, computed, onMounted } from 'vue'
import { ElSelect, ElOption, ElInput, ElIcon, ElButton } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { LogField, LogDocument, FilterCondition } from '@/api/logsPanel/discover/interfaces'
import SearchHeader from './components/SearchHeader'
import FieldPanel from './components/FieldPanel'
import DocumentView from './components/DocumentView'
import FilterDialog from './components/FilterDialog'
import StatusFilter, { type StatusKey } from './components/StatusFilter'
import LogChart from './components/LogChart/index'
import styles from './index.module.scss'

export default defineComponent({
  name: 'LogSearchView',
  setup() {
    // 响应式数据
    const searchQuery = ref('')
    const viewMode = ref<'time' | 'source'>('time')
    const documentViewMode = ref<'table' | 'json' | 'single'>('table')
    const expandedDocument = ref(false)
    const showFilterDialog = ref(false)
    const indexList = ref<string[]>(['categraf-index-logs*'])
    const currentIndex = ref<string>('categraf-index-logs*')

    // 字段数据
    const availableFields = ref<LogField[]>([
      { name: '_id', type: 'string', selected: false },
      { name: '_index', type: 'string', selected: false },
      { name: '_score', type: 'number', selected: false },
      { name: '_type', type: 'string', selected: false },
      { name: '@timestamp', type: 'date', selected: false },
      { name: '_source', type: 'object', selected: false, isSystemField: true }, // 系统字段，不可手动删除
      { name: 'agent_hostname', type: 'string', selected: false },
      { name: 'business.amount', type: 'number', selected: false },
      { name: 'business.currency', type: 'string', selected: false },
      { name: 'business.current_stock', type: 'number', selected: false },
      { name: 'business.customer', type: 'string', selected: false },
      { name: 'business.order_id', type: 'string', selected: false },
      { name: 'business.payment_method', type: 'string', selected: false },
      { name: 'business.product_id', type: 'string', selected: false },
    ])

    const filterConditions = ref<FilterCondition[]>([])

    // 示例日志数据
    const logDocuments = ref<LogDocument[]>([
      {
        _id: 'kih0pZkBkhra2IgY05Tt',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 22:14:26.608',
        agent_hostname: 'odindemecBook-Pro.local',
        event: 'failed_login_attempt',
        fcservice: 'opensearch_direct',
        fcsource: 'categraf_http_test',
        fctags: { filename: 'test_app.log' },
        'security.reason': 'invalid_credentials',
        'security.attempt_count': 1,
        'security.client_ip': '219.2.136.127',
        'security.username': 'ethan_zhao',
        topic: 'go-log',
        msg_key: 'VNREAM4S9HAmT2R2N12I7mFzal8tX08PN6hCKK1h',
        level: 'error',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt2',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 21:30:15.123',
        agent_hostname: 'server-01',
        event: 'user_login',
        fcservice: 'auth_service',
        fcsource: 'web_app',
        fctags: { filename: 'auth.log' },
        'user.id': '12345',
        'user.name': 'john_doe',
        topic: 'auth-log',
        msg_key: 'AUTH123456789',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt3',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 20:45:30.456',
        agent_hostname: 'server-02',
        event: 'high_memory_usage',
        fcservice: 'monitoring',
        fcsource: 'system_monitor',
        fctags: { filename: 'system.log' },
        'system.memory_usage': '85%',
        'system.threshold': '80%',
        topic: 'system-log',
        msg_key: 'SYS987654321',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt4',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 19:20:45.789',
        agent_hostname: 'server-03',
        event: 'database_connection_failed',
        fcservice: 'database',
        fcsource: 'db_monitor',
        fctags: { filename: 'db.log' },
        'db.connection_string': 'mysql://localhost:3306',
        'db.error': 'connection timeout',
        topic: 'db-log',
        msg_key: 'DB456789123',
        level: 'error',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt5',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 18:15:20.321',
        agent_hostname: 'server-01',
        event: 'api_request',
        fcservice: 'api_gateway',
        fcsource: 'api_monitor',
        fctags: { filename: 'api.log' },
        'api.endpoint': '/api/users',
        'api.method': 'GET',
        'api.status_code': 200,
        topic: 'api-log',
        msg_key: 'API789123456',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt6',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 17:30:10.654',
        agent_hostname: 'server-02',
        event: 'slow_query_detected',
        fcservice: 'database',
        fcsource: 'query_monitor',
        fctags: { filename: 'query.log' },
        'query.duration': '5.2s',
        'query.threshold': '2.0s',
        'query.sql': 'SELECT * FROM users WHERE...',
        topic: 'query-log',
        msg_key: 'QUERY321654987',
        level: 'warn',
      },
      // 添加更多同一时间点的不同状态日志
      {
        _id: 'kih0pZkBkhra2IgY05Tt7',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 22:15:30.123',
        agent_hostname: 'server-01',
        event: 'user_logout',
        fcservice: 'auth_service',
        fcsource: 'web_app',
        fctags: { filename: 'auth.log' },
        'user.id': '67890',
        'user.name': 'jane_smith',
        topic: 'auth-log',
        msg_key: 'AUTH987654321',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt8',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 22:16:45.456',
        agent_hostname: 'server-02',
        event: 'disk_space_warning',
        fcservice: 'monitoring',
        fcsource: 'system_monitor',
        fctags: { filename: 'system.log' },
        'system.disk_usage': '90%',
        'system.threshold': '85%',
        'system.path': '/var/log',
        topic: 'system-log',
        msg_key: 'SYS123456789',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt9',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 21:35:20.789',
        agent_hostname: 'server-03',
        event: 'cache_miss',
        fcservice: 'cache_service',
        fcsource: 'redis_monitor',
        fctags: { filename: 'cache.log' },
        'cache.key': 'user:12345:profile',
        'cache.operation': 'get',
        topic: 'cache-log',
        msg_key: 'CACHE456789123',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt10',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 21:36:15.321',
        agent_hostname: 'server-01',
        event: 'rate_limit_exceeded',
        fcservice: 'api_gateway',
        fcsource: 'rate_limiter',
        fctags: { filename: 'rate_limit.log' },
        'rate_limit.client_ip': '192.168.1.100',
        'rate_limit.requests': 1000,
        'rate_limit.limit': 500,
        topic: 'rate-limit-log',
        msg_key: 'RATE789123456',
        level: 'warn',
      },
      // 添加更多数据用于分页展示
      {
        _id: 'kih0pZkBkhra2IgY05Tt11',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 16:45:22.123',
        agent_hostname: 'server-04',
        event: 'file_upload_completed',
        fcservice: 'file_service',
        fcsource: 'upload_handler',
        fctags: { filename: 'upload.log' },
        'file.name': 'document.pdf',
        'file.size': '2.5MB',
        'file.user_id': 'user123',
        topic: 'file-log',
        msg_key: 'FILE123456789',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt12',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 16:30:18.456',
        agent_hostname: 'server-05',
        event: 'email_sent',
        fcservice: 'notification_service',
        fcsource: 'email_sender',
        fctags: { filename: 'email.log' },
        'email.recipient': 'user@example.com',
        'email.subject': 'Welcome to our service',
        'email.status': 'delivered',
        topic: 'email-log',
        msg_key: 'EMAIL987654321',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt13',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 16:15:33.789',
        agent_hostname: 'server-06',
        event: 'backup_failed',
        fcservice: 'backup_service',
        fcsource: 'backup_manager',
        fctags: { filename: 'backup.log' },
        'backup.path': '/data/backups',
        'backup.error': 'insufficient disk space',
        'backup.size': '15GB',
        topic: 'backup-log',
        msg_key: 'BACKUP456789123',
        level: 'error',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt14',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 16:00:45.321',
        agent_hostname: 'server-07',
        event: 'scheduled_task_completed',
        fcservice: 'task_scheduler',
        fcsource: 'cron_manager',
        fctags: { filename: 'cron.log' },
        'task.name': 'daily_cleanup',
        'task.duration': '45s',
        'task.status': 'success',
        topic: 'cron-log',
        msg_key: 'CRON789123456',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt15',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 15:45:12.654',
        agent_hostname: 'server-08',
        event: 'security_scan_detected',
        fcservice: 'security_service',
        fcsource: 'threat_detector',
        fctags: { filename: 'security.log' },
        'security.threat_type': 'malware',
        'security.severity': 'high',
        'security.file_path': '/tmp/suspicious.exe',
        topic: 'security-log',
        msg_key: 'SEC123456789',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt16',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 15:30:28.987',
        agent_hostname: 'server-09',
        event: 'database_backup_started',
        fcservice: 'database',
        fcsource: 'backup_agent',
        fctags: { filename: 'db_backup.log' },
        'backup.database': 'production_db',
        'backup.estimated_size': '50GB',
        'backup.estimated_duration': '2h',
        topic: 'db-backup-log',
        msg_key: 'DBBACKUP987654321',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt17',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 15:15:41.123',
        agent_hostname: 'server-10',
        event: 'load_balancer_health_check',
        fcservice: 'load_balancer',
        fcsource: 'health_monitor',
        fctags: { filename: 'lb.log' },
        'lb.server': 'web-server-03',
        'lb.response_time': '120ms',
        'lb.status': 'healthy',
        topic: 'lb-log',
        msg_key: 'LB456789123',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt18',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 15:00:55.456',
        agent_hostname: 'server-11',
        event: 'cache_eviction',
        fcservice: 'cache_service',
        fcsource: 'cache_manager',
        fctags: { filename: 'cache.log' },
        'cache.key_pattern': 'user:*',
        'cache.evicted_count': 150,
        'cache.reason': 'memory_pressure',
        topic: 'cache-log',
        msg_key: 'CACHE789123456',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt19',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 14:45:17.789',
        agent_hostname: 'server-12',
        event: 'ssl_certificate_expiring',
        fcservice: 'certificate_manager',
        fcsource: 'cert_monitor',
        fctags: { filename: 'cert.log' },
        'cert.domain': 'api.example.com',
        'cert.days_remaining': 15,
        'cert.issuer': "Let's Encrypt",
        topic: 'cert-log',
        msg_key: 'CERT123456789',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt20',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 14:30:33.321',
        agent_hostname: 'server-13',
        event: 'microservice_communication_failed',
        fcservice: 'user_service',
        fcsource: 'service_client',
        fctags: { filename: 'service.log' },
        'service.target': 'payment_service',
        'service.endpoint': '/api/process-payment',
        'service.error': 'connection timeout',
        topic: 'service-log',
        msg_key: 'SERVICE987654321',
        level: 'error',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt21',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 14:15:49.654',
        agent_hostname: 'server-14',
        event: 'queue_processing_delayed',
        fcservice: 'message_queue',
        fcsource: 'queue_processor',
        fctags: { filename: 'queue.log' },
        'queue.name': 'email_queue',
        'queue.pending_messages': 2500,
        'queue.processing_rate': '10/min',
        topic: 'queue-log',
        msg_key: 'QUEUE456789123',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt22',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 14:00:05.987',
        agent_hostname: 'server-15',
        event: 'data_sync_completed',
        fcservice: 'sync_service',
        fcsource: 'sync_engine',
        fctags: { filename: 'sync.log' },
        'sync.source': 'external_api',
        'sync.records_processed': 15000,
        'sync.duration': '45m',
        topic: 'sync-log',
        msg_key: 'SYNC789123456',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt23',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 13:45:21.123',
        agent_hostname: 'server-16',
        event: 'performance_alert',
        fcservice: 'monitoring',
        fcsource: 'performance_monitor',
        fctags: { filename: 'perf.log' },
        'perf.metric': 'cpu_usage',
        'perf.value': '95%',
        'perf.threshold': '90%',
        topic: 'perf-log',
        msg_key: 'PERF123456789',
        level: 'warn',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt24',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 13:30:37.456',
        agent_hostname: 'server-17',
        event: 'user_session_expired',
        fcservice: 'auth_service',
        fcsource: 'session_manager',
        fctags: { filename: 'session.log' },
        'session.user_id': 'user456',
        'session.duration': '2h 30m',
        'session.reason': 'timeout',
        topic: 'session-log',
        msg_key: 'SESSION987654321',
        level: 'info',
      },
      {
        _id: 'kih0pZkBkhra2IgY05Tt25',
        _index: 'categraf-index-logs',
        _score: 1.0,
        _type: '_doc',
        '@timestamp': 'Oct 2, 2025 @ 13:15:53.789',
        agent_hostname: 'server-18',
        event: 'external_api_rate_limited',
        fcservice: 'api_gateway',
        fcsource: 'external_api_client',
        fctags: { filename: 'external_api.log' },
        'api.provider': 'third_party_service',
        'api.endpoint': '/v1/data',
        'api.retry_after': '60s',
        topic: 'external-api-log',
        msg_key: 'EXTAPI456789123',
        level: 'warn',
      },
    ])

    const currentDocument = ref(logDocuments.value[0])

    // 计算属性
    const selectedFields = computed(() =>
      availableFields.value.filter((field) => field.selected).map((field) => field.name),
    )
    // Status counts based on example data. In real use, compute from response.
    const statusChecked = ref<StatusKey[]>(['Error', 'Warn', 'Info'])
    const statusCounts = computed<Record<StatusKey, number>>(() => {
      // 假计数：可根据 logDocuments 实际字段统计，比如 level 或 status
      const counts: Record<StatusKey, number> = { Error: 0, Warn: 0, Info: 0 }
      logDocuments.value.forEach((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return
        const key = (level[0].toUpperCase() + level.slice(1)) as StatusKey
        if (counts[key] !== undefined) counts[key]++
      })
      return counts
    })

    const filteredDocuments = computed(() => {
      // 根据勾选的状态过滤（示例：按 d.level）
      return logDocuments.value.filter((d) => {
        const level = (d as any).level as string | undefined
        if (!level) return true
        const key = (level[0].toUpperCase() + level.slice(1)) as StatusKey
        return statusChecked.value.includes(key)
      })
    })

    const selectedFieldObjects = computed(() => {
      const selectedFields = availableFields.value.filter((field) => field.selected)

      // 如果没有选中任何字段，默认显示 _source 字段
      if (selectedFields.length === 0) {
        const sourceField = availableFields.value.find((field) => field.name === '_source')
        if (sourceField) {
          return [sourceField]
        }
      }

      return selectedFields
    })

    const availableFieldObjects = computed(() =>
      availableFields.value.filter((field) => !field.selected),
    )

    // 方法
    const toggleFieldSelection = (field: LogField) => {
      // 如果是系统字段（如 _source），不允许手动切换
      if (field.isSystemField) {
        return
      }

      field.selected = !field.selected

      // 如果选中了其他字段，自动取消 _source 字段的选中状态
      if (field.selected) {
        const sourceField = availableFields.value.find((f) => f.name === '_source')
        if (sourceField && sourceField.selected) {
          sourceField.selected = false
        }
      }
    }

    const executeSearch = () => {
      console.log('执行搜索:', searchQuery.value, filterConditions.value)
    }

    const refreshData = () => {
      console.log('刷新数据')
    }

    const addFilterCondition = (filter: FilterCondition) => {
      filterConditions.value.push(filter)
    }

    const handleAddFilter = () => {
      showFilterDialog.value = true
    }

    onMounted(() => {
      // 初始化逻辑
    })

    return () => (
      <div class={styles.logSearchContainer}>
        <div class={styles.mainContent}>
          {/* 左侧面板 */}
          <div class={styles.leftPanel}>
            {/* 选择数据源 */}
            <div class={styles.panelSection}>
              <div class={styles.indexSelectRow}>
                <ElSelect
                  v-model={currentIndex.value}
                  class={styles.indexSelect}
                  placeholder='选择数据源'
                >
                  {indexList.value.map((it) => (
                    <ElOption label={it} value={it} />
                  ))}
                </ElSelect>
                <ElButton
                  onClick={() => {
                    /* 预留：刷新索引列表 */
                  }}
                >
                  <ElIcon>
                    <Refresh />
                  </ElIcon>
                </ElButton>
              </div>
            </div>
            {/* 选择索引 */}
            <div class={styles.panelSection}>
              <div class={styles.indexSelectRow}>
                <ElSelect
                  v-model={currentIndex.value}
                  class={styles.indexSelect}
                  placeholder='选择索引'
                >
                  {indexList.value.map((it) => (
                    <ElOption label={it} value={it} />
                  ))}
                </ElSelect>
                <ElButton
                  onClick={() => {
                    /* 预留：刷新索引列表 */
                  }}
                >
                  <ElIcon>
                    <Refresh />
                  </ElIcon>
                </ElButton>
              </div>
            </div>
            {/* 筛选字段 */}
            <div class={styles.panelSection}>
              <ElInput
                placeholder='搜索字段名称'
                class={styles.searchInput}
                v-model={searchQuery.value}
              >
                {{
                  prefix: () => (
                    <ElIcon>
                      <Search />
                    </ElIcon>
                  ),
                }}
              </ElInput>
            </div>
            {/* 已选中的字段 */}
            <FieldPanel
              title='Selected fields'
              fields={selectedFieldObjects.value}
              showSelected={true}
              onFieldToggle={toggleFieldSelection}
            />
            {/* 状态过滤器 */}
            <StatusFilter
              modelValue={statusChecked.value}
              counts={statusCounts.value}
              onUpdate:modelValue={(v: StatusKey[]) => (statusChecked.value = v)}
            />
            {/* 可选字段 */}
            <FieldPanel
              title='Available fields'
              fields={availableFieldObjects.value}
              onFieldToggle={toggleFieldSelection}
            />
          </div>
          {/* 右侧面板 */}
          <div class={styles.rightContent}>
            {/* 搜索栏 */}
            <SearchHeader
              searchQuery={searchQuery.value}
              viewMode={viewMode.value}
              availableFields={availableFields.value}
              onUpdate:searchQuery={(value) => (searchQuery.value = value)}
              onUpdate:viewMode={(value) => (viewMode.value = value)}
              onSearch={executeSearch}
              onAddFilter={handleAddFilter}
              onRefresh={refreshData}
            />
            {/* 动态柱状图 */}
            <LogChart
              logDocuments={filteredDocuments.value}
              selectedStatuses={statusChecked.value}
              timeRange={{ start: null, end: null }}
            />
            {/* 搜索结果 */}
            <DocumentView
              logDocuments={filteredDocuments.value}
              selectedFieldObjects={selectedFieldObjects.value}
            />
          </div>
        </div>

        <FilterDialog
          modelValue={showFilterDialog.value}
          availableFields={availableFields.value}
          currentDocument={currentDocument.value}
          onUpdate:modelValue={(value) => (showFilterDialog.value = value)}
          onAddFilter={addFilterCondition}
        />
      </div>
    )
  },
})
