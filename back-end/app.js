const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book'); 
const userBookRoutes = require('./routes/userBook');// 引入book路由
const borrowRoutes = require('./routes/borrow'); // 引入借阅路由
const announcementRoutes = require('./routes/announcement'); // 引入公告路由
const adminRoutes = require('./routes/admin'); // 引入管理员路由
const statisticsRouter = require('./routes/statistics');

const app = express();

// CORS配置
app.use(cors({
  origin: 'http://localhost:5173', // 前端开发服务器地址
  credentials: true // 允许跨域请求携带凭证
}));

// Session配置
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 开发环境设为false
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes); // 使用复数形式更符合RESTful规范
app.use('/api/userBooks', userBookRoutes); // 使用复数形式更符合RESTful规范
app.use('/api/borrow', borrowRoutes); // 借阅相关API
app.use('/api/announcements', announcementRoutes); // 公告相关API
app.use('/api/admin', adminRoutes); // 管理员相关API
app.use('/api/statistics', statisticsRouter);

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Library Management System API' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // 导出app用于测试