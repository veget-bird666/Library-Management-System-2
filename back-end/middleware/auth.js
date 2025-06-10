const jwt = require('jsonwebtoken');

// JWT密钥
const JWT_SECRET = 'your-secret-key'; // 在实际应用中应该使用环境变量

// 验证Token的中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '令牌无效或已过期' });
        }
        req.user = user;
        next();
    });
};

// 检查管理员权限的中间件
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    JWT_SECRET
}; 