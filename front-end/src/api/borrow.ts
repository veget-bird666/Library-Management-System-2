import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/borrow';

export interface BorrowApplication {
  application_id: number;
  book_id: string;
  user_account: string;
  admin_account: string;
  apply_time: string;
  process_time?: string;
  status: number; // 0-待处理 1-已批准 2-已拒绝
  user_remark?: string;
  admin_remark?: string;
  title?: string;
  author?: string;
  publisher?: string;
  user_nickname?: string;
}

export interface BorrowRecord {
  record_id: number;
  book_id: string;
  user_account: string;
  status: number; // 1-在借 2-归还 3-逾期
  borrow_time: string;
  return_time?: string;
  should_return_time: string;
  title?: string;
  author?: string;
  publisher?: string;
  user_nickname?: string;
}

// 创建借阅申请
export const createBorrowApplication = async (book_id: string, user_account: string) => {
  const response = await axios.post(`${API_BASE_URL}/applications`, {
    book_id,
    user_account
  });
  return response.data;
};

// 获取用户的借阅申请
export const getUserApplications = async (user_account: string) => {
  const response = await axios.get(`${API_BASE_URL}/applications/user/${user_account}`);
  return response.data;
};

// 获取管理员的待处理申请
export const getAdminApplications = async (admin_account: string) => {
  const response = await axios.get(`${API_BASE_URL}/applications/admin/${admin_account}`);
  return response.data;
};

// 处理借阅申请
export const processApplication = async (application_id: number, status: number, admin_remark?: string) => {
  const response = await axios.put(`${API_BASE_URL}/applications/${application_id}`, {
    status,
    admin_remark
  });
  return response.data;
};

// 获取用户的借阅记录
export const getUserBorrowRecords = async (user_account: string) => {
  const response = await axios.get(`${API_BASE_URL}/records/user/${user_account}`);
  return response.data;
};

// 获取管理员管理的借阅记录
export const getAdminBorrowRecords = async (admin_account: string) => {
  const response = await axios.get(`${API_BASE_URL}/records/admin/${admin_account}`);
  return response.data;
};

// 归还图书
export const returnBook = async (record_id: number) => {
  const response = await axios.put(`${API_BASE_URL}/records/${record_id}/return`);
  return response.data;
};
