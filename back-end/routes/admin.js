const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// 获取所有用户列表
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    console.log('收到获取用户列表请求');
    console.log('请求头:', req.headers);
    console.log('用户信息:', req.user);
    
    try {
        console.log('开始查询数据库');
        const [users] = await db.query(
            'SELECT user_account, nickname, user_credit, status FROM user WHERE admin_account IS NOT NULL'
        );
        console.log('查询结果:', users);
        res.json(users);
    } catch (error) {
        console.error('获取用户列表错误:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '获取用户列表失败', error: error.message });
    }
});

// 更新用户信用分
router.post('/update-credit', authenticateToken, isAdmin, async (req, res) => {
    console.log('收到更新信用分请求');
    console.log('请求体:', req.body);
    console.log('用户信息:', req.user);
    
    const { userAccount, newCredit } = req.body;
    
    try {
        // 首先获取用户当前的信用分
        const [users] = await db.query(
            'SELECT user_credit FROM user WHERE user_account = ?',
            [userAccount]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        // 验证新的信用分是否在有效范围内
        if (typeof newCredit !== 'number' || isNaN(newCredit)) {
            return res.status(400).json({ message: '无效的信用分值' });
        }
        
        // 确保信用分在0-10之间
        const validatedCredit = Math.min(Math.max(newCredit, 0), 10);
        
        console.log('开始更新数据库');
        console.log('当前信用分:', users[0].user_credit);
        console.log('新信用分:', validatedCredit);
        
        await db.query(
            'UPDATE user SET user_credit = ? WHERE user_account = ?',
            [validatedCredit, userAccount]
        );
        
        console.log('更新成功');
        res.json({ 
            message: '信用分更新成功',
            oldCredit: users[0].user_credit,
            newCredit: validatedCredit
        });
    } catch (error) {
        console.error('更新信用分错误:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '信用分更新失败', error: error.message });
    }
});

// 切换用户状态
router.post('/toggle-user-status', authenticateToken, isAdmin, async (req, res) => {
    console.log('收到切换用户状态请求');
    console.log('请求体:', req.body);
    console.log('用户信息:', req.user);
    
    const { userAccount, status } = req.body;
    try {
        console.log('开始更新数据库');
        await db.query(
            'UPDATE user SET status = ? WHERE user_account = ?',
            [status, userAccount]
        );
        console.log('更新成功');
        res.json({ message: '用户状态更新成功' });
    } catch (error) {
        console.error('切换用户状态错误:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '用户状态更新失败', error: error.message });
    }
});

module.exports = router; 