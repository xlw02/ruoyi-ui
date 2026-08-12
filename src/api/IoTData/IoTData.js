import request from '@/utils/request'

// 查询IoT点位数据采集记录列表
export function listIoTData(query) {
  return request({
    url: '/IoTData/IoTData/list',
    method: 'get',
    params: query
  })
}

// 查询IoT点位数据采集记录详细
export function getIoTData(id) {
  return request({
    url: '/IoTData/IoTData/' + id,
    method: 'get'
  })
}

// 新增IoT点位数据采集记录
export function addIoTData(data) {
  return request({
    url: '/IoTData/IoTData',
    method: 'post',
    data: data
  })
}

// 修改IoT点位数据采集记录
export function updateIoTData(data) {
  return request({
    url: '/IoTData/IoTData',
    method: 'put',
    data: data
  })
}

// 删除IoT点位数据采集记录
export function delIoTData(id) {
  return request({
    url: '/IoTData/IoTData/' + id,
    method: 'delete'
  })
}
