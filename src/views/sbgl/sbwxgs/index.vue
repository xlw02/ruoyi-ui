<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日期" prop="day">
        <el-date-picker clearable
          v-model="queryParams.day"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="填报人" prop="tbr">
        <el-input
          v-model="queryParams.tbr"
          placeholder="请输入填报人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="班组" prop="bz">
        <el-input
          v-model="queryParams.bz"
          placeholder="请输入班组"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="区域" prop="qy">
        <el-input
          v-model="queryParams.qy"
          placeholder="请输入区域"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="故障开始时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeGzStartTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="故障结束时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeGzEndTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="故障类型" prop="gzlx">
        <el-input
          v-model="queryParams.gzlx"
          placeholder="请输入故障类型"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="故障类别" prop="gzlb">
        <el-input
          v-model="queryParams.gzlb"
          placeholder="请输入故障类别"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="处理人" prop="clr">
        <el-input
          v-model="queryParams.clr"
          placeholder="请输入处理人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机台汇总显示" prop="total">
        <el-input
          v-model="queryParams.total"
          placeholder="请输入机台汇总显示"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="createName">
        <el-input
          v-model="queryParams.createName"
          placeholder="请输入创建人"
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
          v-hasPermi="['sbgl:sbwxgs:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sbgl:sbwxgs:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sbgl:sbwxgs:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sbgl:sbwxgs:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sbwxgsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="日期" align="center" prop="day" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.day, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="填报人" align="center" prop="tbr" />
      <el-table-column label="班组" align="center" prop="bz" />
      <el-table-column label="区域" align="center" prop="qy" />
      <el-table-column label="故障开始时间" align="center" prop="gzStartTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.gzStartTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="故障结束时间" align="center" prop="gzEndTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.gzEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="故障时间" align="center" prop="gzTime" />
      <el-table-column label="故障类型" align="center" prop="gzlx" />
      <el-table-column label="故障类别" align="center" prop="gzlb" />
      <el-table-column label="胶囊规格" align="center" prop="jngg" />
      <el-table-column label="胶囊使用次数" align="center" prop="jnsycs" />
      <el-table-column label="故障位置" align="center" prop="gzwz" />
      <el-table-column label="故障问题" align="center" prop="gzwt" />
      <el-table-column label="故障原因" align="center" prop="gzyy" />
      <el-table-column label="故障处理方法" align="center" prop="gzclff" />
      <el-table-column label="处理人" align="center" prop="clr" />
      <el-table-column label="标准鼓宽/周长：mm" align="center" prop="bzzc" />
      <el-table-column label="实际鼓宽/周长：mm" align="center" prop="sjzc" />
      <el-table-column label="备注说明" align="center" prop="bzsm" />
      <el-table-column label="机台汇总显示" align="center" prop="total" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sbgl:sbwxgs:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sbgl:sbwxgs:remove']">删除</el-button>
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

    <!-- 添加或修改成型设备维修工时统计对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="sbwxgsRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="日期" prop="day">
              <el-date-picker clearable
                v-model="form.day"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="填报人" prop="tbr">
              <el-input v-model="form.tbr" placeholder="请输入填报人" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="班组" prop="bz">
              <el-input v-model="form.bz" placeholder="请输入班组" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="区域" prop="qy">
              <el-input v-model="form.qy" placeholder="请输入区域" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障开始时间" prop="gzStartTime">
              <el-date-picker clearable
                v-model="form.gzStartTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择故障开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障结束时间" prop="gzEndTime">
              <el-date-picker clearable
                v-model="form.gzEndTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择故障结束时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障时间" prop="gzTime">
              <el-input v-model="form.gzTime" placeholder="请输入故障时间" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障类型" prop="gzlx">
              <el-input v-model="form.gzlx" placeholder="请输入故障类型" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障类别" prop="gzlb">
              <el-input v-model="form.gzlb" placeholder="请输入故障类别" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="胶囊规格" prop="jngg">
              <el-input v-model="form.jngg" placeholder="请输入胶囊规格" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="胶囊使用次数" prop="jnsycs">
              <el-input v-model="form.jnsycs" placeholder="请输入胶囊使用次数" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障位置" prop="gzwz">
              <el-input v-model="form.gzwz" placeholder="请输入故障位置" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障问题" prop="gzwt">
              <el-input v-model="form.gzwt" placeholder="请输入故障问题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障原因" prop="gzyy">
              <el-input v-model="form.gzyy" placeholder="请输入故障原因" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障处理方法" prop="gzclff">
              <el-input v-model="form.gzclff" placeholder="请输入故障处理方法" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="处理人" prop="clr">
              <el-input v-model="form.clr" placeholder="请输入处理人" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标准鼓宽/周长：mm" prop="bzzc">
              <el-input v-model="form.bzzc" placeholder="请输入标准鼓宽/周长：mm" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="实际鼓宽/周长：mm" prop="sjzc">
              <el-input v-model="form.sjzc" placeholder="请输入实际鼓宽/周长：mm" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注说明" prop="bzsm">
              <el-input v-model="form.bzsm" placeholder="请输入备注说明" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="机台汇总显示" prop="total">
              <el-input v-model="form.total" placeholder="请输入机台汇总显示" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="创建人" prop="createName">
              <el-input v-model="form.createName" placeholder="请输入创建人" />
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

<script setup name="Sbwxgs">
import { listSbwxgs, getSbwxgs, delSbwxgs, addSbwxgs, updateSbwxgs } from "@/api/sbgl/sbwxgs"

const { proxy } = getCurrentInstance()

const sbwxgsList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const daterangeGzStartTime = ref([])
const daterangeGzEndTime = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    day: undefined,
    tbr: undefined,
    bz: undefined,
    qy: undefined,
    gzStartTime: undefined,
    gzEndTime: undefined,
    gzlx: undefined,
    gzlb: undefined,
    clr: undefined,
    total: undefined,
    createName: undefined,
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询成型设备维修工时统计列表 */
function getList() {
  loading.value = true
  queryParams.value.params = {}
  if (null != daterangeGzStartTime.value && '' != daterangeGzStartTime.value) {
    queryParams.value.params["beginGzStartTime"] = daterangeGzStartTime.value[0]
    queryParams.value.params["endGzStartTime"] = daterangeGzStartTime.value[1]
  }
  if (null != daterangeGzEndTime.value && '' != daterangeGzEndTime.value) {
    queryParams.value.params["beginGzEndTime"] = daterangeGzEndTime.value[0]
    queryParams.value.params["endGzEndTime"] = daterangeGzEndTime.value[1]
  }
  listSbwxgs(queryParams.value).then(response => {
    sbwxgsList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    day: null,
    lsh: null,
    tbr: null,
    bz: null,
    qy: null,
    jtBzp: null,
    jtCx: null,
    jtLh: null,
    jtHzl: null,
    gzStartTime: null,
    gzEndTime: null,
    gzTime: null,
    gzlx: null,
    gzlb: null,
    jngg: null,
    jnsycs: null,
    gzwz: null,
    gzwt: null,
    gzyy: null,
    gzclff: null,
    clr: null,
    bzzc: null,
    sjzc: null,
    bzsm: null,
    total: null,
    createName: null,
    createTime: null,
    updateTime: null,
    fdlComparisonType: null
  }
  proxy.resetForm("sbwxgsRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeGzStartTime.value = []
  daterangeGzEndTime.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加成型设备维修工时统计"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getSbwxgs(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改成型设备维修工时统计"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sbwxgsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSbwxgs(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSbwxgs(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除成型设备维修工时统计编号为"' + _ids + '"的数据项？').then(function() {
    return delSbwxgs(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sbgl/sbwxgs/export', {
    ...queryParams.value
  }, `sbwxgs_${new Date().getTime()}.xlsx`)
}

getList()
</script>
