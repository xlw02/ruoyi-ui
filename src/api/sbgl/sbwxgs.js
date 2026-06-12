import request from '@/utils/request'

// 查询成型设备维修工时统计列表
export function listSbwxgs(query) {
  return request({
    url: '/sbgl/sbwxgs/list',
    method: 'get',
    params: query
  })
}

// 查询成型设备维修工时统计详细
export function getSbwxgs(id) {
  return request({
    url: '/sbgl/sbwxgs/' + id,
    method: 'get'
  })
}

// 新增成型设备维修工时统计
export function addSbwxgs(data) {
  return request({
    url: '/sbgl/sbwxgs',
    method: 'post',
    data: data
  })
}

// 修改成型设备维修工时统计
export function updateSbwxgs(data) {
  return request({
    url: '/sbgl/sbwxgs',
    method: 'put',
    data: data
  })
}

// 删除成型设备维修工时统计
export function delSbwxgs(id) {
  return request({
    url: '/sbgl/sbwxgs/' + id,
    method: 'delete'
  })
}
