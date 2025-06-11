const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../config/jwt');

// 验证Token的中间件
const authenticateToken = (req, res, next) => {
    console.log('验证令牌中...');
    console.log('请求头:', req.headers);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('未提供令牌');
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('令牌验证失败:', err);
            return res.status(403).json({ message: '令牌无效或已过期' });
        }
        console.log('令牌验证成功，用户信息:', user);
        req.user = user;
        next();
    });
};

// 检查管理员权限的中间件
const isAdmin = async (req, res, next) => {
    console.log('验证管理员权限中...');
    console.log('用户信息:', req.user);
    
    try {
        const [users] = await db.query(
            'SELECT admin_account FROM admin WHERE admin_account = ?',
            [req.user.account]
        );
        console.log('数据库查询结果:', users);

        if (users.length === 0 || !req.user.isAdmin) {
            console.log('非管理员用户尝试访问');
            return res.status(403).json({ message: '需要管理员权限' });
        }

        console.log('管理员权限验证通过');
        next();
    } catch (error) {
        console.error('验证管理员权限时出错:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ message: '验证管理员权限时出错' });
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    JWT_SECRET
}; 