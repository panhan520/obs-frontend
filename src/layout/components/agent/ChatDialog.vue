<template>
  <div class="chat-dialog">
    <!-- 欢迎语 -->
    <section class="chat-welcome">
      <h3>Hi 你好</h3>
      <p>我汇集了StarView各项智能服务，可以帮助你回答各类疑问，现在开始进行提问吧～</p>
    </section>

    <!-- 聊天区 -->
    <el-scrollbar
      class="chat-content"
      ref="scrollRef"
      :style="{ marginBottom: inputHeight + 'px' }"
    >
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        <!-- 头像 -->
        <img v-if="msg.role === 'user'" class="avatar" src="@/icons/svg/chat_user_head.svg" />
        <img v-else class="avatar" src="@/icons/svg/chat_ai_head.svg" />

        <!-- 气泡 + 复制按钮 -->
        <div class="bubble-wrapper">
          <img
            v-if="msg.role === 'user'"
            src="@/icons/svg/chat_copy_icon.svg"
            class="copy-btn copy-btn-left"
            @click="copyText(msg.content)"
          />
          <div class="bubble" v-html="renderMarkdown(msg.content)"></div>
          <img
            v-if="msg.role === 'assistant'"
            src="@/icons/svg/chat_copy_icon.svg"
            class="copy-btn"
            @click="copyText(msg.content)"
          />
        </div>
      </div>
    </el-scrollbar>

    <!-- 输入区 -->
    <footer class="chat-footer" ref="inputWrapperRef">
      <el-input
        v-model="input"
        placeholder="在这里输入问题，回车键发送"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        resize="none"
        ref="textareaRef"
        @keyup.enter.exact.prevent="sendMessage"
        @input="updateHeight"
      />
      <img
        v-if="isGenerating"
        src="@/icons/svg/chat_stop_icon.svg"
        class="sendIcon"
        @click="sendMessage"
      />
      <img v-else src="@/icons/svg/chat_send_icon.svg" class="sendIcon" @click="sendMessage" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-bash.js'
import 'prismjs/plugins/toolbar/prism-toolbar.css'
import 'prismjs/plugins/toolbar/prism-toolbar.js'
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js'

import { PROXY } from '~/config/constants'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const input = ref('')
const scrollRef = ref()
const isGenerating = ref(false)
const textareaRef = ref()
const inputWrapperRef = ref<HTMLElement | null>(null)
const inputHeight = ref(54) // 初始高度
let abortController: AbortController | null = null
const md = new MarkdownIt({
  html: true,
  highlight: (str: string, lang: string) => {
    if (lang && Prism.languages[lang]) {
      return `<pre class="language-${lang}"><code>${Prism.highlight(
        str,
        Prism.languages[lang],
        lang,
      )}</code></pre>`
    }
    return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

// 渲染 Markdown
const renderMarkdown = (text: string) => {
  const html = md.render(text)
  nextTick(() => {
    Prism.highlightAll()
  })
  return html
}

// 更新 marginBottom
const updateHeight = () => {
  if (inputWrapperRef.value) {
    inputHeight.value = inputWrapperRef.value.offsetHeight
  }
}
const sendMessage = async () => {
  if (isGenerating.value && abortController) {
    // 如果正在生成，点击按钮则停止生成
    abortController.abort()
    isGenerating.value = false
    return
  }

  const content = input.value.trim()
  if (!content) return

  messages.value.push({ role: 'user', content })
  input.value = ''
  scrollToBottom()
  inputHeight.value = 54

  const aiMsgIndex =
    messages.value.push({
      role: 'assistant',
      content: '正在生成中',
    }) - 1

  isGenerating.value = true
  abortController = new AbortController()

  // 加载动画
  let dotCount = 0
  const loadingInterval = setInterval(() => {
    messages.value[aiMsgIndex].content = '正在生成中' + '.'.repeat((dotCount % 3) + 1)
    dotCount++
    scrollToBottom()
  }, 500)

  try {
    messages.value[aiMsgIndex].content = '' // 清空"正在生成中"
    const res = await fetch(`${PROXY.AIAGENT}/aiagent/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'DeepSeek-R1-Distill-Qwen-7B',
        messages: messages.value,
        stream: true,
      }),
      signal: abortController.signal, // 允许中断
    })

    if (!res.body) throw new Error('接口未返回可读流')

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    clearInterval(loadingInterval) // 停止动画
    messages.value[aiMsgIndex].content = '' // 清空"正在生成中"

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n').filter(Boolean)
      buffer = ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const dataStr = line.replace(/^data:\s*/, '')
        if (dataStr === '[DONE]') break

        try {
          const json = JSON.parse(dataStr)
          const delta = json?.choices?.[0]?.delta?.content
          if (delta) {
            messages.value[aiMsgIndex].content += delta
            scrollToBottom()
            await new Promise((r) => setTimeout(r, 30))
          }
        } catch {}
      }
    }
  } catch (err: any) {
    console.error(err)
    clearInterval(loadingInterval)
    if (abortController?.signal.aborted) {
      // messages.value[aiMsgIndex].content += "（已停止生成）";
    } else {
      messages.value[aiMsgIndex].content = 'AI 回复失败，请稍后重试～'
    }
    scrollToBottom()
  } finally {
    isGenerating.value = false
    abortController = null
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    // el-scrollbar 内部的实际滚动容器
    const wrapEl = scrollRef.value?.$el?.querySelector('.el-scrollbar__wrap') as HTMLElement
    if (wrapEl) {
      wrapEl.scrollTop = wrapEl.scrollHeight
    }
  })
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style lang="scss" scoped>
.chat-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;

  .chat-welcome {
    padding: 12px 16px;
    background: #ffffff;
    margin: 0 25px;
    border-radius: 20px;

    h3 {
      margin: 0;
      font-size: 20px;
      color: #0c0d0e;
    }

    p {
      margin: 4px 0 0;
      font-size: 14px;
      color: #41464f;
    }
  }

  .chat-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    .message {
      display: flex;
      align-items: flex-end; // 关键点：让按钮和气泡底部对齐
      margin-bottom: 16px;

      &.user {
        flex-direction: row-reverse;

        .bubble {
          background: #1763ff;
          color: #fff;
        }
      }

      &.assistant {
        flex-direction: row;

        .bubble {
          color: #0c0d0e;
          background: #f6f8fa;
        }
      }

      .avatar {
        width: 35px;
        height: 35px;
        margin: 0 8px;
        align-self: flex-start;
        margin-top: 3px;
      }

      .bubble-wrapper {
        display: flex;
        align-items: flex-end;

        .bubble {
          padding: 0 14px;
          border-radius: 20px;
          line-height: 1.5;
          font-size: 14px;
          word-break: break-word;
        }
        .bubble pre {
          margin: 0;
          background: #2d2d2d;
          border-radius: 6px;
          padding: 10px;
          overflow-x: auto;
          word-break: break-word;
        }
        .bubble code {
          font-family: 'Fira Code', monospace;
          word-break: break-word;
        }

        .copy-btn {
          margin-left: 6px;
          font-size: 12px;
          color: #666;
          flex-shrink: 0;
          margin-bottom: 8px;
          align-self: flex-end;
        }
        .copy-btn-left {
          margin-left: 0;
          margin-right: 6px;
        }
      }
    }
  }

  .chat-footer {
    width: 96%;
    position: absolute;
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
    .el-textarea {
      flex: 1;
    }
    .sendIcon {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  :deep(.el-textarea__inner) {
    min-height: 54px !important;
    max-height: 100px !important;
    line-height: 20px;
    padding: 17px 35px 14px 14px; // 留出右侧图标空间
    resize: none !important;
    overflow-y: auto;
    box-shadow: none;
  }
}
</style>
