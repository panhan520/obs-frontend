import { defineComponent } from 'vue'
import './index.scss'

const props = {
  /** 标识 */
  name: {
    type: String,
    default: '',
  },
  /** font-size */
  size: {
    type: String,
    default: '24px',
  }
}

export default defineComponent({
  name: 'Iconfont',
  props,
  setup(props) {
    return () => (
      <i class={['iconfont', `icon-${props.name}`]} style={{ fontSize: props.size }} />
    )
  }
})
