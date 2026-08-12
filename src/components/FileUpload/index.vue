<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :data="data"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      :on-progress="handleUploadProgress"
      :draggable="drag"
      class="upload-file-uploader"
      ref="fileUpload"
      v-if="!disabled"
    >
      <div v-if="drag" class="upload-drag-area">
        <el-icon class="upload-icon"><upload-filled /></el-icon>
        <div class="upload-text">将文件拖到此处，或</div>
        <el-button type="primary" size="small">选取文件</el-button>
        <div class="upload-hint" v-if="showTip">
          <template v-if="fileSize">大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b></template>
          <template v-if="fileType">格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b></template>
        </div>
      </div>
      <template v-else>
        <el-button type="primary" size="small">选取文件</el-button>
      </template>
    </el-upload>
    <div class="el-upload__tip" v-if="showTip && !disabled && !drag">
      请上传
      <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      的文件
    </div>
    <transition-group ref="uploadFileList" class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="`${baseUrl}${file.url}`" underline="never" target="_blank">
          <span :class="getFileIconClass(file.name)"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <div v-if="file.percentage !== undefined" class="upload-progress">
            <el-progress :percentage="file.percentage" :stroke-width="6" :show-text="false" />
            <span class="progress-text">{{ file.percentage }}%</span>
          </div>
          <el-link underline="never" @click="handleDelete(index)" type="danger" v-if="!disabled && file.percentage === undefined">&nbsp;删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from "@/utils/auth"
import Sortable from 'sortablejs'

const props = defineProps({
  modelValue: [String, Object, Array],
  action: {
    type: String,
    default: "/common/upload"
  },
  data: {
    type: Object
  },
  limit: {
    type: Number,
    default: 5
  },
  fileSize: {
    type: Number,
    default: 5
  },
  fileType: {
    type: Array,
    default: () => ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "pdf"]
  },
  isShowTip: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  drag: {
    type: Boolean,
    default: true
  }
})

const { proxy } = getCurrentInstance()
const emit = defineEmits()
const number = ref(0)
const uploadList = ref([])
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + props.action)
const headers = ref({ Authorization: "Bearer " + getToken() })
const fileList = ref([])
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
)

watch(() => props.modelValue, val => {
  if (val) {
    let temp = 1
    const list = Array.isArray(val) ? val : props.modelValue.split(',')
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        item = { name: item, url: item }
      }
      item.uid = item.uid || new Date().getTime() + temp++
      return item
    })
  } else {
    fileList.value = []
    return []
  }
}, { deep: true, immediate: true })

const updateHeaders = () => {
  headers.value = { Authorization: "Bearer " + getToken() }
}

function handleBeforeUpload(file) {
  updateHeaders()
  if (props.fileType.length) {
    const fileName = file.name.split('.')
    const fileExt = fileName[fileName.length - 1]
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确，请上传${props.fileType.join("/")}格式文件!`)
      return false
    }
  }
  if (file.name.includes(',')) {
    proxy.$modal.msgError('文件名不正确，不能包含英文逗号!')
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  fileList.value.push({
    name: file.name,
    uid: file.uid,
    percentage: 0
  })
  number.value++
  return true
}

function handleUploadProgress(event, file, fileList) {
  const percentage = Math.round(event.percent)
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value[index].percentage = percentage
  }
}

function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleUploadError(err, file) {
  proxy.$modal.msgError("上传文件失败")
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
  number.value--
}

function handleUploadSuccess(res, file) {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (res.code === 200) {
    if (index > -1) {
      fileList.value[index] = {
        name: res.fileName,
        url: res.fileName,
        uid: file.uid
      }
    }
    uploadList.value.push({ name: res.fileName, url: res.fileName })
    uploadedSuccessfully()
  } else {
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
    number.value--
    proxy.$modal.msgError(res.msg)
    uploadedSuccessfully()
  }
}

function handleDelete(index) {
  fileList.value.splice(index, 1)
  emit("update:modelValue", listToString(fileList.value))
}

function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url !== undefined)
    uploadList.value = []
    number.value = 0
    emit("update:modelValue", listToString(fileList.value))
  }
}

function getFileName(name) {
  if (name.lastIndexOf("/") > -1) {
    return name.slice(name.lastIndexOf("/") + 1)
  } else {
    return name
  }
}

function getFileIconClass(name) {
  const ext = name.split('.').pop().toLowerCase()
  const iconMap = {
    'doc': 'el-icon-document',
    'docx': 'el-icon-document',
    'xls': 'el-icon-sheet',
    'xlsx': 'el-icon-sheet',
    'ppt': 'el-icon-presentation',
    'pptx': 'el-icon-presentation',
    'pdf': 'el-icon-file',
    'txt': 'el-icon-document'
  }
  return iconMap[ext] || 'el-icon-document'
}

function listToString(list, separator) {
  let strs = ""
  separator = separator || ","
  for (let i in list) {
    if (list[i].url) {
      strs += list[i].url + separator
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : ''
}

onMounted(() => {
  if (props.drag && !props.disabled) {
    nextTick(() => {
      const element = proxy.$refs.uploadFileList?.$el || proxy.$refs.uploadFileList
      Sortable.create(element, {
        ghostClass: 'file-upload-darg',
        onEnd: (evt) => {
          const movedItem = fileList.value.splice(evt.oldIndex, 1)[0]
          fileList.value.splice(evt.newIndex, 0, movedItem)
          emit('update:modelValue', listToString(fileList.value))
        }
      })
    })
  }
})
</script>

<style scoped lang="scss">
.file-upload-darg {
  opacity: 0.5;
  background: #c8ebfb;
}

.upload-file-uploader {
  margin-bottom: 5px;
}

.upload-drag-area {
  width: 100%;
  height: 180px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-drag-area:hover {
  border-color: #409eff;
  background: #f0f5ff;
}

:deep(.el-upload--drag.is-dragover) .upload-drag-area {
  border-color: #409eff;
  background: #ecf5ff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 12px;
}

.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
  transition: all 0.3s;
  padding: 12px 16px;
  border-radius: 6px;
}

.upload-file-list .el-upload-list__item:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}

.ele-upload-list__item-content-action {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #409eff;
  min-width: 36px;
}
</style>