<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- 路径导航 -->
      <div class="path-nav">
        <span class="path-item" @click="goPath('')">根目录</span>
        <template v-for="(seg, i) in pathSegments" :key="i">
          <span class="path-sep">/</span>
          <span class="path-item" @click="goPath(seg.path)">{{ seg.name }}</span>
        </template>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <el-upload
          :action="uploadUrl + '?path=' + encodeURIComponent(currentPath)"
          :headers="{ Authorization: 'Bearer ' + getToken() }"
          :show-file-list="false"
          :on-success="onUploadOk"
          :on-error="onUploadErr"
          :before-upload="beforeUpload"
        >
          <el-button type="primary" size="small" icon="Upload">上传文件</el-button>
        </el-upload>
        <el-button size="small" icon="Refresh" @click="loadList" style="margin-left: 8px;">刷新</el-button>
      </div>

      <!-- 文件列表 -->
      <el-table :data="files" v-loading="loading" stripe size="small">
        <el-table-column label="" width="40" align="center">
          <template #default="{ row }">
            <span style="font-size: 18px;">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column label="文件名" min-width="300">
          <template #default="{ row }">
            <span
              :class="row.isDir ? 'link-dir' : 'link-file'"
              @click="row.isDir ? goPath(joinPath(currentPath, row.name)) : handleDownload(row)"
            >{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="120" align="right">
          <template #default="{ row }">
            {{ row.isDir ? '-' : formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" prop="time" width="170" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { getToken } from '@/utils/auth'

const loading = ref(false)
const files = ref([])
const currentPath = ref('')

const baseUrl = import.meta.env.VITE_APP_BASE_API || ''
const uploadUrl = baseUrl + '/share/upload'

// 路径面包屑
const pathSegments = computed(() => {
  if (!currentPath.value) return []
  const parts = currentPath.value.split('/').filter(Boolean)
  return parts.map((name, i) => ({
    name,
    path: parts.slice(0, i + 1).join('/')
  }))
})

const goPath = (p) => {
  currentPath.value = p
  loadList()
}

const joinPath = (base, name) => {
  return base ? base + '/' + name : name
}

// 加载文件列表
const loadList = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/share/list',
      method: 'get',
      params: { path: currentPath.value }
    })
    files.value = res.data.files || []
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 下载文件（用 request 带 token，blob 下载）
const handleDownload = (row) => {
  const filePath = joinPath(currentPath.value, row.name)
  request({
    url: '/share/download',
    method: 'get',
    params: { path: filePath },
    responseType: 'blob'
  }).then(res => {
    const blob = new Blob([res])
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = row.name
    a.click()
    URL.revokeObjectURL(a.href)
  }).catch(() => {
    ElMessage.error('下载失败')
  })
}

const beforeUpload = (file) => {
  if (file.size > 200 * 1024 * 1024) {
    ElMessage.error('文件不能超过 200MB')
    return false
  }
  return true
}

const onUploadOk = (res) => {
  if (res.code === 200) {
    ElMessage.success('上传成功')
    loadList()
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

const onUploadErr = () => ElMessage.error('上传失败')

const formatSize = (bytes) => {
  if (!bytes) return '-'
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0, s = bytes
  while (s >= 1024 && i < u.length - 1) { s /= 1024; i++ }
  return s.toFixed(i === 0 ? 0 : 1) + ' ' + u[i]
}

onMounted(loadList)
</script>

<style scoped>
.path-nav {
  margin-bottom: 14px;
  font-size: 14px;
}
.path-item {
  color: #409eff;
  cursor: pointer;
}
.path-item:hover {
  text-decoration: underline;
}
.path-sep {
  margin: 0 4px;
  color: #ccc;
}
.action-bar {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.link-dir {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}
.link-dir:hover {
  text-decoration: underline;
}
.link-file {
  color: #333;
  cursor: pointer;
}
.link-file:hover {
  color: #409eff;
}
</style>
