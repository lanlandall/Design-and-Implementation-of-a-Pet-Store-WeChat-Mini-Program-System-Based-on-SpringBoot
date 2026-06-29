// pages/5/2profile-edit/edit.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onLoad() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/info`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          this.setData({ userInfo: res.data.data });
        }
      },
      fail: (err) => {
        console.error('加载用户信息失败:', err);
      }
    });
  },

  // 更换头像
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        wx.showLoading({ title: '上传中...' });
        
        wx.uploadFile({
          url: `${app.globalData.apiBaseUrl}/api/user/avatar`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          },
          success: (uploadRes) => {
            wx.hideLoading();
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {
              this.setData({ 'userInfo.avatarUrl': data.data });
              wx.showToast({ title: '头像更新成功', icon: 'success' });
            } else {
              wx.showToast({ title: data.message || '上传失败', icon: 'none' });
            }
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        });
      }
    });
  },

  // 输入事件
  onUsernameInput(e) {
    this.setData({ 'userInfo.username': e.detail.value });
  },
  onAccountInput(e) {
    this.setData({ 'userInfo.account': e.detail.value });
  },
  onPhoneInput(e) {
    this.setData({ 'userInfo.phone': e.detail.value });
  },
  onOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value });
  },
  onNewPasswordInput(e) {
    this.setData({ newPassword: e.detail.value });
  },
  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  // 修改密码
  changePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    
    if (!oldPassword) {
      wx.showToast({ title: '请输入原密码', icon: 'none' });
      return;
    }
    if (!newPassword) {
      wx.showToast({ title: '请输入新密码', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '修改中...' });
    
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/password`,
      method: 'PUT',
      header: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: { oldPassword, newPassword },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 200) {
          wx.showToast({ title: '密码修改成功', icon: 'success' });
          this.setData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          wx.showToast({ title: res.data?.message || '修改失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 保存资料
  saveProfile() {
    const { userInfo } = this.data;
    
    wx.showLoading({ title: '保存中...' });
    
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/profile`,
      method: 'PUT',
      header: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        username: userInfo.username,
        account: userInfo.account,
        phone: userInfo.phone
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 200) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.data?.message || '保存失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
});