import { defineComponent } from "vue";
import Space from "~/basicComponents/space";
import IconFont from "~/basicComponents/iconFont";
import CollapseIcon from "../../../header/collapseIcon";
import styles from "./index.module.scss";
import emitter from "@/utils/emitter";
import chatIcon from "@/icons/svg/chat_icon.svg";
const props = {
  /** 折叠 */
  isCollapse: {
    type: Boolean,
    default: false,
  },
};

export default defineComponent({
  name: "ControlPanel",
  props,
  setup(props) {
    // 打开AI助手
    const openAI = () => {
      emitter.emit("openChat");
    };
    return () => (
      <Space
        class={styles.container}
        direction={props.isCollapse ? "column-reverse" : "row"}
        justify="space-between"
        fill
      >
        <CollapseIcon />
        <img
          src={chatIcon}
          class={`${props.isCollapse ? styles.chatIconFold : styles.chatIcon} `}
          onClick={openAI}
        />

        <IconFont
          name="message"
          class={styles.icon}
          style={{ marginRight: props.isCollapse ? "0" : "15px" }}
        />
      </Space>
    );
  },
});
