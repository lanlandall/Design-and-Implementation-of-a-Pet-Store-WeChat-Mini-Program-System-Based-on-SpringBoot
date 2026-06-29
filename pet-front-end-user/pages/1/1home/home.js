// pages/1/1home/home.js
const app = getApp();

// 解析日期字符串（兼容 iOS）
function parseDate(dateStr) {
  if (!dateStr) return null;
  // 将 "2026-03-10 00:00:00" 转换为 "2026/03/10 00:00:00"
  const formatted = dateStr.replace(/-/g, '/');
  return new Date(formatted);
}

Page({
  data: {
    // 状态
    loading: false,
    refreshing: false,
    
    // 当前位置
    currentLocation: '正在定位...',
    
    // 宠物列表
    pets: [],
    
    // 所有卡片（宠物卡片 + 添加宝贝卡片）
    allPets: [],
    currentCardIndex: 0,
    currentCard: null,
    
    // 驱虫记录
    dewormRecords: [],
    nextDewormDate: '',
    nextDewormType: '',
    dewormTip: '暂无驱虫记录',
    
    // 附近门店
    nearbyStores: [
      { id: 1, name: '萌宠诊所（望京店）', distance: 1.2, address: '望京街10号', image: '' },
      { id: 2, name: '宠物家（朝悦店）', distance: 2.5, address: '朝阳大悦城B1', image: '' }
    ],
    
    // 日历数据
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    displayYear: 2024,
    displayMonth: 3,
    calendarYear: 2024,
    calendarMonth: 3,
    calendarMode: 'week',
    calendarDates: [],
    emptyCells: 0,
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    this.loadData();
  },

  initData() {
    this.getLocation();
    this.loadPets();
  },

  async loadData() {
    this.setData({ loading: true });
    await this.loadPets();
    this.setData({ loading: false });
  },

  // 获取真实定位
  getLocation() {
    const that = this;
    
    // 先获取位置权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          // 已授权，直接获取位置
          that.getUserLocation();
        } else {
          // 未授权，请求授权
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              that.getUserLocation();
            },
            fail: () => {
              // 用户拒绝授权，显示提示
              that.setData({ currentLocation: '点击开启定位' });
              wx.showModal({
                title: '提示',
                content: '请允许定位权限，以便获取附近门店信息',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        }
      }
    });
  },

  // 获取用户位置
  getUserLocation() {
    const that = this;
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        that.setData({ currentLocation: '获取地址中...' });
        
        // 使用微信内置逆地址解析
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77`,
          success: (res) => {
            if (res.data.status === 0) {
              const addr = res.data.result.formatted_addresses?.recommend || 
                          res.data.result.address ||
                          `${res.data.result.address_component.city}${res.data.result.address_component.district}`;
              that.setData({ currentLocation: addr });
            } else {
              that.setData({ currentLocation: `${latitude.toFixed(4)},${longitude.toFixed(4)}` });
            }
          },
          fail: () => {
            that.setData({ currentLocation: `${latitude.toFixed(4)},${longitude.toFixed(4)}` });
          }
        });
      },
      fail: () => {
        that.setData({ currentLocation: '定位失败' });
      }
    });
  },

  // 逆地址解析（将坐标转换为地址）
  reverseGeocode(latitude, longitude) {
    const that = this;
    
    // 使用腾讯地图API或微信内置逆地址解析
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_KEY&get_poi=0`,
      method: 'GET',
      success: (res) => {
        if (res.data.status === 0) {
          const address = res.data.result.address_component;
          const city = address.city;
          const district = address.district;
          // 显示格式：城市 + 区域
          const locationName = `${city}${district}`;
          that.setData({ currentLocation: locationName || '当前位置' });
        } else {
          // 解析失败，显示坐标
          that.setData({ currentLocation: `${latitude.toFixed(2)},${longitude.toFixed(2)}` });
        }
      },
      fail: () => {
        // 使用高德地图备用
        that.reverseGeocodeAMap(latitude, longitude);
      }
    });
  },

  // 高德地图逆地址解析（备用）
  reverseGeocodeAMap(latitude, longitude) {
    const that = this;
    
    wx.request({
      url: `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${longitude},${latitude}&key=YOUR_AMAP_KEY&radius=1000&extensions=all`,
      method: 'GET',
      success: (res) => {
        if (res.data.status === '1') {
          const address = res.data.regeocode.addressComponent;
          const city = address.city;
          const district = address.district;
          const locationName = `${city}${district}`;
          that.setData({ currentLocation: locationName || '当前位置' });
        } else {
          that.setData({ currentLocation: '定位失败' });
        }
      },
      fail: () => {
        that.setData({ currentLocation: '定位失败' });
      }
    });
  },

  // 手动点击定位
  onLocationTap() {
    this.getLocation();
  },

  // 从后端加载宠物列表
  async loadPets() {
    try {
      const userId = app.globalData.userId || wx.getStorageSync('userId') || 1;
      const token = wx.getStorageSync('token');
      
      console.log('请求宠物列表 - userId:', userId);
      console.log('请求宠物列表 - token:', token ? '已获取' : '未获取');
      
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/api/pet/list`,
          method: 'GET',
          header: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          data: { userId: userId },
          success: resolve,
          fail: reject
        });
      });
      
      console.log('宠物列表响应:', res.data);
      
      if (res.data.code === 200) {
        const pets = res.data.data || [];
        
        // 构建卡片数组
        const allCards = [];
        pets.forEach(pet => {
          allCards.push({
            type: 'pet',
            data: pet
          });
        });
        allCards.push({ type: 'add', data: null });
        
        // 获取上次保存的卡片索引
        let savedIndex = wx.getStorageSync('currentCardIndex');
        if (savedIndex === '' || savedIndex >= allCards.length) {
          savedIndex = 0;
        }
        
        this.setData({
          pets: pets,
          allPets: allCards,
          currentCardIndex: savedIndex,
          currentCard: allCards[savedIndex]
        });
        
        // 加载当前宠物的驱虫记录
        if (allCards[savedIndex] && allCards[savedIndex].type === 'pet') {
          await this.loadDewormRecords(allCards[savedIndex].data.id);
        }
        
        // 生成日历
        this.generateCalendarDates();
      }
    } catch (err) {
      console.error('加载宠物列表失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载驱虫记录
  async loadDewormRecords(petId) {
    if (!petId) return;
    
    try {
      const token = wx.getStorageSync('token');
      
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/api/deworm/list?petId=${petId}`,
          method: 'GET',
          header: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          success: resolve,
          fail: reject
        });
      });
      
      if (res.data.code === 200) {
        const petRecords = res.data.data || [];
        this.setData({ dewormRecords: petRecords });
        this.calcNextDeworm(petRecords);
      }
    } catch (err) {
      console.error('加载驱虫记录失败:', err);
    }
  },

  // 计算下次驱虫
  calcNextDeworm(petRecords) {
    if (petRecords && petRecords.length > 0) {
      // 按驱虫日期倒序排序，取最新的（使用 parseDate 兼容 iOS）
      const sortedRecords = [...petRecords].sort((a, b) => {
        const dateA = parseDate(a.dewormDate);
        const dateB = parseDate(b.dewormDate);
        return dateB - dateA;
      });
      const lastRecord = sortedRecords[0];
      
      const lastDate = parseDate(lastRecord.dewormDate);
      const nextDate = new Date(lastDate);
      
      // 根据驱虫类型计算下次驱虫日期
      if (lastRecord.type === '体内') {
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      this.setData({
        nextDewormDate: `${nextDate.getMonth() + 1}月${nextDate.getDate()}日`,
        nextDewormType: lastRecord.type || '体内',
        dewormTip: `下次${lastRecord.type}驱虫: ${nextDate.getMonth() + 1}月${nextDate.getDate()}日`
      });
    } else {
      this.setData({
        nextDewormDate: '',
        nextDewormType: '',
        dewormTip: '暂无驱虫记录'
      });
    }
  },

  // 生成日历数据
  generateCalendarDates() {
    const today = new Date();
    const currentYear = this.data.calendarYear;
    const currentMonth = this.data.calendarMonth;
    
    let dates = [];
    let displayYear, displayMonth;
    let emptyCells = 0;
    
    if (this.data.calendarMode === 'week') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const startDate = new Date(yesterday);
      
      displayYear = startDate.getFullYear();
      displayMonth = startDate.getMonth() + 1;
      
      for (let i = 0; i < 21; i++) {
        const dateObj = new Date(startDate);
        dateObj.setDate(startDate.getDate() + i);
        
        dates.push({
          date: dateObj,
          day: dateObj.getDate(),
          month: dateObj.getMonth() + 1,
          year: dateObj.getFullYear(),
          isToday: this.isToday(dateObj),
          isFirstDay: dateObj.getDate() === 1,
          hasDeworm: this.checkDewormDate(dateObj)
        });
      }
    } else {
      displayYear = currentYear;
      displayMonth = currentMonth;
      
      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
      let firstDayWeekday = firstDayOfMonth.getDay();
      firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
      emptyCells = firstDayWeekday;
      
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
      const totalDays = lastDayOfMonth.getDate();
      
      for (let d = 1; d <= totalDays; d++) {
        const dateObj = new Date(currentYear, currentMonth - 1, d);
        dates.push({
          date: dateObj,
          day: d,
          month: currentMonth,
          year: currentYear,
          isToday: this.isToday(dateObj),
          isFirstDay: d === 1,
          hasDeworm: this.checkDewormDate(dateObj)
        });
      }
    }
    
    this.setData({ 
      calendarDates: dates,
      emptyCells: emptyCells,
      displayYear: displayYear,
      displayMonth: displayMonth
    });
  },

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  },

  // 检查是否有驱虫记录
  checkDewormDate(date) {
    if (!this.data.currentCard || this.data.currentCard.type !== 'pet') return false;
    
    const currentPet = this.data.currentCard.data;
    return this.data.dewormRecords.some(record => {
      const recordDate = parseDate(record.dewormDate);
      return record.petId === currentPet.id &&
            recordDate.getDate() === date.getDate() &&
            recordDate.getMonth() === date.getMonth() &&
            recordDate.getFullYear() === date.getFullYear();
    });
  },

  // 上一个卡片
  async prevPet() {
    if (this.data.allPets.length <= 1) return;
    
    let index = this.data.currentCardIndex - 1;
    if (index < 0) index = this.data.allPets.length - 1;
    
    this.setData({
      currentCardIndex: index,
      currentCard: this.data.allPets[index]
    });
    
    wx.setStorageSync('currentCardIndex', index);
    
    if (this.data.currentCard.type === 'pet') {
      await this.loadDewormRecords(this.data.currentCard.data.id);
    } else {
      this.setData({
        dewormRecords: [],
        nextDewormDate: '',
        nextDewormType: '',
        dewormTip: '暂无驱虫记录'
      });
    }
    this.generateCalendarDates();
  },

  // 下一个卡片
  async nextPet() {
    if (this.data.allPets.length <= 1) return;
    
    let index = this.data.currentCardIndex + 1;
    if (index >= this.data.allPets.length) index = 0;
    
    this.setData({
      currentCardIndex: index,
      currentCard: this.data.allPets[index]
    });
    
    wx.setStorageSync('currentCardIndex', index);
    
    if (this.data.currentCard.type === 'pet') {
      await this.loadDewormRecords(this.data.currentCard.data.id);
    } else {
      this.setData({
        dewormRecords: [],
        nextDewormDate: '',
        nextDewormType: '',
        dewormTip: '暂无驱虫记录'
      });
    }
    this.generateCalendarDates();
  },

  // 点击宠物卡片
  onPetBannerTap() {
    if (this.data.currentCard.type === 'pet') {
      wx.navigateTo({
        url: `/pages/1/3pets/pet?id=${this.data.currentCard.data.id}&mode=edit`
      });
    } else {
      wx.navigateTo({
        url: '/pages/1/3pets/pet?mode=add'
      });
    }
  },

  goToAddPet() {
    wx.navigateTo({
      url: '/pages/1/3pets/pet?mode=add'
    });
  },

  switchCalendarMode() {
    const newMode = this.data.calendarMode === 'week' ? 'all' : 'week';
    
    if (newMode === 'all') {
      const today = new Date();
      this.setData({
        calendarMode: newMode,
        calendarYear: today.getFullYear(),
        calendarMonth: today.getMonth() + 1
      });
    } else {
      this.setData({ calendarMode: newMode });
    }
    this.generateCalendarDates();
  },

  prevMonth() {
    if (this.data.calendarMode === 'week') {
      const firstDate = this.data.calendarDates[0]?.date;
      if (firstDate) {
        const newFirstDate = new Date(firstDate);
        newFirstDate.setDate(newFirstDate.getDate() - 21);
        this.generateWeekDates(newFirstDate);
      }
    } else {
      let year = this.data.calendarYear;
      let month = this.data.calendarMonth - 1;
      if (month < 1) { month = 12; year--; }
      this.setData({ calendarYear: year, calendarMonth: month });
      this.generateCalendarDates();
    }
  },
  
  nextMonth() {
    if (this.data.calendarMode === 'week') {
      const lastDate = this.data.calendarDates[this.data.calendarDates.length - 1]?.date;
      if (lastDate) {
        const newFirstDate = new Date(lastDate);
        newFirstDate.setDate(lastDate.getDate() + 1);
        this.generateWeekDates(newFirstDate);
      }
    } else {
      let year = this.data.calendarYear;
      let month = this.data.calendarMonth + 1;
      if (month > 12) { month = 1; year++; }
      this.setData({ calendarYear: year, calendarMonth: month });
      this.generateCalendarDates();
    }
  },
  
  generateWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 21; i++) {
      const dateObj = new Date(startDate);
      dateObj.setDate(startDate.getDate() + i);
      dates.push({
        date: dateObj,
        day: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
        isToday: this.isToday(dateObj),
        isFirstDay: dateObj.getDate() === 1,
        hasDeworm: this.checkDewormDate(dateObj)
      });
    }
    this.setData({ 
      calendarDates: dates,
      displayYear: startDate.getFullYear(),
      displayMonth: startDate.getMonth() + 1
    });
  },

  onDateTap(e) {
    const date = e.currentTarget.dataset.date;
    wx.showToast({
      title: `${date.getMonth()+1}月${date.getDate()}日`,
      icon: 'none'
    });
  },

  // 点击定位
  onLocationTap() {
    this.getLocation();
  },

  goToMap() {
    wx.navigateTo({ url: '/pages/1/2position/map' });
  },

  goToRecord() {
    wx.navigateTo({ url: '/pages/1/4record/record' });
  },

  goToAI() {
    wx.navigateTo({ url: '/pages/1/5AI/AI' });
  },

  goToDeworm() {
    wx.navigateTo({ url: '/pages/1/4deworm/deworm' });
  },

  goToStore(e) {
    const storeId = e.currentTarget.dataset.id;
    wx.showToast({ title: `门店${storeId}详情`, icon: 'none' });
  },

  goToMessage() {
    wx.showToast({ title: '首页', icon: 'none' });
  },

  goToMoreCare() {
    wx.showToast({ title: '更多关爱提醒', icon: 'none' });
  },

  async onRefresh() {
    this.setData({ refreshing: true });
    await this.loadData();
    this.setData({ refreshing: false });
    wx.showToast({ title: '刷新成功', icon: 'success' });
  },

  loadMore() {
    console.log('触底加载更多');
  },

  onShareAppMessage() {
    return {
      title: '宠物之家 - 关爱每一天',
      path: '/pages/1/1home/home'
    };
  }
});