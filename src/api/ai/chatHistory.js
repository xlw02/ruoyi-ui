import request from '@/utils/request'

// 查询 AI 对话历史列表
export function listHistory(query) {
  return request({
    url: '/ai/history/list',
    method: 'get',
    params: query
  })
}

// 查询单条详情
export function getHistory(historyId) {
  return request({
    url: '/ai/history/' + historyId,
    method: 'get'
  })
}

// 根据会话ID查询完整对话（system + user + assistant 按时间升序）
export function getConversation(conversationId) {
  return request({
    url: '/ai/history/conversation/' + conversationId,
    method: 'get'
  })
}

// 导出历史记录
export function exportHistory(query) {
  return request({
    url: '/ai/history/export',
    method: 'post',
    params: query
  })
}

// 删除单条或多条
export function delHistory(historyId) {
  return request({
    url: '/ai/history/' + historyId,
    method: 'delete'
  })
}

// 删除整个会话
export function delConversation(conversationId) {
  return request({
    url: '/ai/history/conversation/' + conversationId,
    method: 'delete'
  })
}

// 清空全部历史
export function cleanHistory() {
  return request({
    url: '/ai/history/clean',
    method: 'delete'
  })
}
