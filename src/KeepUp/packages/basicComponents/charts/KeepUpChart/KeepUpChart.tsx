import { defineComponent } from 'vue'
import Space from '../../space'

/** 
 * 接收一个json，渲染页面。
 * json内每一个图表都配置好自己的fetchApi
 * */
export default defineComponent({
  name: 'KeepUpChart',
  setup(_, { slots }) {
    return () => (
      <Space>
        
      </Space>
    )
  }
})
