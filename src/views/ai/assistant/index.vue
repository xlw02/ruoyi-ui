<template>
   <div class="app-container ai-report-page">
      <!-- 搜索 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
         <el-form-item label="提示词" prop="promptName">
            <el-select v-model="queryParams.promptName" placeholder="全部" clearable style="width: 200px">
               <el-option v-for="name in promptNameOptions" :key="name" :label="name" :value="name" />
            </el-select>
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
               <el-option label="成功" value="0" />
               <el-option label="失败" value="1" />
            </el-select>
         </el-form-item>
         <el-form-item label="创建时间" style="width: 280px;">
            <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange"
               range-separator="-" start-placeholder="开始" end-placeholder="结束" />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>

      <!-- 报告列表 -->
      <div v-loading="loading" class="report-grid">
         <div v-if="!loading && !historyList.length" class="empty-state">
            <el-empty description="暂无 AI 分析报告" />
         </div>

         <div v-for="item in historyList" :key="item.historyId" class="report-card" @click="handleView(item)">
            <div class="card-row card-row-top">
               <span class="tag-prompt">{{ item.promptName || '通用分析' }}</span>
               <el-tag v-if="item.status === '1'" type="danger" size="small">失败</el-tag>
               <span v-if="item.status !== '1'" class="card-time">{{ formatTime(item.createTime) }}</span>
            </div>
            <div class="card-preview">{{ getPreview(item.content) }}</div>
            <div class="card-row card-row-bottom">
               <div class="card-meta">
                  <span v-if="item.model">🤖 {{ item.model }}</span>
                  <span v-if="item.elapsedMs">⏱ {{ formatMs(item.elapsedMs) }}</span>
                  <span v-if="item.totalTokens">🔤 {{ item.totalTokens }}</span>
               </div>
               <span class="card-view">查看 →</span>
            </div>
         </div>
      </div>

      <pagination v-show="total > 0" :total="total"
         v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
         @pagination="getList" />

      <!-- ==================== Markdown 查看器（用若依标准 el-dialog） ==================== -->
      <el-dialog
         v-model="viewerVisible"
         :title="viewerData.promptName || 'AI 报告'"
         width="900px"
         top="6vh"
         append-to-body
         destroy-on-close
      >
         <!-- 元信息 -->
         <div class="viewer-meta" v-if="viewerData.historyId">
            <el-tag :type="viewerData.status === '0' ? 'success' : 'danger'" size="small">
               {{ viewerData.status === '0' ? '成功' : '失败' }}
            </el-tag>
            <span v-if="viewerData.model" class="meta-item">🤖 {{ viewerData.model }}</span>
            <span v-if="viewerData.elapsedMs" class="meta-item">⏱ {{ formatMs(viewerData.elapsedMs) }}</span>
            <span v-if="viewerData.totalTokens" class="meta-item">🔤 {{ viewerData.totalTokens }} tokens</span>
            <span v-if="viewerData.createTime" class="meta-item">📅 {{ parseTime(viewerData.createTime) }}</span>
         </div>

         <!-- 错误信息 -->
         <el-alert v-if="viewerData.status === '1' && viewerData.errorMsg"
            type="error" :closable="false"
            :title="'AI 调用失败：' + viewerData.errorMsg"
            show-icon style="margin: 12px 0" />

         <!-- Markdown 内容（用 GitHub 官方样式） -->
         <div class="viewer-markdown">
            <div v-if="viewerHtml" class="markdown-body" v-html="viewerHtml" :style="{ fontSize: '14px' }"></div>
            <el-empty v-else description="（无内容）" />
         </div>

         <template #footer>
            <el-button :icon="CopyDocument" @click="copyContent">复制</el-button>
            <el-button :icon="Download" @click="downloadMd">下载 .md</el-button>
            <el-button @click="viewerVisible = false">关闭</el-button>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="AiReport">
import { listHistory } from "@/api/ai/chatHistory"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { CopyDocument, Download } from "@element-plus/icons-vue"
import "github-markdown-css/github-markdown.css"

// 开启 GitHub Flavored Markdown（表格、删除线、任务列表、换行符转<br>）
marked.setOptions({
  gfm: true,
  breaks: true
})

const { proxy } = getCurrentInstance()

const historyList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const dateRange = ref([])
const promptNameOptions = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 12,
    role: 'assistant',
    promptName: undefined,
    status: undefined
  }
})
const { queryParams } = toRefs(data)

const viewerVisible = ref(false)
const viewerData = ref({})
const viewerHtml = ref('')

// ==================== 列表 ====================
function getList() {
  loading.value = true
  listHistory(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    historyList.value = res.rows
    total.value = res.total
    const names = new Set()
    res.rows.forEach(r => { if (r.promptName) names.add(r.promptName) })
    promptNameOptions.value = Array.from(names).sort()
  }).catch(() => {}).finally(() => { loading.value = false })
}

function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { dateRange.value = []; proxy.resetForm("queryRef"); handleQuery() }

// ==================== 查看器 ====================
function handleView(item) {
  viewerData.value = item
  viewerVisible.value = true
  // 异步渲染，避免阻塞
  setTimeout(() => {
    try {
      const raw = marked.parse(item.content || '')
      viewerHtml.value = DOMPurify.sanitize(raw)
    } catch (e) {
      console.warn('Markdown 渲染失败:', e)
      viewerHtml.value = DOMPurify.sanitize((item.content || '').replace(/\n/g, '<br>'))
    }
  }, 0)
}

function copyContent() {
  if (!viewerData.value.content) return
  navigator.clipboard.writeText(viewerData.value.content).then(
    () => proxy.$modal.msgSuccess('已复制'),
    () => {
      const ta = document.createElement('textarea')
      ta.value = viewerData.value.content
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
      proxy.$modal.msgSuccess('已复制')
    }
  )
}

function downloadMd() {
  if (!viewerData.value.content) return
  const blob = new Blob([viewerData.value.content], { type: 'text/markdown;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${viewerData.value.promptName || 'report'}_${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ==================== 工具 ====================
function getPreview(content) {
  if (!content) return '(空)'
  const plain = content
    .replace(/```[\s\S]*?```/g, '[代码块]')
    .replace(/!\[.*?\]\(.*?\)/g, '[图片]')
    .replace(/[#*`>_\-\[\]()|]/g, '')
    .replace(/\s+/g, ' ').trim()
  return plain.length > 140 ? plain.slice(0, 140) + '…' : plain
}

function formatTime(t) { return t ? proxy.parseTime(t, '{m}-{d} {h}:{i}') : '' }
function formatMs(ms) {
  if (!ms) return ''
  if (ms < 1000) return ms + 'ms'
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's'
  return Math.floor(ms / 60000) + 'm ' + Math.round((ms % 60000) / 1000) + 's'
}

getList()
</script>

<style scoped>
.ai-report-page { background: #f5f7fa; min-height: calc(100vh - 84px); padding: 20px; border-radius: 8px; }

/* ===== 卡片网格 ===== */
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
  min-height: 100px;
}
.report-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #ebeef5;
  display: flex; flex-direction: column;
  min-height: 170px;
}
.report-card:hover {
  box-shadow: 0 6px 18px rgba(64,158,255,0.12);
  border-color: #c6e2ff;
  transform: translateY(-2px);
}
.card-row { display: flex; justify-content: space-between; align-items: center; }
.card-row-top { margin-bottom: 10px; }
.card-row-bottom { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ebeef5; }
.tag-prompt {
  background: #ecf5ff; color: #409eff;
  font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 12px;
}
.card-time { font-size: 12px; color: #909399; }
.card-preview {
  font-size: 13px; line-height: 1.65; color: #606266;
  display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical;
  overflow: hidden; flex: 1;
}
.card-meta { font-size: 12px; color: #909399; display: flex; gap: 8px; flex-wrap: wrap; }
.card-view { font-size: 12px; color: #409eff; font-weight: 500; }

/* ===== 空状态 ===== */
.empty-state { grid-column: 1 / -1; padding: 60px 0; }

/* ===== 查看器 ===== */
.viewer-meta {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 10px 14px; background: #f5f7fa; border-radius: 6px;
  margin-bottom: 14px; font-size: 13px;
}
.meta-item { color: #606266; }

.viewer-markdown {
  max-height: 65vh; overflow-y: auto;
  padding: 4px;
}

/* github-markdown-css 接管所有 markdown-body 样式，这里只补一个滚动条美化 */
.viewer-markdown::-webkit-scrollbar { width: 8px; }
.viewer-markdown::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.viewer-markdown::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
.viewer-markdown::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
</style>
