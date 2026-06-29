const app = getApp();

Page({
  data: {
    showPwdLogin: false,
    account: '',
    password: ''
  },
  
  onLoad(options) {
    // 如果是添加账号模式，不自动跳转
    if (options.mode === 'add') {
      return;
    }
    
    // 如果已经登录，直接跳转首页
    if (wx.getStorageSync('token')) {
      wx.switchTab({ url: '/pages/1/1home/home' });
    }
  },

  // ========== 微信一键登录 ==========
  handleWechatLogin() {
    wx.showLoading({ title: '登录中...' });
    
    app.onLoginSuccess = () => {
      wx.hideLoading();
      this.saveLoginData(app.globalData.loginResult);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/1/1home/home' });
      }, 1000);
    };
    
    app.login();
  },

  // ========== 开发者登录 ==========
  handleDevLogin() {
    wx.showLoading({ title: '开发者登录...' });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/login`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { code: 'dev-login' },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 200) {
          this.saveLoginData(res.data.data);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            wx.switchTab({ url: '/pages/1/1home/home' });
          }, 1000);
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // ========== 账号密码登录 ==========
  handlePwdLogin() {
    const { account, password } = this.data;
    
    if (!account) {
      wx.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '登录中...' });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/pwd-login`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { account, password },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 200) {
          this.saveLoginData(res.data.data);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            wx.switchTab({ url: '/pages/1/1home/home' });
          }, 1000);
        } else {
          wx.showToast({ title: res.data.message || '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // ========== 保存登录数据 ==========
  saveLoginData(data) {
    // 保存当前登录信息
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('userId', data.userId);
    app.globalData.userId = data.userId;
    
    // 构建账号信息
    const newAccount = {
      userId: data.userId,
      nickname: data.nickname || '用户',
      token: data.token,
      phone: data.phone || '',
      avatar: data.avatar || ''
    };
    
    // 保存到账号列表
    let accountList = wx.getStorageSync('accountList') || [];
    const index = accountList.findIndex(item => item.userId == newAccount.userId);
    
    if (index > -1) {
      accountList[index] = newAccount;
    } else {
      accountList.push(newAccount);
    }
    
    wx.setStorageSync('accountList', accountList);
    console.log('账号列表已更新:', accountList);
  },

  // ========== 切换密码登录 ==========
  togglePwdLogin() {
    this.setData({ showPwdLogin: !this.data.showPwdLogin });
  },

  // ========== 输入事件 ==========
  onAccountInput(e) {
    this.setData({ account: e.detail.value });
  },
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  }
});