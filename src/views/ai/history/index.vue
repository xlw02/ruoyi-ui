<template>
   <div class="app-container">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
         <el-form-item label="提示词名称" prop="promptName">
            <el-input
               v-model="queryParams.promptName"
               placeholder="请输入提示词名称"
               clearable
               style="width: 220px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="会话ID" prop="conversationId">
            <el-input
               v-model="queryParams.conversationId"
               placeholder="请输入会话ID"
               clearable
               style="width: 220px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="AI模型" prop="model">
            <el-input
               v-model="queryParams.model"
               placeholder="请输入AI模型"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
               <el-option label="成功" value="0" />
               <el-option label="失败" value="1" />
            </el-select>
         </el-form-item>
         <el-form-item label="创建时间" style="width: 308px;">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['ai:history:remove']"
            >批量删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['ai:history:export']"
            >导出</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="RefreshRight"
               @click="handleClean"
               v-hasPermi="['ai:history:remove']"
            >清空历史</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 列表表格 -->
      <el-table v-loading="loading" :data="historyList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="主键" align="center" prop="historyId" width="80" />
         <el-table-column label="会话ID" align="center" prop="conversationId" width="260" :show-overflow-tooltip="true" />
         <el-table-column label="角色" align="center" prop="role" width="100">
            <template #default="scope">
               <el-tag v-if="scope.row.role === 'system'" type="info" size="small">system</el-tag>
               <el-tag v-else-if="scope.row.role === 'user'" type="warning" size="small">user</el-tag>
               <el-tag v-else-if="scope.row.role === 'assistant'" type="success" size="small">assistant</el-tag>
               <el-tag v-else size="small">{{ scope.row.role }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="提示词名称" align="center" prop="promptName" width="180" :show-overflow-tooltip="true" />
         <el-table-column label="AI模型" align="center" prop="model" width="160" :show-overflow-tooltip="true" />
         <el-table-column label="内容预览" align="center" width="250">
            <template #default="scope">
               <span class="content-preview">{{ getContentPreview(scope.row.content) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="输入Token" align="center" prop="promptTokens" width="90" />
         <el-table-column label="输出Token" align="center" prop="completionTokens" width="90" />
         <el-table-column label="耗时(ms)" align="center" prop="elapsedMs" width="90">
            <template #default="scope">
               <span v-if="scope.row.elapsedMs != null">{{ scope.row.elapsedMs }}</span>
               <span v-else>-</span>
            </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="status" width="80">
            <template #default="scope">
               <el-tag v-if="scope.row.status === '0'" type="success" size="small">成功</el-tag>
               <el-tag v-else-if="scope.row.status === '1'" type="danger" size="small">失败</el-tag>
               <el-tag v-else size="small">{{ scope.row.status }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="170">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['ai:history:query']">查看</el-button>
               <el-button link type="primary" icon="View" @click="handleViewConversation(scope.row)" v-hasPermi="['ai:history:query']">整个会话</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ai:history:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- ==================== 单条详情弹窗 ==================== -->
      <el-dialog :title="'查看详情 - ' + (detailRoleMap[detail.role] || detail.role)" v-model="detailOpen" width="800px" append-to-body>
         <el-descriptions v-if="detail.historyId" :column="2" border size="small">
            <el-descriptions-item label="会话ID" :span="2">
               <code>{{ detail.conversationId }}</code>
            </el-descriptions-item>
            <el-descriptions-item label="角色">
               {{ detailRoleMap[detail.role] || detail.role }}
            </el-descriptions-item>
            <el-descriptions-item label="提示词名称">
               {{ detail.promptName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="AI模型">
               {{ detail.model || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
               <el-tag v-if="detail.status === '0'" type="success" size="small">成功</el-tag>
               <el-tag v-else-if="detail.status === '1'" type="danger" size="small">失败</el-tag>
               <el-tag v-else size="small">{{ detail.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="输入Token">
               {{ detail.promptTokens != null ? detail.promptTokens : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="输出Token">
               {{ detail.completionTokens != null ? detail.completionTokens : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="总Token">
               {{ detail.totalTokens != null ? detail.totalTokens : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="耗时">
               {{ detail.elapsedMs != null ? detail.elapsedMs + ' ms' : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
               {{ parseTime(detail.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.errorMsg" label="失败原因" :span="2">
               <span class="error-msg">{{ detail.errorMsg }}</span>
            </el-descriptions-item>
         </el-descriptions>

         <div class="detail-content-wrap">
            <div class="detail-content-label">消息内容（{{ detailRoleMap[detail.role] || detail.role }}）：</div>

            <!-- assistant 角色 → Markdown 渲染 -->
            <div v-if="detail.role === 'assistant' && detail.content" class="markdown-body markdown-body-auto">
               <div v-html="renderMarkdown(detail.content)"></div>
            </div>

            <!-- 其他角色或内容里含 markdown 标记 → 尝试 Markdown 渲染（失败则纯文本） -->
            <div v-else-if="detail.content && detail.content.includes('#')" class="markdown-body markdown-body-auto">
               <div v-html="renderMarkdown(detail.content)"></div>
            </div>

            <!-- 纯文本 -->
            <pre v-else-if="detail.content" class="plain-text">{{ detail.content }}</pre>
            <div v-else class="empty-tip">（空）</div>
         </div>

         <template #footer>
            <div class="dialog-footer">
               <el-button @click="detailOpen = false">关 闭</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- ==================== 整个会话弹窗 ==================== -->
      <el-dialog :title="'完整会话 - ' + conversationOpen.conversationId" v-model="conversationOpen.visible" width="900px" top="5vh" append-to-body>
         <div class="conversation-meta" v-if="conversationOpen.messages && conversationOpen.messages.length">
            本次 AI 调用共 <b>{{ conversationOpen.messages.length }}</b> 条消息，
            创建时间：{{ parseTime(conversationOpen.messages[0]?.createTime) }}
         </div>

         <el-scrollbar max-height="60vh">
            <div
               v-for="(msg, idx) in conversationOpen.messages"
               :key="msg.historyId"
               class="conversation-msg"
               :class="'conversation-msg-' + msg.role"
            >
               <div class="msg-header">
                  <el-tag :type="msgRoleTagMap[msg.role]" size="small">{{ detailRoleMap[msg.role] || msg.role }}</el-tag>
                  <span class="msg-meta">
                     模型: {{ msg.model || '-' }}
                     <span v-if="msg.elapsedMs != null"> | 耗时: {{ msg.elapsedMs }}ms</span>
                     <span v-if="msg.totalTokens != null"> | Token: {{ msg.totalTokens }}</span>
                     <span v-if="msg.createTime"> | {{ parseTime(msg.createTime) }}</span>
                  </span>
               </div>
               <div class="msg-body">
                  <!-- assistant → Markdown -->
                  <div v-if="msg.role === 'assistant' && msg.content" class="markdown-body markdown-body-auto">
                     <div v-html="renderMarkdown(msg.content)"></div>
                  </div>
                  <!-- system / user → 纯文本（带等宽字体） -->
                  <pre v-else-if="msg.content" class="plain-text plain-text-sm">{{ msg.content }}</pre>
                  <div v-else-if="msg.errorMsg" class="error-msg">{{ msg.errorMsg }}</div>
                  <div v-else class="empty-tip">（空）</div>
               </div>
               <div v-if="idx < conversationOpen.messages.length - 1" class="msg-separator"></div>
            </div>
         </el-scrollbar>

         <template #footer>
            <div class="dialog-footer">
               <el-button
                  type="danger"
                  @click="handleDeleteConversation(conversationOpen.conversationId)"
                  v-hasPermi="['ai:history:remove']"
               >删除整个会话</el-button>
               <el-button @click="conversationOpen.visible = false">关 闭</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="AiChatHistory">
import { listHistory, getHistory, getConversation, delHistory, delConversation, cleanHistory } from "@/api/ai/chatHistory"
import { marked } from "marked"
import DOMPurify from "dompurify"

const { proxy } = getCurrentInstance()

const historyList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    conversationId: undefined,
    promptName: undefined,
    role: undefined,
    model: undefined,
    status: undefined
  }
})

const { queryParams } = toRefs(data)

// 角色中文映射
const detailRoleMap = {
  'system': '系统提示词',
  'user': '用户输入',
  'assistant': 'AI 回复'
}
const msgRoleTagMap = {
  'system': 'info',
  'user': 'warning',
  'assistant': 'success'
}

// 单条详情弹窗状态
const detail = ref({})
const detailOpen = ref(false)

// 会话详情弹窗状态
const conversationOpen = reactive({
  visible: false,
  conversationId: '',
  messages: []
})

// ==================== 查询 ====================

/** 查询列表 */
function getList() {
  loading.value = true
  listHistory(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    historyList.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 搜索按钮 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选选中 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.historyId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// ==================== 查看详情 ====================

/** 查看单条详情 */
function handleView(row) {
  getHistory(row.historyId).then(response => {
    detail.value = response.data
    detailOpen.value = true
  })
}

/** 查看整个会话 */
function handleViewConversation(row) {
  const cid = row.conversationId
  conversationOpen.conversationId = cid
  conversationOpen.messages = []
  conversationOpen.visible = true
  getConversation(cid).then(response => {
    conversationOpen.messages = response.data || []
  })
}

// ==================== 删除 ====================

/** 删除（单条或批量） */
function handleDelete(row) {
  const historyIds = row.historyId || ids.value
  proxy.$modal.confirm('是否确认删除选中的记录？').then(function () {
    return delHistory(historyIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 删除整个会话 */
function handleDeleteConversation(conversationId) {
  proxy.$modal.confirm('是否确认删除会话 "' + conversationId + '" 的全部记录？此操作不可恢复。').then(function () {
    return delConversation(conversationId)
  }).then(() => {
    conversationOpen.visible = false
    getList()
    proxy.$modal.msgSuccess("会话已删除")
  }).catch(() => {})
}

/** 清空全部历史 */
function handleClean() {
  proxy.$modal.confirm('⚠️ 警告：是否确认清空全部 AI 历史记录？此操作不可恢复！').then(function () {
    return cleanHistory()
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("清空成功")
  }).catch(() => {})
}

/** 导出 */
function handleExport() {
  proxy.download("ai/history/export", {
    ...queryParams.value
  }, `ai_chat_history_${new Date().getTime()}.xlsx`)
}

// ==================== Markdown 渲染 ====================

/** 渲染 Markdown 为 HTML（marked 解析 + DOMPurify 消毒防 XSS） */
function renderMarkdown(content) {
  if (!content) return ''
  try {
    // 1. marked 把 markdown 转成 HTML
    const rawHtml = marked.parse(content)
    // 2. DOMPurify 移除危险标签（script、iframe、onclick 等事件属性）
    return DOMPurify.sanitize(rawHtml)
  } catch (e) {
    console.warn('Markdown 渲染失败:', e)
    // 渲染失败时降级为纯文本（已 DOMPurify 自动处理 HTML 转义）
    return DOMPurify.sanitize(content.replace(/\n/g, '<br>'))
  }
}

/** 内容预览（表格列里截断显示） */
function getContentPreview(content) {
  if (!content) return '-'
  const plain = content.replace(/[#*`>\-\[\]()]/g, '').replace(/\s+/g, ' ').trim()
  return plain.length > 80 ? plain.slice(0, 80) + '...' : plain
}

getList()
</script>

<style scoped>
/* 表格里的内容预览样式 */
.content-preview {
  display: inline-block;
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #606266;
}

/* 详情弹窗的内容区 */
.detail-content-wrap {
  margin-top: 16px;
}
.detail-content-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

/* 纯文本显示 */
.plain-text {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px 14px;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  max-height: 420px;
  overflow: auto;
  margin: 0;
}
.plain-text-sm {
  max-height: 240px;
}

/* 空提示 */
.empty-tip {
  color: #909399;
  font-size: 13px;
  padding: 12px;
  text-align: center;
  background: #fafafa;
  border-radius: 6px;
}

/* 错误信息 */
.error-msg {
  color: #f56c6c;
  background: #fef0f0;
  padding: 10px 12px;
  border-radius: 4px;
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}

/* 会话弹窗 */
.conversation-meta {
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 14px;
}
.conversation-meta b {
  color: #303133;
}

.conversation-msg {
  margin-bottom: 4px;
}
.conversation-msg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.conversation-msg .msg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.conversation-msg .msg-meta {
  font-size: 12px;
  color: #909399;
}
.conversation-msg .msg-body {
  border-left: 3px solid #dcdfe6;
  padding-left: 12px;
  margin-left: 4px;
}
.conversation-msg-assistant .msg-body {
  border-left-color: #67c23a;
}
.conversation-msg-system .msg-body {
  border-left-color: #909399;
}
.conversation-msg-user .msg-body {
  border-left-color: #e6a23c;
}
.msg-separator {
  height: 12px;
  border-bottom: 1px dashed #ebeef5;
  margin: 12px 0;
}

/* Markdown 基础样式（简洁版，适合钉钉 Markdown 风格） */
.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
}
.markdown-body h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; }
.markdown-body h2 { font-size: 18px; font-weight: 700; margin: 14px 0 8px; }
.markdown-body h3 { font-size: 16px; font-weight: 600; margin: 12px 0 6px; }
.markdown-body h4 { font-size: 15px; font-weight: 600; margin: 10px 0 6px; }
.markdown-body p  { margin: 8px 0; }
.markdown-body ul, .markdown-body ol { padding-left: 24px; margin: 8px 0; }
.markdown-body li { margin: 4px 0; }
.markdown-body blockquote {
  border-left: 4px solid #e4e7ed;
  padding: 6px 14px;
  margin: 10px 0;
  color: #606266;
  background: #f5f7fa;
  border-radius: 0 4px 4px 0;
}
.markdown-body code {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}
.markdown-body pre {
  background: #1e1e1e;
  color: #e0e0e0;
  padding: 14px;
  border-radius: 6px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.55;
}
.markdown-body pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 13px;
}
.markdown-body table th, .markdown-body table td {
  border: 1px solid #dcdfe6;
  padding: 8px 10px;
  text-align: left;
}
.markdown-body table th {
  background: #f5f7fa;
  font-weight: 600;
}
.markdown-body a {
  color: #409eff;
  text-decoration: none;
}
.markdown-body a:hover {
  text-decoration: underline;
}
.markdown-body hr {
  border: none;
  border-top: 1px solid #dcdfe6;
  margin: 16px 0;
}
.markdown-body strong { font-weight: 600; }
.markdown-body em { font-style: italic; }
</style>
