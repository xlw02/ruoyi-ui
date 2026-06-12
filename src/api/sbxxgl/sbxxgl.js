import request from '@/utils/request'

// 查询设备信息管理列表
export function listSbxxgl(query) {
  return request({
    url: '/sbxxgl/sbxxgl/list',
    method: 'get',
    params: query
  })
}

// 查询设备信息管理详细
export function getSbxxgl(ID) {
  return request({
    url: '/sbxxgl/sbxxgl/' + ID,
    method: 'get'
  })
}

// 新增设备信息管理
export function addSbxxgl(data) {
  return request({
    url: '/sbxxgl/sbxxgl',
    method: 'post',
    data: data
  })
}

// 修改设备信息管理
export function updateSbxxgl(data) {
  return request({
    url: '/sbxxgl/sbxxgl',
    method: 'put',
    data: data
  })
}

// 删除设备信息管理
export function delSbxxgl(ID) {
  return request({
    url: '/sbxxgl/sbxxgl/' + ID,
    method: 'delete'
  })
}
