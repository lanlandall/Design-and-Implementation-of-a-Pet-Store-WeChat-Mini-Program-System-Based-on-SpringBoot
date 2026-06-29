// pages/2/1shop/shop.js
const api = require('../../../utils/api.js');
const app = getApp();

Page({
  data: {
    // 宠物类型：1-狗，2-猫
    petType: 1,

    searchKeyword: '',
    
    // 当前选中的分类ID和名称
    currentCategoryId: 0,
    currentCategoryName: '综合',
    
    // 分类列表
    dogCategoryList: [],
    catCategoryList: [],
    allCategories: [],
    
    // 商品数据
    goodsList: [],
    
    // UI状态
    loading: false,
    loadingMore: false,
    hasMore: true,
    pageNum: 1,
    pageSize: 10,
    totalCount: 0,

    // 购买弹窗
    showBuyModal: false,
    buyProduct: null,
    quantity: 1,
    totalPrice: 0,
    
    // 地址相关
    showAddressModal: false,
    showAddAddressModal: false,
    addressList: [],
    selectedAddress: null,
    newAddress: { name: '', phone: '', address: '' },
    
    // 默认图片
    defaultImageUrl: 'https://via.placeholder.com/400x400?text=No+Image',
    emptyImageUrl: 'https://via.placeholder.com/400x300?text=暂无数据'
  },

  onLoad(options) {
    if (options.petType) {
      this.setData({ petType: parseInt(options.petType) });
    }
    this.loadAddressList();
    this.initPage();
  },

  onShow() {
    if (this.data.allCategories.length > 0) {
      this.refreshData();
    }
    this.loadAddressList();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    // 防抖搜索
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
        this.searchGoods();
    }, 500);
  },
  // 点击搜索确认
  onSearchConfirm() {
    this.searchGoods();
  },
  // 点击搜索框（聚焦）
  onSearchFocus() {
    // 可以不做额外处理
  },
  // 执行搜索
  searchGoods() {
    this.setData({ pageNum: 1, hasMore: true, goodsList: [] });
    this.loadGoods(true);
  },

  // ========== 地址管理 ==========
  loadAddressList() {
    const addressList = wx.getStorageSync('addressList') || [
      { id: 1, name: '默认地址', phone: '138****0000', address: '杭州市西湖区' }
    ];
    const selectedAddressId = wx.getStorageSync('selectedAddressId') || 1;
    const selectedAddress = addressList.find(a => a.id === selectedAddressId) || addressList[0];
    
    this.setData({ addressList, selectedAddress });
  },

  showAddressSelector() {
    this.setData({ showAddressModal: true });
  },

  hideAddressModal() {
    this.setData({ showAddressModal: false });
  },

  selectAddress(e) {
    const { id } = e.currentTarget.dataset;
    const address = this.data.addressList.find(a => a.id === id);
    
    this.setData({ 
      selectedAddress: address,
      showAddressModal: false 
    });
    
    wx.setStorageSync('selectedAddressId', id);
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
      this.setData({ selectedAddress });
      wx.setStorageSync('selectedAddressId', selectedAddress?.id || null);
    }
    
    this.setData({ addressList });
    wx.setStorageSync('addressList', addressList);
    wx.showToast({ title: '已删除', icon: 'success' });
  },

  // ========== 初始化 ==========
  async initPage() {
    this.setData({ loading: true });
    try {
      await this.loadCategories();
      await this.loadGoods(true);
    } catch (error) {
      console.error('初始化失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshData() {
    try {
      await this.loadGoods(true);
    } catch (error) {
      console.error('刷新失败:', error);
    }
  },

  // ========== 分类 ==========
  loadCategories() {
    return new Promise((resolve) => {
      const petType = this.data.petType;
      
      wx.request({
        url: `${app.globalData.apiBaseUrl}/api/category/petType/${petType}`,
        method: 'GET',
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            let categories = res.data.data || [];
            const categoryList = categories.map(cat => ({ id: cat.id, name: cat.name }));
            const fullCategoryList = [{ id: 0, name: '综合' }, ...categoryList];
            
            if (this.data.petType === 1) {
              this.setData({ dogCategoryList: fullCategoryList });
            } else {
              this.setData({ catCategoryList: fullCategoryList });
            }
            
            this.setData({ currentCategoryId: 0, currentCategoryName: '综合' });
          } else {
            this.useDefaultCategories();
          }
          resolve();
        },
        fail: () => {
          this.useDefaultCategories();
          resolve();
        }
      });
    });
  },

  useDefaultCategories() {
    const dogCategories = [
      { id: 0, name: '综合' }, { id: 1, name: '狗粮' }, { id: 2, name: '零食' },
      { id: 3, name: '玩具' }, { id: 4, name: '用品' }, { id: 5, name: '药品' }, { id: 6, name: '保健品' }
    ];
    const catCategories = [
      { id: 0, name: '综合' }, { id: 7, name: '猫粮' }, { id: 8, name: '零食' },
      { id: 9, name: '玩具' }, { id: 10, name: '用品' }, { id: 11, name: '药品' }, { id: 12, name: '保健品' }
    ];
    this.setData({ dogCategoryList: dogCategories, catCategoryList: catCategories });
  },

 // 跳转到商城订单列表
  goToShopOrders() {
    wx.switchTab({
      url: '/pages/3/1services/services'
    });
    
    // 跳转后设置当前标签
    setTimeout(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage) {
        currentPage.setData({ 
          currentMainTab: 'order',
          currentOrderTab: 'mall'
        });
        currentPage.loadOrders(true);
      }
    }, 100);
  },

  // ========== 商品 ==========
  loadGoods(reset = false) {
    return new Promise((resolve) => {
      if (reset) {
        this.setData({ pageNum: 1, hasMore: true, goodsList: [], loadingMore: false });
      }
      if (!this.data.hasMore && !reset) { resolve(); return; }
      
      const { pageNum, pageSize, petType, currentCategoryId, searchKeyword } = this.data;
      const params = { pageNum, pageSize, petType };
      if (currentCategoryId !== 0) params.categoryId = currentCategoryId;
      if (searchKeyword && searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }
      
      if (!reset) this.setData({ loadingMore: true });
      
      const token = wx.getStorageSync('token') || '';
      
      wx.request({
        url: `${app.globalData.apiBaseUrl}/api/product/list`,
        method: 'GET',
        data: params,
        timeout: 10000,
        header: { 'Authorization': token ? `Bearer ${token}` : '' },
        success: (res) => {
          const { goodsList, total } = this.parseGoodsResponse(res);
          const newGoodsList = reset ? goodsList : [...this.data.goodsList, ...goodsList];
          
          this.setData({
            goodsList: newGoodsList,
            hasMore: newGoodsList.length < total,
            totalCount: total,
            pageNum: pageNum + 1,
            loadingMore: false
          });
          
          if (reset && goodsList.length === 0) {
            const keyword = this.data.searchKeyword;
            if (keyword && keyword.trim()) {
              wx.showToast({ title: '未找到相关商品', icon: 'none' });
            } else {
              wx.showToast({ title: currentCategoryId === 0 ? '暂无商品' : `暂无${this.data.currentCategoryName}商品`, icon: 'none' });
            }
          }
          resolve();
        },
        fail: () => {
          this.setData({ loadingMore: false });
          if (reset && this.data.goodsList.length === 0) {
            wx.showToast({ title: '网络错误，请下拉重试', icon: 'none' });
          }
          resolve();
        }
      });
    });
  },

  parseGoodsResponse(res) {
    let goodsList = [], total = 0;
    
    // console.log('=== 商品API响应调试 ===');
    // console.log('HTTP状态码:', res.statusCode);
    // console.log('响应数据:', JSON.stringify(res.data));
    
    try {
        if (res.statusCode === 200) {
            const data = res.data;
            
            // 处理不同的响应格式
            if (data.code === 200 && data.data) {
                // 格式1: { code: 200, data: { list: [], total: 0 } }
                if (data.data.list) {
                    goodsList = data.data.list;
                    total = data.data.total || 0;
                }
                // 格式2: { code: 200, data: { records: [], total: 0 } }
                else if (data.data.records) {
                    goodsList = data.data.records;
                    total = data.data.total || 0;
                }
                // 格式3: { code: 200, data: [] }
                else if (Array.isArray(data.data)) {
                    goodsList = data.data;
                    total = data.data.length;
                }
            } 
            // 格式4: 直接返回数组
            else if (Array.isArray(data)) {
                goodsList = data;
                total = data.length;
            }
            
            // console.log('解析到的商品数量:', goodsList.length);
            
            // 处理每个商品
            goodsList = goodsList.map((item, index) => {
                // 打印原始商品数据
                // console.log(`原始商品${index+1}:`, JSON.stringify(item));
                
                // 获取图片URL（按优先级）
                let imageUrl = '';
                if (item.image_url) imageUrl = item.image_url;
                else if (item.imageUrl) imageUrl = item.imageUrl;
                else if (item.image) imageUrl = item.image;
                else if (item.pic_url) imageUrl = item.pic_url;
                else if (item.cover) imageUrl = item.cover;
                
                // console.log(`商品${index+1} "${item.name}" 的图片字段:`, imageUrl);
                
                // 处理相对路径
                if (imageUrl && !imageUrl.startsWith('http')) {
                    // 如果是相对路径，拼接服务器地址
                    const baseUrl = app.globalData.apiBaseUrl;
                    imageUrl = baseUrl.replace(/\/$/, '') + '/' + imageUrl.replace(/^\//, '');
                    // console.log(`转换为完整URL:`, imageUrl);
                }
                
                // 如果没有图片，使用默认图
                if (!imageUrl) {
                    // console.warn(`商品${index+1} "${item.name}" 没有图片URL，使用默认图`);
                    imageUrl = this.data.defaultImageUrl;
                }
                
                // 测试：临时替换为测试图片（确保能显示）
                // imageUrl = 'https://picsum.photos/400/400?random=' + item.id;
                
                return {
                    id: item.id,
                    name: item.name || '商品',
                    price: parseFloat(item.price) || 0,
                    originalPrice: parseFloat(item.original_price) || parseFloat(item.price) || 0,
                    image: imageUrl,
                    sales: item.sales || 0,
                    petType: item.pet_type,
                    categoryId: item.category_id,
                    stock: item.stock || 0
                };
            });
            
            // console.log('最终商品列表:', goodsList);
        } else {
            // console.error('API返回错误:', res.statusCode, res.data);
        }
    } catch (err) {
        // console.error('解析商品数据失败:', err);
    }
    
    return { goodsList, total };
},

  // ========== 切换 ==========
  async switchToDog() {
    if (this.data.petType === 1) return;
    this.setData({ petType: 1, currentCategoryId: 0, currentCategoryName: '综合', pageNum: 1, hasMore: true, goodsList: [] });
    await this.loadCategories();
    await this.loadGoods(true);
  },

  async switchToCat() {
    if (this.data.petType === 2) return;
    this.setData({ petType: 2, currentCategoryId: 0, currentCategoryName: '综合', pageNum: 1, hasMore: true, goodsList: [] });
    await this.loadCategories();
    await this.loadGoods(true);
  },

  onComprehensive() {
    if (this.data.currentCategoryId === 0) return;
    this.setData({ currentCategoryId: 0, currentCategoryName: '综合', pageNum: 1, hasMore: true, goodsList: [] });
    this.loadGoods(true);
  },

  onCategoryTap(e) {
    const { id, name } = e.currentTarget.dataset;
    if (id === undefined || this.data.currentCategoryId === id) return;
    this.setData({ currentCategoryId: id, currentCategoryName: name || '分类', pageNum: 1, hasMore: true, goodsList: [] });
    this.loadGoods(true);
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== undefined) this.setData({ [`goodsList[${index}].image`]: this.data.defaultImageUrl });
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (id) wx.navigateTo({ url: `/pages/goods/detail/detail?id=${id}` });
  },

  loadMore() {
    if (!this.data.loadingMore && this.data.hasMore) this.loadGoods(false);
  },

  async onPullDownRefresh() {
    await this.loadCategories();
    await this.loadGoods(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() { this.loadMore(); },

  // ========== 购买 ==========
  buyNow(e) {
    const { id } = e.currentTarget.dataset;
    const token = wx.getStorageSync('token');
    
    if (!token) {
      wx.showModal({ title: '提示', content: '请先登录', success: (res) => { if (res.confirm) wx.navigateTo({ url: '/pages/0/0login/login' }); } });
      return;
    }
    
    const product = this.data.goodsList.find(item => item.id == id);
    this.setData({ showBuyModal: true, buyProduct: product, quantity: 1, totalPrice: product.price });
  },

  hideBuyModal() { this.setData({ showBuyModal: false }); },
  stopPropagation() {},

  decreaseQuantity() {
    if (this.data.quantity <= 1) return;
    const q = this.data.quantity - 1;
    this.setData({ quantity: q, totalPrice: this.data.buyProduct.price * q });
  },

  increaseQuantity() {
    const product = this.data.buyProduct;
    if (this.data.quantity >= (product.stock || 999)) { wx.showToast({ title: '库存不足', icon: 'none' }); return; }
    const q = this.data.quantity + 1;
    this.setData({ quantity: q, totalPrice: product.price * q });
  },

  async confirmBuy() {
    console.log('=== confirmBuy 开始 ===');
    const { buyProduct, quantity, selectedAddress } = this.data;
    
    if (!selectedAddress) {
        wx.showToast({ title: '请选择收货地址', icon: 'none' });
        return;
    }
    
    wx.showLoading({ title: '创建订单中...' });
    
    try {
        // 创建订单
        const createRes = await api.createShopOrder({
            productId: buyProduct.id,
            quantity: quantity,
            receiverName: selectedAddress.name,
            receiverPhone: selectedAddress.phone,
            receiverAddress: selectedAddress.address
        });
        
        if (createRes.code !== 200) {
            wx.hideLoading();
            wx.showToast({ title: createRes.message || '创建失败', icon: 'none' });
            return;
        }
        
        const orderId = createRes.data.id;
        
        // 付款
        const payRes = await api.payProductOrder(orderId);
        wx.hideLoading();
        
        if (payRes.code === 200) {
            wx.showToast({ title: '购买成功', icon: 'success' });
            this.setData({ showBuyModal: false });
            // 修改这里：loadGoodsList 改为 loadGoods(true)
            this.loadGoods(true);
        } else {
            wx.showToast({ title: payRes.message || '支付失败', icon: 'none' });
        }
    } catch (error) {
        console.error('错误:', error);
        wx.hideLoading();
        wx.showToast({ title: '操作失败', icon: 'none' });
    }
},

  onShareAppMessage() {
    const title = this.data.petType === 1 ? '汪星人用品商城' : '喵星人用品商城';
    return { title, path: `/pages/2/1shop/shop?petType=${this.data.petType}`, imageUrl: '/images/share-shop.png' };
  },

  onShareTimeline() {
    return { title: '宠物商城 - 萌宠用品一站购', query: `petType=${this.data.petType}` };
  }
});