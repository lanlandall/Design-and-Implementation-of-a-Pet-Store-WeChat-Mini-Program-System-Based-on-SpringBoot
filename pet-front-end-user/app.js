// app.js
App({
  globalData: {
    userId: null,
    systemInfo: null,
    apiBaseUrl: '',
    isLogin: false
  },
    
  onLaunch() {
    // 1. 先设置 API 地址（必须最先执行）
    this.setApiBaseUrl();
    
    // 2. 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 3. 检查更新
    this.checkUpdate();
    
    // 4. 验证 token（此时 apiBaseUrl 已经有值了）
    const token = wx.getStorageSync('token');
    
    if (token) {
      wx.request({
        url: `${this.globalData.apiBaseUrl}/api/user/info`,
        method: 'GET',
        header: { 'Authorization': `Bearer ${token}` },
        success: (res) => {
          if (res.data && res.data.code === 200) {
            console.log('token 有效，自动登录');
            this.globalData.isLogin = true;
            this.globalData.userId = res.data.data.id;
          } else {
            console.log('token 已失效，清除缓存');
            wx.removeStorageSync('token');
            wx.removeStorageSync('userId');
            wx.removeStorageSync('userInfo');
            this.globalData.isLogin = false;
          }
        },
        fail: () => {
          console.log('网络错误，token 可能失效');
        }
      });
    } else {
      this.globalData.isLogin = false;
    }
  },
  
  // 自动判断并切换 API 地址
  setApiBaseUrl() {
    const systemInfo = wx.getSystemInfoSync();
    
    // 通过 platform 判断（更准确）
    if (systemInfo.platform === 'devtools') {
      this.globalData.apiBaseUrl = 'http://localhost:8080';
    } else {
      this.globalData.apiBaseUrl = 'http://jd86fd99.natappfree.cc';
    }
    
    console.log('platform:', systemInfo.platform);
    console.log('apiBaseUrl:', this.globalData.apiBaseUrl);
  },
  
  login() {
    wx.login({
      success: (res) => {
        wx.request({
          url: `${this.globalData.apiBaseUrl}/api/user/login`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: { code: res.code, nickname: '微信用户', avatar: '' },
          success: (response) => {
            if (response.data && response.data.code === 200) {
              const data = response.data.data;
              wx.setStorageSync('token', data.token);
              wx.setStorageSync('userId', data.userId);
              this.globalData.userId = data.userId;
              this.globalData.isLogin = true;
              
              if (this.onLoginSuccess) {
                this.onLoginSuccess();
              }
            }
          }
        });
      }
    });
  },
  
  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      console.log('是否有新版本:', res.hasUpdate);
    });
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
  }
});