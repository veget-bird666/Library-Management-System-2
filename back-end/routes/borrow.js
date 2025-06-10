const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 创建借阅申请
router.post('/applications', async (req, res) => {
  const { book_id, user_account } = req.body;
  
  try {
    // 检查图书是否可借
    const [bookCheck] = await db.execute(
      'SELECT available FROM book WHERE book_id = ?',
      [book_id]
    );
    
    if (bookCheck.length === 0) {
      return res.status(404).json({ success: false, message: '图书不存在' });
    }
    
    if (bookCheck[0].available === 0) {
      return res.status(400).json({ success: false, message: '图书已被借出' });
    }

    // 获取用户的管理员账号
    const [userInfo] = await db.execute(
      'SELECT admin_account FROM user WHERE user_account = ?',
      [user_account]
    );
    
    if (userInfo.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 创建借阅申请
    await db.execute(
      'INSERT INTO borrow_application (book_id, user_account, admin_account) VALUES (?, ?, ?)',
      [book_id, user_account, userInfo[0].admin_account]
    );

    // 更新图书状态为不可借
    await db.execute(
      'UPDATE book SET available = 0 WHERE book_id = ?',
      [book_id]
    );

    res.json({ success: true, message: '借阅申请提交成功' });
  } catch (error) {
    console.error('创建借阅申请失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户的借阅申请
router.get('/applications/user/:user_account', async (req, res) => {
  const { user_account } = req.params;
  
  try {
    const [applications] = await db.execute(`
      SELECT ba.*, b.title, b.author, b.publisher 
      FROM borrow_application ba 
      JOIN book b ON ba.book_id = b.book_id 
      WHERE ba.user_account = ? 
      ORDER BY ba.apply_time DESC
    `, [user_account]);

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('获取用户借阅申请失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取管理员的待处理申请
router.get('/applications/admin/:admin_account', async (req, res) => {
  const { admin_account } = req.params;
  
  try {
    const [applications] = await db.execute(`
      SELECT ba.*, b.title, b.author, b.publisher, u.nickname as user_nickname
      FROM borrow_application ba 
      JOIN book b ON ba.book_id = b.book_id 
      JOIN user u ON ba.user_account = u.user_account
      WHERE ba.admin_account = ? AND ba.status = 0
      ORDER BY ba.apply_time DESC
    `, [admin_account]);

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('获取管理员待处理申请失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 处理借阅申请（批准/拒绝）
router.put('/applications/:application_id', async (req, res) => {
  const { application_id } = req.params;
  const { status, admin_remark } = req.body; // status: 1-批准, 2-拒绝
  
  try {
    // 获取申请详情
    const [applicationInfo] = await db.execute(
      'SELECT * FROM borrow_application WHERE application_id = ?',
      [application_id]
    );
    
    if (applicationInfo.length === 0) {
      return res.status(404).json({ success: false, message: '申请不存在' });
    }

    const application = applicationInfo[0];

    // 更新申请状态
    await db.execute(
      'UPDATE borrow_application SET status = ?, process_time = NOW(), admin_remark = ? WHERE application_id = ?',
      [status, admin_remark || null, application_id]
    );

    if (status === 1) { // 批准
      // 创建借阅记录
      await db.execute(
        'INSERT INTO borrow_record (book_id, user_account, status, borrow_time) VALUES (?, ?, 1, NOW())',
        [application.book_id, application.user_account]
      );
    } else { // 拒绝
      // 恢复图书可借状态
      await db.execute(
        'UPDATE book SET available = 1 WHERE book_id = ?',
        [application.book_id]
      );
    }

    res.json({ success: true, message: status === 1 ? '申请已批准' : '申请已拒绝' });
  } catch (error) {
    console.error('处理借阅申请失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户的借阅记录
router.get('/records/user/:user_account', async (req, res) => {
  const { user_account } = req.params;
  
  try {
    const [records] = await db.execute(`
      SELECT br.*, b.title, b.author, b.publisher 
      FROM borrow_record br 
      JOIN book b ON br.book_id = b.book_id 
      WHERE br.user_account = ? 
      ORDER BY br.borrow_time DESC
    `, [user_account]);

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('获取用户借阅记录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取管理员管理的借阅记录
router.get('/records/admin/:admin_account', async (req, res) => {
  const { admin_account } = req.params;
  
  try {
    const [records] = await db.execute(`
      SELECT br.*, b.title, b.author, b.publisher, u.nickname as user_nickname
      FROM borrow_record br 
      JOIN book b ON br.book_id = b.book_id 
      JOIN user u ON br.user_account = u.user_account
      WHERE u.admin_account = ?
      ORDER BY br.borrow_time DESC
    `, [admin_account]);

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('获取管理员借阅记录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 归还图书
router.put('/records/:record_id/return', async (req, res) => {
  const { record_id } = req.params;
  
  try {
    // 获取借阅记录
    const [recordInfo] = await db.execute(
      'SELECT * FROM borrow_record WHERE record_id = ?',
      [record_id]
    );
    
    if (recordInfo.length === 0) {
      return res.status(404).json({ success: false, message: '借阅记录不存在' });
    }

    const record = recordInfo[0];

    // 更新借阅记录状态和归还时间
    await db.execute(
      'UPDATE borrow_record SET status = 2, return_time = NOW() WHERE record_id = ?',
      [record_id]
    );

    // 恢复图书可借状态
    await db.execute(
      'UPDATE book SET available = 1 WHERE book_id = ?',
      [record.book_id]
    );

    res.json({ success: true, message: '图书归还成功' });
  } catch (error) {
    console.error('归还图书失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router; 