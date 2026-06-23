import request from '@/utils/request'

// 查询钉钉机器人配置列表
export function listRobot(query) {
  return request({
    url: '/system/robot/list',
    method: 'get',
    params: query
  })
}

// 查询钉钉机器人配置详细
export function getRobot(robotId) {
  return request({
    url: '/system/robot/' + robotId,
    method: 'get'
  })
}

// 新增钉钉机器人配置
export function addRobot(data) {
  return request({
    url: '/system/robot',
    method: 'post',
    data: data
  })
}

// 修改钉钉机器人配置
export function updateRobot(data) {
  return request({
    url: '/system/robot',
    method: 'put',
    data: data
  })
}

// 删除钉钉机器人配置
export function delRobot(robotId) {
  return request({
    url: '/system/robot/' + robotId,
    method: 'delete'
  })
}
