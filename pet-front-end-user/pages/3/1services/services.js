// pages/3/1services/services.js
const app = getApp();
const api = require('../../../utils/api.js');

Page({
  data: {
    currentMainTab: 'appointment',
    currentOrderTab: 'mall',
    
    // 地址相关
    showAddressModal: false,
    showAddAddressModal: false,
    addressList: [],
    selectedAddress: null,
    currentAddressId: null,
    newAddress: { name: '', phone: '', address: '' },
    
    // 宠物相关
    selectedPet: null,
    selectedPetId: null,
    hasPet: false,
    petList: [],
    showPetModal: false,
    
    // 服务分类
    leftMenuList: [
      { name: '推荐套餐', categoryId: 1, services: [] },
      { name: '限时折扣', categoryId: 2, services: [] },
      { name: '基础护理', categoryId: 3, services: [] },
      { name: '上门铲屎', categoryId: 4, services: [] },
      { name: '宠物寄养', categoryId: 5, services: [] },
      { name: '专车运送', categoryId: 6, services: [] }
    ],
    currentLeftIndex: 0,
    loadingServices: false,
    
    // 商城订单
    mallOrders: [],
    // 服务订单
    serviceOrders: [],
    // 订单通用
    loadingOrders: false,
    hasMoreOrders: true,
    orderPageNum: 1,
    orderPageSize: 10,
    
    // 购买弹窗
    showBuyModal: false,
    buyService: null,
    quantity: 1,
    serviceDate: '',
    selectedTimeIndex: 0,
    minDate: '',
    totalPrice: 0,

    // 订单详情弹窗
    showOrderDetailModal: false,
    orderDetail: null
  },

  // ========== 生命周期 ==========
  onLoad(options) {
    this.initData();
    this.loadAllServices();
  },

  onShow() {
    this.loadPetList();
    this.loadAddressList();
    if (this.data.currentMainTab === 'order') {
      this.loadOrders(true);
    }
  },

  // ========== 初始化 ==========
  initData() {
    this.loadAddressList();
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.setData({ minDate: `${year}-${month}-${day}` });
    
    this.loadPetList();
  },

  // ========== 地址管理 ==========
  loadAddressList() {
    const addressList = wx.getStorageSync('addressList') || [
      { id: 1, name: '默认地址', phone: '138****0000', address: '杭州市西湖区' }
    ];
    const selectedAddressId = wx.getStorageSync('selectedAddressId') || 1;
    const selectedAddress = addressList.find(a => a.id === selectedAddressId) || addressList[0];
    
    this.setData({ addressList, selectedAddress, currentAddressId: selectedAddressId });
  },

  showAddressSelector() {
    this.setData({ showAddressModal: true });
  },

  hideAddressModal() {
    this.setData({ showAddressModal: false });
  },

  selectAddress(e) {
    const { id, address } = e.currentTarget.dataset;
    const addressItem = this.data.addressList.find(a => a.id === id);
    
    this.setData({ 
      selectedAddress: addressItem,
      currentAddressId: id,
      showAddressModal: false 
    });
    
    wx.setStorageSync('selectedAddressId', id);
    wx.showToast({ title: '地址已切换', icon: 'success' });
  },

  showAddAddress() {
    this.setData({ 
      showAddAddressModal: true,
      newAddress: { name: '', phone: '', address: '' }
    });
  },

  hideAddAddressModal() {
    this.setData({ showAddAddressModal: false });
  },

  onAddressNameInput(e) { this.setData({ 'newAddress.name': e.detail.value }); },
  onAddressPhoneInput(e) { this.setData({ 'newAddress.phone': e.detail.value }); },
  onAddressDetailInput(e) { this.setData({ 'newAddress.address': e.detail.value }); },

  saveNewAddress() {
    const { name, phone, address } = this.data.newAddress;
    if (!name) return wx.showToast({ title: '请输入联系人', icon: 'none' });
    if (!phone) return wx.showToast({ title: '请输入电话', icon: 'none' });
    if (!address) return wx.showToast({ title: '请输入地址', icon: 'none' });
    
    const newId = Date.now();
    const newAddress = { id: newId, name, phone, address };
    const addressList = [...this.data.addressList, newAddress];
    
    this.setData({
      addressList,
      selectedAddress: newAddress,
      currentAddressId: newId,
      showAddAddressModal: false
    });
    
    wx.setStorageSync('addressList', addressList);
    wx.setStorageSync('selectedAddressId', newId);
    wx.showToast({ title: '地址已保存', icon: 'success' });
  },

  deleteAddress(e) {
    const { id } = e.currentTarget.dataset;
    let addressList = this.data.addressList.filter(a => a.id !== id);
    
    if (this.data.selectedAddress?.id === id) {
      const selectedAddress = addressList.length > 0 ? addressList[0] : null;
      this.setData({ selectedAddress, currentAddressId: selectedAddress?.id || null });
      wx.setStorageSync('selectedAddressId', selectedAddress?.id || null);
    }
    
    this.setData({ addressList });
    wx.setStorageSync('addressList', addressList);
    wx.showToast({ title: '已删除', icon: 'success' });
  },

  // ========== 宠物相关 ==========
  async loadPetList() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    try {
      const res = await api.getPetList();
      if (res.code === 200 && res.data) {
        const petList = res.data;
        const hasPet = petList.length > 0;
        
        let selectedPet = null;
        let selectedPetId = wx.getStorageSync('selectedPetId');
        
        if (selectedPetId) {
          selectedPet = petList.find(p => p.id == selectedPetId);
        }
        if (!selectedPet && hasPet) {
          selectedPet = petList[0];
          selectedPetId = selectedPet.id;
          wx.setStorageSync('selectedPetId', selectedPetId);
        }
        
        this.setData({ petList, hasPet, selectedPet, selectedPetId });
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    }
  },

  showPetSelector() {
    if (!this.data.hasPet) {
      wx.showModal({
        title: '提示',
        content: '暂无宠物，请先添加宠物',
        confirmText: '去添加',
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: '/pages/1/3pets/pet' });
        }
      });
      return;
    }
    this.setData({ showPetModal: true });
  },

  hidePetModal() {
    this.setData({ showPetModal: false });
  },

  selectPet(e) {
    const pet = e.currentTarget.dataset.pet;
    this.setData({ selectedPet: pet, selectedPetId: pet.id, showPetModal: false });
    wx.setStorageSync('selectedPetId', pet.id);
    wx.showToast({ title: `已选择${pet.name}`, icon: 'success' });
  },

  goToAddPet() {
    wx.navigateTo({ url: '/pages/1/3pets/pet' });
  },

  goToPetManagement() {
    this.showPetSelector();
  },

  // ========== 服务数据 ==========
  async loadAllServices() {
    if (this.data.loadingServices) return;
    this.setData({ loadingServices: true });
    
    try {
      const results = await Promise.all(
        this.data.leftMenuList.map(cat => this.loadServiceItemsByCategory(cat.categoryId))
      );
      
      const updatedMenuList = this.data.leftMenuList.map((item, index) => ({
        ...item,
        services: results[index] || []
      }));
      
      this.setData({ leftMenuList: updatedMenuList, loadingServices: false });
    } catch (error) {
      this.setData({ loadingServices: false });
    }
  },

  async loadServiceItemsByCategory(categoryId) {
    try {
      const res = await api.getServicesByCategory(categoryId);
      if (res.code === 200 && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data.list || []);
        return items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.original_price,
          image: item.image_url || '/images/service-default.png',
          tag: this.getServiceTag(item)
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  getServiceTag(item) {
    if (item.sales > 500) return '爆款';
    if (item.sales > 300) return '热销';
    if (item.original_price && item.original_price > item.price) {
      return Math.round((item.price / item.original_price) * 10) + '折';
    }
    return '';
  },

  // ========== 左侧菜单 ==========
  onLeftMenuTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentLeftIndex: index });
    wx.createSelectorQuery().select(`#section-${index}`).boundingClientRect().exec((res) => {
      if (res[0]) {
        wx.createSelectorQuery().select('.right-content').node().exec((node) => {
          if (node[0]) {
            node[0].node.scrollTo({ top: res[0].top - 50 });
          }
        });
      }
    });
  },

  // ========== 购买弹窗 ==========
  showBuyModal(e) {
    if (!this.data.hasPet) {
      wx.showModal({
        title: '提示',
        content: '暂无宠物，请先添加宠物',
        confirmText: '去添加',
        success: (res) => { if (res.confirm) wx.navigateTo({ url: '/pages/1/3pets/pet' }); }
      });
      return;
    }
    if (!this.data.selectedPet) {
      wx.showModal({
        title: '提示',
        content: '请先选择服务宠物',
        confirmText: '去选择',
        success: (res) => { if (res.confirm) this.showPetSelector(); }
      });
      return;
    }
    const service = e.currentTarget.dataset.service;
    this.setData({
      showBuyModal: true,
      buyService: service,
      quantity: 1,
      serviceDate: '',
      selectedTimeIndex: 0,
      totalPrice: service.price
    });
  },

  hideBuyModal() { this.setData({ showBuyModal: false }); },
  stopPropagation() {},
  onDateChange(e) { this.setData({ serviceDate: e.detail.value }); },
  selectTime(e) { this.setData({ selectedTimeIndex: parseInt(e.currentTarget.dataset.index) }); },
  
  decreaseQuantity() {
    if (this.data.quantity <= 1) return;
    const q = this.data.quantity - 1;
    this.setData({ quantity: q, totalPrice: this.data.buyService.price * q });
  },
  
  increaseQuantity() {
    const q = this.data.quantity + 1;
    this.setData({ quantity: q, totalPrice: this.data.buyService.price * q });
  },

  async confirmBuy() {
    const { buyService, quantity, serviceDate, selectedTimeIndex, selectedPet, selectedAddress } = this.data;
    
    if (!selectedPet) return wx.showToast({ title: '请先选择服务宠物', icon: 'none' });
    if (!serviceDate) return wx.showToast({ title: '请选择服务日期', icon: 'none' });
    if (!selectedAddress) return wx.showToast({ title: '请选择服务地址', icon: 'none' });
    
    const timeMap = { 0: '09:00:00', 1: '14:00:00', 2: '19:00:00' };
    const fullServiceTime = `${serviceDate} ${timeMap[selectedTimeIndex]}`;
    
    wx.showLoading({ title: '创建订单中...' });
    
    try {
      const res = await api.createServiceOrder({
        serviceId: buyService.id,
        quantity,
        serviceTime: fullServiceTime,
        address: selectedAddress.address,
        receiverName: selectedAddress.name,
        receiverPhone: selectedAddress.phone,
        petId: selectedPet.id,
        petName: selectedPet.name
      });
      
      wx.hideLoading();
      
      if (res.code === 200) {
        wx.showToast({ title: '订单创建成功', icon: 'success' });
        this.setData({ showBuyModal: false });
        // 跳转到订单列表
        this.setData({ currentMainTab: 'order', currentOrderTab: 'service' });
        this.loadOrders(true);
      } else {
        wx.showToast({ title: res.message || '创建失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  },

  // ========== 主标签切换 ==========
  switchToAppointment() { 
    this.setData({ currentMainTab: 'appointment' }); 
  },
  
  switchToOrder() { 
    this.setData({ currentMainTab: 'order' }); 
    this.loadOrders(true);
  },

  // ========== 订单子标签切换 ==========
  switchToMallOrder() { 
    this.setData({ currentOrderTab: 'mall', orderPageNum: 1, hasMoreOrders: true }); 
    this.loadOrders(true);
  },
  
  switchToServiceOrder() { 
    this.setData({ currentOrderTab: 'service', orderPageNum: 1, hasMoreOrders: true }); 
    this.loadOrders(true);
  },

  // ========== 加载订单 ==========
  async loadOrders(isRefresh = false) {
    if (this.data.loadingOrders) return;
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    if (isRefresh) {
      this.setData({ orderPageNum: 1, hasMoreOrders: true });
      if (this.data.currentOrderTab === 'mall') {
        this.setData({ mallOrders: [] });
      } else if (this.data.currentOrderTab === 'service') {
        this.setData({ serviceOrders: [] });
      }
    }
    
    this.setData({ loadingOrders: true });
    
    try {
      const { currentOrderTab, orderPageNum, orderPageSize } = this.data;
      let res;
      
      if (currentOrderTab === 'mall') {
        res = await api.getOrderList({ pageNum: orderPageNum, pageSize: orderPageSize, orderType: 'PRODUCT' });
        if (res && res.code === 200) {
          const orders = res.data.list || [];
          const total = res.data.total || 0;
          const newOrders = isRefresh ? orders : [...this.data.mallOrders, ...orders];
          // 添加状态文本
          newOrders.forEach(order => {
            order.statusText = this.getOrderStatusText(order.status, 'PRODUCT');
          });
          this.setData({ mallOrders: newOrders, hasMoreOrders: orderPageNum * orderPageSize < total });
        }
      } else if (currentOrderTab === 'service') {
        res = await api.getServiceOrders({ pageNum: orderPageNum, pageSize: orderPageSize });
        if (res && res.code === 200) {
          const orders = res.data.list || [];
          const total = res.data.total || 0;
          const newOrders = isRefresh ? orders : [...this.data.serviceOrders, ...orders];
          // 添加状态文本
          newOrders.forEach(order => {
            order.statusText = this.getOrderStatusText(order.status, 'SERVICE');
          });
          this.setData({ serviceOrders: newOrders, hasMoreOrders: orderPageNum * orderPageSize < total });
        }
      }
      
      this.setData({ loadingOrders: false });
    } catch (error) {
      console.error('loadOrders 出错:', error);
      this.setData({ loadingOrders: false });
    }
  },

  // 获取订单状态文本
  getOrderStatusText(status, orderType) {
    const statusMap = {
        // 通用状态
        0: '待付款',
        1: '待发货',    // 商城订单待发货
        2: '已发货',    // 商城订单已发货
        3: '已完成',
        4: '已取消',
        
        // 服务订单状态
        10: '待确认',
        11: '待服务',
        12: '服务中',
        13: '已完成',
        14: '已取消',
        15: '退款申请中',
        16: '已退款'
    };
    return statusMap[status] || '未知';
  },

  loadMoreOrders() {
    if (!this.data.hasMoreOrders || this.data.loadingOrders) return;
    this.setData({ orderPageNum: this.data.orderPageNum + 1 });
    this.loadOrders();
  },

  // ========== 付款 ==========
  async payOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const orderType = e.currentTarget.dataset.type;
    
    console.log('准备付款, 订单ID:', orderId);
    
    wx.showModal({
        title: '确认付款',
        content: '确定要支付吗？',
        success: async (res) => {
            if (res.confirm) {
                console.log('用户确认付款');
                wx.showLoading({ title: '支付中...' });
                try {
                    const result = await api.payServiceOrder(orderId);
                    console.log('付款结果:', result);
                    wx.hideLoading();
                    if (result.code === 200) {
                        wx.showToast({ title: '支付成功', icon: 'success' });
                        this.loadOrders(true);
                    } else {
                        wx.showToast({ title: result.message || '支付失败', icon: 'none' });
                    }
                } catch (error) {
                    console.error('付款错误:', error);
                    wx.hideLoading();
                    wx.showToast({ title: '支付失败', icon: 'none' });
                }
            }
        }
    });
},

// ========== 取消订单 ==========
async cancelOrder(e) {
  console.log('=== cancelOrder 被调用 ===');
  const orderId = e.currentTarget.dataset.id;
  console.log('订单ID:', orderId);
  
  const res = await wx.showModal({ title: '提示', content: '确定要取消该订单吗？' });
  if (!res.confirm) return;
  
  wx.showLoading({ title: '取消中...' });
  try {
      console.log('调用取消接口...');
      const result = await api.cancelServiceOrder(orderId);
      console.log('取消结果:', result);
      wx.hideLoading();
      if (result.code === 200) {
          wx.showToast({ title: '已取消', icon: 'success' });
          this.loadOrders(true);
      } else {
          wx.showToast({ title: result.message || '取消失败', icon: 'none' });
      }
  } catch (error) {
      console.error('取消错误:', error);
      wx.hideLoading();
      wx.showToast({ title: '取消失败', icon: 'none' });
  }
},

// 显示订单详情弹窗
showOrderDetail(e) {
  const order = e.currentTarget.dataset.order;
  console.log('订单详情:', order);
  
  // 格式化时间
  const formatTime = (time) => {
      if (!time) return '-';
      const date = new Date(time);
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };
  
  // 获取订单状态文本
  const getStatusText = (status, orderType) => {
      const statusMap = {
          0: '待付款', 1: '待发货', 2: '已发货', 3: '已完成', 4: '已取消',
          10: '待确认', 11: '待服务', 12: '服务中', 13: '已完成', 14: '已取消',
          15: '退款申请中', 16: '已退款'
      };
      return statusMap[status] || '未知';
  };
  
  const orderDetail = {
      ...order,
      createTime: formatTime(order.createTime),
      payTime: formatTime(order.payTime),
      serviceTime: formatTime(order.serviceTime),
      statusText: getStatusText(order.status, order.orderType)
  };
  
  this.setData({
      showOrderDetailModal: true,
      orderDetail: orderDetail
  });
},

// 隐藏订单详情弹窗
hideOrderDetailModal() {
  this.setData({ showOrderDetailModal: false });
},

  // ========== 页面跳转 ==========
  goToOrderDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  goToReview(e) {
    wx.navigateTo({ url: `/pages/5/8my-review/review?orderId=${e.currentTarget.dataset.id}` });
  },

  goToMessage() {
    wx.showToast({ title: '服务', icon: 'none' });
  },

  // ========== 跳转商城订单 ==========
  goToShopOrders() {
    // 方法1：直接切换到订单标签并显示商城订单
    this.setData({ 
      currentMainTab: 'order',
      currentOrderTab: 'mall',
      orderPageNum: 1,
      hasMoreOrders: true
    });
    this.loadOrders(true);
    
    // 可选：添加一个小的动画提示
    wx.showToast({ title: '商城订单', icon: 'success', duration: 1000 });
  },

  // ========== 分享 ==========
  onShareAppMessage() {
    return { title: '宠物服务预约', path: '/pages/3/1services/services' };
  }
});