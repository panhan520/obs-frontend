import { defineComponent } from 'vue'
import styles from './index.module.scss'

const props = {
  /** 折叠 */
  isCollapse: {
    type: Boolean,
    default: false,
  }
}

export default defineComponent({
  name: 'Logo',
  props,
  setup(props) {
    const logo = new URL('~/assets/image/logo.png', import.meta.url)?.href
    const logoCollapse = new URL('~/assets/menu/logo.png', import.meta.url)?.href
    return () => (
      <div class={styles.sidebarLogoContainer}>
        <transition name="sidebarLogoFadeCl">
          <router-link 
            key={props.isCollapse ? 'collapse' : 'expand'}
            class={styles.sidebarLogoLink}
            to="/"
          >
            {
              props.isCollapse
                ? <img src={logo} class={[styles.sidebarLogo, styles.collapse]} />
                : <img src={logoCollapse} class={styles.sidebarLogo} />
            }
          </router-link>
        </transition>
      </div>
    )
  }
})
