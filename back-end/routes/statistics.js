const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取图书借阅类别统计
router.get('/borrow-categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        b.category,
        COUNT(*) as count,
        COUNT(*) / (
          SELECT COUNT(*) 
          FROM borrow_record br2 
          JOIN book b2 ON br2.book_id = b2.book_id
          WHERE 1=1
          ${startDate ? "AND br2.borrow_time >= ?" : ""}
          ${endDate ? "AND br2.borrow_time <= ?" : ""}
        ) as percentage
      FROM borrow_record br
      JOIN book b ON br.book_id = b.book_id
      WHERE 1=1
      ${startDate ? "AND br.borrow_time >= ?" : ""}
      ${endDate ? "AND br.borrow_time <= ?" : ""}
      GROUP BY b.category
      ORDER BY count DESC
    `;

    const params = [];
    if (startDate) {
      params.push(startDate);
      if (endDate) params.push(endDate);
    }
    if (startDate) {
      params.push(startDate);
      if (endDate) params.push(endDate);
    }

    const [results] = await db.query(sql, params);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('获取借阅统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

module.exports = router; 