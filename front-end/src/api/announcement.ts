import request from '../utils/request'

// 获取所有公告
export const getAnnouncements = () => {
  return request({
    url: '/api/announcements',
    method: 'get'
  })
}

// 发布新公告
export const createAnnouncement = (content: string) => {
  return request({
    url: '/api/announcements',
    method: 'post',
    data: { content }
  })
}

// 删除公告
export const deleteAnnouncement = (announceId: number) => {
  return request({
    url: `/api/announcements/${announceId}`,
    method: 'delete'
  })
}
