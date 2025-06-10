const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// 获取所有公告
router.get('/', async (req, res) => {
    try {
        const [announcements] = await pool.query(
            'SELECT * FROM announcement ORDER BY publish_time DESC'
        );
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: '获取公告列表失败' });
    }
});

// 发布新公告（仅管理员）
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    const { content } = req.body;
    const adminAccount = req.user.account;

    if (!content) {
        return res.status(400).json({ message: '公告内容不能为空' });
    }

    try {
        await pool.query(
            'INSERT INTO announcement (admin_account, content) VALUES (?, ?)',
            [adminAccount, content]
        );
        res.status(201).json({ message: '公告发布成功' });
    } catch (error) {
        console.error('Error publishing announcement:', error);
        res.status(500).json({ message: '发布公告失败' });
    }
});

// 删除公告（仅管理员）
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    const announceId = req.params.id;

    try {
        const [result] = await pool.query(
            'DELETE FROM announcement WHERE announce_id = ?',
            [announceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '公告不存在' });
        }

        res.json({ message: '公告删除成功' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: '删除公告失败' });
    }
});

module.exports = router; 