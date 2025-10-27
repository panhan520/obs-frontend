import { defineComponent, ref, computed } from 'vue'
import { ElDrawer, ElDescriptions, ElDescriptionsItem, ElTag, ElButton } from 'element-plus'
import {
  DataSourceType,
  DataType,
  AuthType,
  Version,
  PrometheusType,
  OpenSearchVersion,
} from '@/api/configManagement/dataSource/interfaces'
import type { DataSourceDetail } from '@/api/configManagement/dataSource/interfaces'
import styles from './index.module.scss'

export default defineComponent({
  name: 'DataSourceDetailDrawer',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: Object as () => DataSourceDetail | null,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const visible = ref(props.modelValue)

    const handleClose = () => {
      visible.value = false
    }

    const getDataSourceTypeLabel = (type: DataSourceType) => {
      const typeMap = {
        [DataSourceType.ELASTIC_SEARCH]: 'ElasticSearch',
        [DataSourceType.OPEN_SEARCH]: 'OpenSearch',
        [DataSourceType.PROMETHEUS]: 'Prometheus',
        [DataSourceType.STAR_VIEW]: 'StarView',
        [DataSourceType.TYPE_UNKNOWN]: '未知',
      }
      return typeMap[type] || '未知'
    }

    const getDataTypeLabel = (dataType: DataType) => {
      const typeMap = {
        [DataType.LOG]: '日志',
        [DataType.METRICS]: '指标',
        [DataType.DATA_TYPE_UNKNOWN]: '未知',
      }
      return typeMap[dataType] || '未知'
    }

    const getAuthTypeLabel = (authType: AuthType) => {
      const typeMap = {
        [AuthType.NONE]: '无认证',
        [AuthType.BASIC_AUTH]: '基本认证',
        [AuthType.AUTH_TYPE_UNKNOWN]: '未知',
      }
      return typeMap[authType] || '未知'
    }

    const getVersionLabel = (version: Version | OpenSearchVersion | PrometheusType) => {
      const versionMap = {
        [Version.ES8_SERIES]: '8.x (ElasticSearch)',
        [Version.ES9_SERIES]: '9.x (ElasticSearch)',
        [Version.UPTO_ES710_SERIES]: '7.x及以下 (ElasticSearch)',
        [OpenSearchVersion.OS1_SERIES]: '1.x (OpenSearch)',
        [OpenSearchVersion.OS2_SERIES]: '2.x (OpenSearch)',
        [OpenSearchVersion.OS3_SERIES]: '3.x (OpenSearch)',
        [PrometheusType.PROMETHEUS]: 'Prometheus',
        [PrometheusType.VICTORIA_METRICS]: 'Victoria Metrics',
      }
      return versionMap[version] || '未知'
    }

    return () => (
      <ElDrawer
        modelValue={visible.value}
        onUpdate:modelValue={(val: boolean) => {
          visible.value = val
          emit('update:modelValue', val)
        }}
        title='数据源详情'
        size='50%'
        class={styles.drawer}
        onClose={handleClose}
      >
        {props.dataSource && (
          <div class={styles.content}>
            {/* 基本信息 */}
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>基本信息</h3>
              <ElDescriptions column={1} border>
                <ElDescriptionsItem label='数据源名称'>{props.dataSource.name}</ElDescriptionsItem>
                <ElDescriptionsItem label='数据源类型'>
                  <ElTag type='primary'>{getDataSourceTypeLabel(props.dataSource.type)}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label='数据类型'>
                  <ElTag type='success'>{getDataTypeLabel(props.dataSource.dataType)}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label='描述'>
                  {props.dataSource.description || '无'}
                </ElDescriptionsItem>
                <ElDescriptionsItem label='来源'>
                  {props.dataSource.source === 'BUILT_IN' ? '内置' : '外部接入'}
                </ElDescriptionsItem>
                <ElDescriptionsItem label='创建时间'>
                  {props.dataSource.createdAt}
                </ElDescriptionsItem>
                <ElDescriptionsItem label='最近更新时间'>
                  {props.dataSource.updatedAt}
                </ElDescriptionsItem>
              </ElDescriptions>
            </div>

            {/* ElasticSearch 配置 */}
            {props.dataSource.type === DataSourceType.ELASTIC_SEARCH &&
              props.dataSource.elasticSearch && (
                <div class={styles.section}>
                  <h3 class={styles.sectionTitle}>ElasticSearch 配置</h3>
                  <ElDescriptions column={1} border>
                    <ElDescriptionsItem label='连接地址'>
                      {props.dataSource.elasticSearch.url}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='认证方式'>
                      {getAuthTypeLabel(props.dataSource.elasticSearch.authType)}
                    </ElDescriptionsItem>
                    {props.dataSource.elasticSearch.authType === AuthType.BASIC_AUTH && (
                      <>
                        <ElDescriptionsItem label='用户名'>
                          {props.dataSource.elasticSearch.username || '无'}
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label='密码'>
                          {props.dataSource.elasticSearch.password ? '******' : '无'}
                        </ElDescriptionsItem>
                      </>
                    )}
                    <ElDescriptionsItem label='跳过TLS验证'>
                      {props.dataSource.elasticSearch.skipTlsVerify ? '是' : '否'}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='请求超时'>
                      {props.dataSource.elasticSearch.timeout}ms
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='版本'>
                      {getVersionLabel(props.dataSource.elasticSearch.version)}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='最大并发分片请求量'>
                      {props.dataSource.elasticSearch.maxShard}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='时间戳字段'>
                      {props.dataSource.elasticSearch.timeFieldName}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='自定义HTTP标头'>
                      {props.dataSource.elasticSearch.httpHeaders.length > 0
                        ? props.dataSource.elasticSearch.httpHeaders
                            .map((header) => `${header.key}: ${header.value}`)
                            .join(', ')
                        : '无'}
                    </ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              )}

            {/* Prometheus 配置 */}
            {props.dataSource.type === DataSourceType.PROMETHEUS && props.dataSource.prometheus && (
              <div class={styles.section}>
                <h3 class={styles.sectionTitle}>Prometheus 配置</h3>
                <ElDescriptions column={1} border>
                  <ElDescriptionsItem label='连接地址'>
                    {props.dataSource.prometheus.url}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label='认证方式'>
                    {getAuthTypeLabel(props.dataSource.prometheus.authType)}
                  </ElDescriptionsItem>
                  {props.dataSource.prometheus.authType === AuthType.BASIC_AUTH && (
                    <>
                      <ElDescriptionsItem label='用户名'>
                        {props.dataSource.prometheus.username || '无'}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label='密码'>
                        {props.dataSource.prometheus.password ? '******' : '无'}
                      </ElDescriptionsItem>
                    </>
                  )}
                  <ElDescriptionsItem label='跳过TLS验证'>
                    {props.dataSource.prometheus.skipTlsVerify ? '是' : '否'}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label='请求超时'>
                    {props.dataSource.prometheus.timeout}ms
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label='Prometheus类型'>
                    {getVersionLabel(props.dataSource.prometheus.type)}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label='自定义HTTP标头'>
                    {props.dataSource.prometheus.httpHeaders.length > 0
                      ? props.dataSource.prometheus.httpHeaders
                          .map((header) => `${header.key}: ${header.value}`)
                          .join(', ')
                      : '无'}
                  </ElDescriptionsItem>
                </ElDescriptions>
              </div>
            )}

            {/* OpenSearch 配置 */}
            {props.dataSource.type === DataSourceType.OPEN_SEARCH &&
              props.dataSource.openSearch && (
                <div class={styles.section}>
                  <h3 class={styles.sectionTitle}>OpenSearch 配置</h3>
                  <ElDescriptions column={1} border>
                    <ElDescriptionsItem label='连接地址'>
                      {props.dataSource.openSearch.url}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='认证方式'>
                      {getAuthTypeLabel(props.dataSource.openSearch.authType)}
                    </ElDescriptionsItem>
                    {props.dataSource.openSearch.authType === AuthType.BASIC_AUTH && (
                      <>
                        <ElDescriptionsItem label='用户名'>
                          {props.dataSource.openSearch.username || '无'}
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label='密码'>
                          {props.dataSource.openSearch.password ? '******' : '无'}
                        </ElDescriptionsItem>
                      </>
                    )}
                    <ElDescriptionsItem label='跳过TLS验证'>
                      {props.dataSource.openSearch.skipTlsVerify ? '是' : '否'}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='请求超时'>
                      {props.dataSource.openSearch.timeout}ms
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='版本'>
                      {getVersionLabel(props.dataSource.openSearch.version)}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='最大并发分片请求量'>
                      {props.dataSource.openSearch.maxShard}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='时间戳字段'>
                      {props.dataSource.openSearch.timeFieldName}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label='自定义HTTP标头'>
                      {props.dataSource.openSearch.httpHeaders.length > 0
                        ? props.dataSource.openSearch.httpHeaders
                            .map((header) => `${header.key}: ${header.value}`)
                            .join(', ')
                        : '无'}
                    </ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              )}

            {/* 操作按钮 */}
            <div class={styles.actions}>
              <ElButton onClick={handleClose}>关闭</ElButton>
            </div>
          </div>
        )}
      </ElDrawer>
    )
  },
})
