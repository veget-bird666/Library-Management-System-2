// 获取用户信用分
router.get('/:userAccount/credit', async (req, res) => {
  try {
    const { userAccount } = req.params;
    
    const [rows] = await db.query(
      'SELECT user_credit FROM user WHERE user_account = ?',
      [userAccount]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        credit: rows[0].user_credit
      }
    });
  } catch (error) {
    console.error('获取用户信用分失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信用分失败'
    });
  }
}); 