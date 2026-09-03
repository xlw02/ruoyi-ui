<template>
   <div class="app-container ai-chat-page">
      <!-- 顶部工具栏 -->
      <div class="chat-toolbar">
         <div class="toolbar-left">
            <span class="toolbar-title">🤖 AI 智能助理</span>
            <span class="toolbar-sub">钉钉 Copilot · 随时在线</span>
         </div>
         <div class="toolbar-right">
            <el-button size="small" :icon="Refresh" @click="reloadIframe">刷新</el-button>
            <el-button size="small" :icon="FullScreen" @click="toggleFullscreen">全屏</el-button>
         </div>
      </div>

      <!-- iframe 容器 -->
      <div ref="iframeWrap" class="iframe-wrap">
         <iframe
            v-if="iframeVisible"
            ref="iframeRef"
            :src="iframeSrc"
            class="copilot-iframe"
            frameborder="0"
            allow="microphone"
            @load="onIframeLoad"
         ></iframe>
         <div v-if="loading" class="iframe-loading">
            <el-icon class="is-loading" :size="32"><Loading /></el-icon>
            <span>AI 助理加载中...</span>
         </div>
      </div>
   </div>
</template>

<script setup name="AiChat">
import { ref } from 'vue'
import { Refresh, FullScreen, Loading } from '@element-plus/icons-vue'

const iframeSrc = 'https://agent.dingtalk.com/copilot?code=VlMczAyHj4'
const iframeRef = ref(null)
const iframeWrap = ref(null)
const loading = ref(true)
const iframeVisible = ref(true)

function onIframeLoad() {
  loading.value = false
}

function reloadIframe() {
  loading.value = true
  iframeVisible.value = false
  setTimeout(() => { iframeVisible.value = true }, 50)
}

function toggleFullscreen() {
  const el = iframeWrap.value
  if (!document.fullscreenElement) {
    el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.msRequestFullscreen?.()
  } else {
    document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.()
  }
}
</script>

<style scoped>
.ai-chat-page {
  padding: 16px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.chat-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  margin-bottom: 12px;
}
.toolbar-left { display: flex; align-items: baseline; gap: 10px; }
.toolbar-title { font-size: 16px; font-weight: 600; color: #303133; }
.toolbar-sub { font-size: 12px; color: #909399; }

.iframe-wrap {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  position: relative;
  min-height: calc(100vh - 180px);
}
.copilot-iframe {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 180px);
  border: none;
  display: block;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
  color: #909399;
  background: #fff;
  font-size: 14px;
}
</style>
