<template>
  <div class="app-container">
    <!-- 查询条件：已删除采集时间筛选 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="点位名称" prop="pointName">
        <el-input
          v-model="queryParams.pointName"
          placeholder="请输入点位名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机台编号" prop="machineCode">
        <el-input
          v-model="queryParams.machineCode"
          placeholder="请输入机台编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="采集值" prop="pointValue">
        <el-input
          v-model="queryParams.pointValue"
          placeholder="请输入采集值"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['IoTData:IoTData:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['IoTData:IoTData:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['IoTData:IoTData:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['IoTData:IoTData:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格：采集时间显示详细时间 -->
    <el-table v-loading="loading" :data="IoTDataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="点位名称" align="center" prop="pointName" />
      <el-table-column label="机台编号" align="center" prop="machineCode" />
      <el-table-column label="采集值" align="center" prop="pointValue" />
      <el-table-column label="采集时间" align="center" prop="collectTime" width="180">
        <template #default="scope">
          <!-- 改为显示 年-月-日 时:分:秒 -->
          <span>{{ parseTime(scope.row.collectTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采集状态" align="center" prop="status" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['IoTData:IoTData:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['IoTData:IoTData:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改弹窗：采集时间只读显示，格式为详细时间 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="IoTDataRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="点位名称" prop="pointName">
              <el-input v-model="form.pointName" placeholder="请输入点位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="机台编号" prop="machineCode">
              <el-input v-model="form.machineCode" placeholder="请输入机台编号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="采集值" prop="pointValue">
              <el-input v-model="form.pointValue" placeholder="请输入采集值" />
            </el-form-item>
          </el-col>
          <!-- 采集时间：只读显示详细时间 -->
          <el-col :span="24">
            <el-form-item label="采集时间" prop="collectTime">
              <el-input 
                v-model="form.collectTimeDisplay" 
                disabled 
                placeholder="系统自动生成"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="IoTData">
import { listIoTData, getIoTData, delIoTData, addIoTData, updateIoTData } from "@/api/IoTData/IoTData"

const { proxy } = getCurrentInstance()

const IoTDataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

// 工具函数：格式化时间戳为详细时间字符串
function formatDetailTime(timestamp) {
  if (!timestamp) return ''
  return proxy.parseTime(timestamp, '{y}-{m}-{d} {h}:{i}:{s}')
}

const data = reactive({
  form: {
    id: null,
    pointName: null,
    machineCode: null,
    pointValue: null,
    collectTime: null,          // 实际存储时间戳
    collectTimeDisplay: '',     // 用于显示的格式化字符串
    status: null,
    remark: null,
    createTime: null
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    pointName: undefined,
    machineCode: undefined,
    pointValue: undefined,
    status: undefined,
  },
  rules: {
    pointName: [
      { required: true, message: "点位名称不能为空", trigger: "blur" }
    ],
    machineCode: [
      { required: true, message: "机台编号不能为空", trigger: "blur" }
    ],
    pointValue: [
      { required: true, message: "采集值不能为空", trigger: "blur" }
    ]
    // collectTime 不再校验，自动生成
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listIoTData(queryParams.value).then(response => {
    IoTDataList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置（新增时调用） */
function reset() {
  form.value = {
    id: null,
    pointName: null,
    machineCode: null,
    pointValue: null,
    collectTime: Date.now(),
    collectTimeDisplay: formatDetailTime(Date.now()),
    status: null,
    remark: null,
    createTime: null
  }
  proxy.resetForm("IoTDataRef")
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置查询 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加IoT点位数据采集记录"
}

/** 修改 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getIoTData(_id).then(response => {
    const data = response.data
    // 将后端返回的 collectTime 统一转为时间戳（如果是字符串则解析）
    if (data.collectTime) {
      data.collectTime = new Date(data.collectTime).getTime()
    } else {
      // 如果没有值，用当前时间
      data.collectTime = Date.now()
    }
    // 生成显示用的格式化字符串
    data.collectTimeDisplay = formatDetailTime(data.collectTime)
    form.value = data
    open.value = true
    title.value = "修改IoT点位数据采集记录"
  })
}

/** 提交 */
function submitForm() {
  proxy.$refs["IoTDataRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateIoTData(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addIoTData(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除IoT点位数据采集记录编号为"' + _ids + '"的数据项？').then(function() {
    return delIoTData(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出 */
function handleExport() {
  proxy.download('IoTData/IoTData/export', {
    ...queryParams.value
  }, `IoTData_${new Date().getTime()}.xlsx`)
}

getList()
</script>