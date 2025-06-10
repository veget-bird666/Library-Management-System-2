const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 用户端图书查询
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 10,
      category,
      keyword 
    } = req.query;

    // 确保 page 和 size 是数字类型
    const pageNum = parseInt(page, 10) || 1;
    const sizeNum = parseInt(size, 10) || 10;
    const offset = (pageNum - 1) * sizeNum;

    let query = 'SELECT *, IFNULL(available, 1) as available FROM book';
    let countQuery = 'SELECT COUNT(*) as total FROM book';
    const queryParams = [];

    // 构建WHERE条件
    const conditions = [];
    if (keyword) {
      conditions.push('(title LIKE ? OR author LIKE ?)');
      queryParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      conditions.push('category = ?');
      queryParams.push(category);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // 添加分页
    query += ` LIMIT ${sizeNum} OFFSET ${offset}`;

    console.log('执行查询:', query);
    console.log('查询参数:', queryParams);

    // 执行查询
    const [books] = await db.execute(query, queryParams);
    const [total] = await db.execute(countQuery, queryParams);

    res.json({
      success: true,
      data: books,
      pagination: {
        total: total[0].total,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(total[0].total / sizeNum)
      }
    });
  } catch (err) {
    console.error('用户图书查询错误:', err);
    res.status(500).json({ 
      success: false,
      message: '图书查询失败',
      error: err.message
    });
  }
});

module.exports = router;