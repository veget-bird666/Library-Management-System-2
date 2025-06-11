const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, isAdmin } = req.body;
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 选择表名
        if (isAdmin) {
            // 管理员注册
            const [existingAdmins] = await db.execute(
                'SELECT * FROM admin WHERE admin_account = ?',
                [email]
            );
            
            if (existingAdmins.length > 0) {
                return res.status(400).json({ message: '该账号已被注册' });
            }
            
            const [result] = await db.execute(
                'INSERT INTO admin (admin_account, admin_password, admin_nickname) VALUES (?, ?, ?)',
                [email, hashedPassword, username]
            );
            
            res.status(201).json({
                message: '管理员注册成功',
                adminAccount: email
            });
        } else {
            // 普通用户注册
            const [existingUsers] = await db.execute(
                'SELECT * FROM user WHERE user_account = ?',
                [email]
            );
            
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: '该账号已被注册' });
            }
            
            // 随机分配管理员
            const [admins] = await db.execute('SELECT admin_account FROM admin');
            if (admins.length === 0) {
                return res.status(400).json({ message: '系统暂无可用的管理员账号' });
            }
            
            const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
            
            const [result] = await db.execute(
                'INSERT INTO user (user_account, user_password, nickname, admin_account, user_credit, status) VALUES (?, ?, ?, ?, 5.0, 1)',
                [email, hashedPassword, username, randomAdmin.admin_account]
            );
            
            res.status(201).json({
                message: '用户注册成功',
                userAccount: email,
                adminAccount: randomAdmin.admin_account
            });
        }
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '注册失败，请稍后重试' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { email, password, isAdmin } = req.body;
        console.log('收到登录请求：', {
            email,
            isAdmin,
            path: req.path,
            method: req.method,
            headers: req.headers
        });
        
        // 选择表名
        if (isAdmin) {
            console.log('尝试管理员登录');
            // 管理员登录
            const [admins] = await db.execute(
                'SELECT * FROM admin WHERE admin_account = ?',
                [email]
            );
            console.log('查询管理员结果：', { found: admins.length > 0 });
            
            if (admins.length === 0) {
                console.log('管理员账号不存在');
                return res.status(401).json({ message: '账号或密码错误' });
            }
            
            const admin = admins[0];
            const validPassword = await bcrypt.compare(password, admin.admin_password);
            console.log('密码验证结果：', validPassword);
            
            if (!validPassword) {
                console.log('管理员密码错误');
                return res.status(401).json({ message: '账号或密码错误' });
            }

            // 生成JWT token
            const token = jwt.sign(
                { 
                    account: admin.admin_account,
                    isAdmin: true 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('管理员登录成功，生成token');
            
            res.json({
                message: '登录成功',
                token: token,
                user: {
                    account: admin.admin_account,
                    nickname: admin.admin_nickname,
                    isAdmin: true
                }
            });
        } else {
            console.log('尝试用户登录');
            // 普通用户登录
            const [users] = await db.execute(
                'SELECT * FROM user WHERE user_account = ?',
                [email]
            );
            console.log('查询用户结果：', { found: users.length > 0 });
            
            if (users.length === 0) {
                console.log('用户账号不存在');
                return res.status(401).json({ message: '账号或密码错误' });
            }
            
            const user = users[0];
            const validPassword = await bcrypt.compare(password, user.user_password);
            console.log('密码验证结果：', validPassword);
            
            if (!validPassword) {
                console.log('用户密码错误');
                return res.status(401).json({ message: '账号或密码错误' });
            }

            // 检查用户状态和信用分
            if (user.status === 0) {
                console.log('用户账号已被冻结');
                return res.status(403).json({ message: '账号已被冻结，请联系管理员' });
            }
            if (user.user_credit <= 0) {
                console.log('用户信用分不足');
                return res.status(403).json({ message: '信用分不足，暂时无法使用系统' });
            }

            // 生成JWT token
            const token = jwt.sign(
                { 
                    account: user.user_account,
                    isAdmin: false 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('用户登录成功，生成token');
            
            res.json({
                message: '登录成功',
                token: token,
                user: {
                    account: user.user_account,
                    nickname: user.nickname,
                    admin_account: user.admin_account,
                    isAdmin: false,
                    credit: user.user_credit,
                    status: user.status
                }
            });
        }
        
    } catch (error) {
        console.error('登录错误:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '登录失败，请稍后重试' });
    }
});

// 获取管理员管理的用户列表
router.get('/admin/:admin_account/users', async (req, res) => {
    try {
        const { admin_account } = req.params;
        
        const [users] = await db.execute(
            'SELECT user_account, nickname, user_credit, status FROM user WHERE admin_account = ?',
            [admin_account]
        );
        
        res.json({
            success: true,
            data: users,
            message: '获取用户列表成功'
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ 
            success: false,
            message: '获取用户列表失败，请稍后重试' 
        });
    }
});

// 更新用户信用分
router.post('/admin/:admin_account/update-credit', async (req, res) => {
    try {
        const { admin_account } = req.params;
        const { userAccount, newCredit } = req.body;

        const [result] = await db.execute(
            'UPDATE user SET user_credit = ? WHERE user_account = ? AND admin_account = ?',
            [newCredit, userAccount, admin_account]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ 
                success: false,
                message: '无权操作此用户' 
            });
        }

        res.json({
            success: true,
            message: '信用分更新成功'
        });
    } catch (error) {
        console.error('更新信用分错误:', error);
        res.status(500).json({ 
            success: false,
            message: '更新信用分失败，请稍后重试' 
        });
    }
});

// 更新用户状态
router.post('/admin/:admin_account/toggle-status', async (req, res) => {
    try {
        const { admin_account } = req.params;
        const { userAccount, status } = req.body;

        const [result] = await db.execute(
            'UPDATE user SET status = ? WHERE user_account = ? AND admin_account = ?',
            [status, userAccount, admin_account]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ 
                success: false,
                message: '无权操作此用户' 
            });
        }

        res.json({
            success: true,
            message: '用户状态更新成功'
        });
    } catch (error) {
        console.error('更新用户状态错误:', error);
        res.status(500).json({ 
            success: false,
            message: '更新用户状态失败，请稍后重试' 
        });
    }
});

// 获取用户详细信息
router.get('/user/:user_account', async (req, res) => {
    try {
        const { user_account } = req.params;
        
        const [users] = await db.execute(
            `SELECT u.user_account, u.nickname, u.admin_account, u.user_credit, u.status,
                    a.admin_nickname 
             FROM user u 
             LEFT JOIN admin a ON u.admin_account = a.admin_account 
             WHERE u.user_account = ?`,
            [user_account]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: '用户不存在' 
            });
        }
        
        res.json({
            success: true,
            data: users[0],
            message: '获取用户信息成功'
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ 
            success: false,
            message: '获取用户信息失败，请稍后重试' 
        });
    }
});

// 获取管理员详细信息
router.get('/admin/:admin_account', async (req, res) => {
    try {
        const { admin_account } = req.params;
        
        const [admins] = await db.execute(
            'SELECT admin_account, admin_nickname FROM admin WHERE admin_account = ?',
            [admin_account]
        );
        
        if (admins.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: '管理员不存在' 
            });
        }
        
        res.json({
            success: true,
            data: admins[0],
            message: '获取管理员信息成功'
        });
    } catch (error) {
        console.error('获取管理员信息错误:', error);
        res.status(500).json({ 
            success: false,
            message: '获取管理员信息失败，请稍后重试' 
        });
    }
});

module.exports = router; 