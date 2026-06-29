// pages/1/4deworm/deworm.js
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
    currentPet: null,
    petList: [],
    dewormRecords: [],
    dewormCount: 0,
    nextDewormDays: '--',
    dewormRate: 0,
    showModal: false,
    isEdit: false,
    currentEditId: null,
    formData: {
      type: '体内',
      dewormDate: '',
      nextDewormDate: '',
      medicine: '',
      remark: ''
    }
  },

  onLoad() {
    this.loadPetList();
  },

  onShow() {
    if (this.data.currentPet) {
      this.loadDewormRecords();
    }
  },

  // 加载宠物列表
  async loadPetList() {
    try {
      const token = wx.getStorageSync('token');
      const userId = wx.getStorageSync('userId') || 1;
      
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
      
      if (res.data.code === 200) {
        const pets = res.data.data || [];
        this.setData({ petList: pets });
        
        // 获取上次选择的宠物
        let savedPetId = wx.getStorageSync('currentPetId');
        let currentPet = null;
        
        if (savedPetId) {
          currentPet = pets.find(p => p.id == savedPetId);
        }
        if (!currentPet && pets.length > 0) {
          currentPet = pets[0];
        }
        
        if (currentPet) {
          this.setData({ currentPet: currentPet });
          wx.setStorageSync('currentPetId', currentPet.id);
          this.loadDewormRecords();
        }
      }
    } catch (err) {
      console.error('加载宠物列表失败:', err);
    }
  },

  // 加载驱虫记录
  async loadDewormRecords() {
    if (!this.data.currentPet) return;
    
    try {
      const token = wx.getStorageSync('token');
      
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/api/deworm/list?petId=${this.data.currentPet.id}`,
          method: 'GET',
          header: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          success: resolve,
          fail: reject
        });
      });
      
      if (res.data.code === 200) {
        let records = res.data.data || [];
        
        // 计算距离下次驱虫的天数（使用 parseDate 兼容 iOS）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        records = records.map(record => {
          if (record.nextDewormDate) {
            const nextDate = parseDate(record.nextDewormDate);
            if (nextDate) {
              const diffTime = nextDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              record.daysUntilNext = diffDays;
            }
          }
          return record;
        });
        
        // 按驱虫日期倒序排列（使用 parseDate 兼容 iOS）
        records.sort((a, b) => {
          const dateA = parseDate(a.dewormDate);
          const dateB = parseDate(b.dewormDate);
          return dateB - dateA;
        });
        
        // 计算统计
        const dewormCount = records.length;
        
        let nextDewormDays = '--';
        const futureRecords = records.filter(r => r.nextDewormDate && parseDate(r.nextDewormDate) >= today);
        if (futureRecords.length > 0) {
          const nearest = futureRecords.sort((a, b) => {
            const dateA = parseDate(a.nextDewormDate);
            const dateB = parseDate(b.nextDewormDate);
            return dateA - dateB;
          })[0];
          nextDewormDays = nearest.daysUntilNext;
        }
        
        let dewormRate = 0;
        if (dewormCount > 0 && this.data.currentPet.age) {
          const petAgeMonths = this.data.currentPet.age;
          const expectedCount = Math.ceil(petAgeMonths / 1.5);
          dewormRate = Math.min(Math.round((dewormCount / expectedCount) * 100), 100);
        }
        
        this.setData({
          dewormRecords: records,
          dewormCount: dewormCount,
          nextDewormDays: nextDewormDays,
          dewormRate: dewormRate
        });
      }
    } catch (err) {
      console.error('加载驱虫记录失败:', err);
    }
  },

  // 显示宠物选择器
  showPetSelector() {
    if (this.data.petList.length === 0) {
      wx.showToast({ title: '暂无宠物', icon: 'none' });
      return;
    }
    
    const items = this.data.petList.map(pet => {
      return { id: pet.id, name: pet.name, type: pet.type };
    });
    
    wx.showActionSheet({
      itemList: items.map(i => `${i.name} (${i.type})`),
      success: (res) => {
        const selectedPet = this.data.petList[res.tapIndex];
        this.setData({ currentPet: selectedPet });
        wx.setStorageSync('currentPetId', selectedPet.id);
        this.loadDewormRecords();
      }
    });
  },

  // 添加驱虫记录
  addDewormRecord() {
    if (!this.data.currentPet) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }
    
    this.setData({
      showModal: true,
      isEdit: false,
      currentEditId: null,
      formData: {
        type: '体内',
        dewormDate: '',
        nextDewormDate: '',
        medicine: '',
        remark: ''
      }
    });
  },

  // 编辑记录
  editRecord(e) {
    const id = e.currentTarget.dataset.id;
    const record = this.data.dewormRecords.find(r => r.id === id);
    
    if (record) {
      this.setData({
        showModal: true,
        isEdit: true,
        currentEditId: id,
        formData: {
          type: record.type,
          dewormDate: record.dewormDate,
          nextDewormDate: record.nextDewormDate || '',
          medicine: record.medicine || '',
          remark: record.remark || ''
        }
      });
    }
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定删除这条驱虫记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const token = wx.getStorageSync('token');
            const result = await new Promise((resolve, reject) => {
              wx.request({
                url: `${app.globalData.apiBaseUrl}/api/deworm/delete/${id}`,
                method: 'DELETE',
                header: {
                  'Authorization': token ? `Bearer ${token}` : ''
                },
                success: resolve,
                fail: reject
              });
            });
            
            if (result.data.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadDewormRecords();
            } else {
              wx.showToast({ title: result.data.message || '删除失败', icon: 'none' });
            }
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 选择驱虫类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'formData.type': type });
  },

  // 选择驱虫日期
  onDateChange(e) {
    this.setData({ 'formData.dewormDate': e.detail.value });
  },

  // 选择下次驱虫日期
  onNextDateChange(e) {
    this.setData({ 'formData.nextDewormDate': e.detail.value });
  },

  // 输入药品
  onMedicineInput(e) {
    this.setData({ 'formData.medicine': e.detail.value });
  },

  // 输入备注
  onRemarkInput(e) {
    this.setData({ 'formData.remark': e.detail.value });
  },

  // 保存驱虫记录
  async saveDewormRecord() {
    const { formData, currentPet, isEdit, currentEditId } = this.data;
    
    if (!formData.dewormDate) {
      wx.showToast({ title: '请选择驱虫日期', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    try {
      const token = wx.getStorageSync('token');
      
      const requestData = {
        petId: currentPet.id,
        type: formData.type,
        dewormDate: formData.dewormDate,
        nextDewormDate: formData.nextDewormDate || null,
        medicine: formData.medicine || null,
        remark: formData.remark || null
      };
      
      let url, method;
      
      if (isEdit) {
        url = `${app.globalData.apiBaseUrl}/api/deworm/update`;
        method = 'PUT';
        requestData.id = currentEditId;
      } else {
        url = `${app.globalData.apiBaseUrl}/api/deworm/add`;
        method = 'POST';
      }
      
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: url,
          method: method,
          header: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          data: requestData,
          success: resolve,
          fail: reject
        });
      });
      
      wx.hideLoading();
      
      if (result.data.code === 200) {
        wx.showToast({ title: isEdit ? '修改成功' : '添加成功', icon: 'success' });
        this.setData({ showModal: false });
        this.loadDewormRecords();
      } else {
        wx.showToast({ title: result.data.message || '保存失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  // 查看全部记录
  goToRecord() {
    wx.showToast({ title: '全部记录', icon: 'none' });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});