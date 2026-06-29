// pages/5/1profile/profile.js
const app = getApp();

Page({
  data: {
    refreshing: false,
    loading: false,
    hasLoaded: false,
    
    // 弹窗控制
    showActionSheet: false,      // 底部操作菜单
    showAccountModal: false,     // 切换账号弹窗
    accountList: [],             // 账号列表
    currentUserId: wx.getStorageSync('userId') || '',  // 当前登录用户ID
    
    userInfo: {
      avatar: '',
      nickName: '点击登录',
      phone: ''
    },
    
    userAssets: {
      cardCount: 0,
      voucherCount: 0,
      coinCount: 0,
      giftCount: 0
    },
    
    myPets: []
  },

  onLoad() {
    this.loadUserData();
    this.loadAccountList();
  },

  onShow() {
    const token = wx.getStorageSync('token');
    this.setData({ currentUserId: wx.getStorageSync('userId') || '' });
    
    if (token && !this.data.hasLoaded) {
      this.loadUserData();
    } else if (!token) {
      this.setData({
        userInfo: { avatar: '', nickName: '点击登录', phone: '' },
        myPets: [],
        hasLoaded: false
      });
    }
    this.loadAccountList();
  },

  loadUserData() {
    const token = wx.getStorageSync('token');
    
    if (!token) {
      this.setData({
        userInfo: { avatar: '', nickName: '点击登录', phone: '' },
        myPets: [],
        hasLoaded: false
      });
      return;
    }
    
    // 有 token 才加载
    this.fetchUserInfo();
    this.fetchPetList();
    this.setData({ hasLoaded: true });
  },

  // 加载账号列表
  loadAccountList() {
    const accountList = wx.getStorageSync('accountList') || [];
    this.setData({ accountList });
  },

  fetchUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/info`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        console.log('用户信息响应:', res.data);
        if (res.data && res.data.code === 200) {
          const user = res.data.data;
          this.setData({
            userInfo: {
              avatar: user.avatarUrl || '',
              nickName: user.username || '萌宠家长',
              phone: user.phone || '',
              account: user.account || '',
              userId: user.id
            }
          });
        }
      }
    });
  },

  fetchPetList() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/pet/list`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        console.log('宠物列表响应:', res.data);
        if (res.data && res.data.code === 200) {
          const pets = res.data.data || [];
          const myPets = pets.map(pet => ({
            id: pet.id,
            name: pet.name,
            avatar: pet.avatar || '',
            type: pet.type,
            breed: pet.breed
          }));
          this.setData({ myPets });
          wx.setStorageSync('myPets', myPets);
        }
      }
    });
  },

  onRefresh() {
    this.setData({ refreshing: true, hasLoaded: false });
    this.loadUserData();
    setTimeout(() => this.setData({ refreshing: false }), 500);
  },

  // ===== 操作菜单 =====
  
  // 显示底部操作菜单
  showActionSheet() {
    console.log('=== 齿轮被点击了 ===');

    this.setData({ showActionSheet: true });
  },

  // 隐藏底部操作菜单
  hideActionSheet() {
    this.setData({ showActionSheet: false });
  },

  // ===== 切换账号 =====
  
  // 显示切换账号弹窗
  showSwitchAccount() {
    this.hideActionSheet();  // 先关闭操作菜单
    this.loadAccountList();   // 刷新账号列表
    this.setData({ showAccountModal: true });
  },

  // 隐藏切换账号弹窗
  hideModal() {
    this.setData({ showAccountModal: false });
  },

  // 切换账号
  switchAccount(e) {
    const userId = e.currentTarget.dataset.id;
    const account = this.data.accountList.find(item => item.userId == userId);
    
    if (account) {
      wx.setStorageSync('token', account.token);
      wx.setStorageSync('userId', account.userId);
      wx.setStorageSync('currentUser', account);
      
      this.setData({ 
        showAccountModal: false,
        hasLoaded: false,
        currentUserId: account.userId
      });
      
      wx.showToast({ title: '切换成功', icon: 'success' });
      this.loadUserData();
    }
  },

  // 删除账号
  deleteAccount(e) {
    const userId = e.currentTarget.dataset.id;
    let accountList = this.data.accountList;
    const currentUserId = wx.getStorageSync('userId');
    
    wx.showModal({
      title: '提示',
      content: '确定要移除该账号吗？',
      success: (res) => {
        if (res.confirm) {
          accountList = accountList.filter(item => item.userId != userId);
          wx.setStorageSync('accountList', accountList);
          this.setData({ accountList });
          
          if (currentUserId == userId) {
            if (accountList.length > 0) {
              const firstAccount = accountList[0];
              wx.setStorageSync('token', firstAccount.token);
              wx.setStorageSync('userId', firstAccount.userId);
              this.setData({ 
                hasLoaded: false,
                currentUserId: firstAccount.userId
              });
              this.loadUserData();
            } else {
              this.handleLogout();
            }
          }
          
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  },

  // 添加新账号（跳转登录页）
  addAccount() {
    this.hideModal();
    // 传参 mode=add，告诉登录页不要自动跳转
    wx.reLaunch({ url: '/pages/0/0login/login?mode=add' });
  },

  // 退出登录
  handleLogout() {
    this.hideActionSheet();
    wx.showModal({
      title: '提示',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          // 只清除当前登录状态，不清除 accountList
          wx.removeStorageSync('token');
          wx.removeStorageSync('userId');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('myPets');
          wx.removeStorageSync('currentUser');
          
          this.setData({
            userInfo: { avatar: '', nickName: '点击登录', phone: '' },
            myPets: [],
            hasLoaded: false,
            currentUserId: ''
          });
          
          wx.showToast({ title: '已退出', icon: 'success' });
          
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/0/0login/login' });
          }, 1000);
        }
      }
    });
  },

  // ===== 页面跳转 =====
  goToProfileEdit() {
    const token = wx.getStorageSync('token');
    
    if (!token) {
      wx.navigateTo({ url: '/pages/0/0login/login' });
      return;
    }
    
    // 验证 token 有效性
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/info`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.data.code === 200) {
          wx.navigateTo({ url: '/pages/5/2profile-edit/edit' });
        } else {
          // token 无效，清除并跳转登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('userId');
          wx.navigateTo({ url: '/pages/0/0login/login' });
        }
      },
      fail: () => {
        wx.navigateTo({ url: '/pages/0/0login/login' });
      }
    });
  },

  goToCardPack() {
    wx.navigateTo({ url: '/pages/5/3card-pack/card' });
  },

  goToServiceVoucher() {
    wx.navigateTo({ url: '/pages/5/4service-voucher/voucher' });
  },

  goToCanCoin() {
    wx.navigateTo({ url: '/pages/5/5can-coin/coin' });
  },

  goToGiftVoucher() {
    wx.navigateTo({ url: '/pages/5/6gift-voucher/voucher' });
  },

  goToPetDetail(e) {
    const petId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/1/3pets/pet?id=${petId}&mode=edit` });
  },

  goToAddPet() {
    wx.navigateTo({ url: '/pages/1/3pets/pet?mode=add' });
  },

  goToMyReview() {
    wx.navigateTo({ url: '/pages/5/8my-review/review' });
  },

  goToBill() {
    wx.navigateTo({ url: '/pages/5/9bill/bill' });
  },

  goToBillQuery() {
    wx.navigateTo({ url: '/pages/5/9bill/bill?type=invoice' });
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/5/11suggestions/suggestions' });
  },

  goToContact() {
    wx.navigateTo({ url: '/pages/5/12contact-customer-service/contact' });
  },

  goToMore() {
    wx.navigateTo({ url: '/pages/5/13more/more' });
  },

  onShareAppMessage() {
    return {
      title: '宠物之家',
      path: '/pages/1/1home/home'
    };
  }
});