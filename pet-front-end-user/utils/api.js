// utils/api.js
const app = getApp();

// 请求基础配置
const request = (url, method, data, header = {}) => {
  const token = wx.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          wx.showToast({ title: '请先登录', icon: 'none' });
          reject(res);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
};

// API 接口
const api = {
  
  // ========== 用户相关 ==========
  login: (data) => request('/api/user/login', 'POST', data),
  getUserInfo: () => request('/api/user/info', 'GET'),
  updateUserInfo: (data) => request('/api/user/update', 'PUT', data),
  
  // ========== 宠物相关（增删改查）==========
  // 获取宠物列表
  getPetList: () => request('/api/pet/list', 'GET'),
  // 获取宠物详情
  getPetDetail: (id) => request(`/api/pet/detail/${id}`, 'GET'),
  // 添加宠物
  addPet: (data) => request('/api/pet/add', 'POST', data),
  // 修改宠物
  updatePet: (data) => request('/api/pet/update', 'PUT', data),
  // 删除宠物
  deletePet: (id) => request(`/api/pet/delete/${id}`, 'DELETE'),
  
  // ========== 商品相关 ==========
  getProductList: (params) => request('/api/product/list', 'GET', params),
  getProductDetail: (id) => request(`/api/product/detail/${id}`, 'GET'),
  searchProducts: (keyword) => request(`/api/product/search?keyword=${keyword}`, 'GET'),
  // ========== 分类相关 ==========
    getCategories: () => request('/api/category/list', 'GET'),
    getCategoriesByPetType: (petType) => request(`/api/category/petType/${petType}`, 'GET'),
      

  // ========== 服务相关 ==========
  getServiceList: (params) => request('/api/service/list', 'GET', params),
  getServiceDetail: (id) => request(`/api/service/detail/${id}`, 'GET'),
  getServicesByCategory: (categoryId) => request(`/api/service/category/${categoryId}`, 'GET'),
  
  // ========== 服务订单相关 ==========
  // 获取服务订单列表
  getServiceOrders: (params) => request('/api/service/order/list', 'GET', params),
  // 创建服务订单
  createServiceOrder: (data) => request('/api/service/order/create', 'POST', data),
  // 取消服务订单
  cancelServiceOrder: (orderId) => request(`/api/service/order/cancel/${orderId}`, 'PUT'),
  // 服务订单付款
  payServiceOrder: (orderId) => {
    return request('/api/service/order/pay/' + orderId, 'POST');
  },
  // 服务订单退款
  serviceRefund: (orderId, reason) => {
    return request(`/admin/orders/service/${orderId}/refund`, {
        method: 'POST',
        body: { reason }
    });
  },
  
  // ========== 商城订单相关 ==========
  // 获取商城订单列表
  getShopOrders: (params) => request('/api/product/order/list', 'GET', params),
  // 创建商城订单
  createShopOrder: (data) => request('/api/product/order/create', 'POST', data),
  // 取消商城订单
  cancelShopOrder: (orderId) => request(`/api/product/order/cancel/${orderId}`, 'PUT'),
  // 商城订单付款  
  payProductOrder: (orderId) => {
    return request('/api/product/order/pay/' + orderId, 'POST');
  },
  // 商城订单退款
  productRefund: (orderId, reason) => {
    return request(`/admin/orders/product/${orderId}/refund`, {
        method: 'POST',
        body: { reason }
    });
  },
  // 确认收货
  confirmReceipt: (orderId) => request(`/api/product/order/confirm/${orderId}`, 'PUT'),
  
  // ========== 订单通用 ==========
  // 获取订单列表（统一接口）
  getOrderList: (params) => request('/api/order/list', 'GET', params),
  // 获取订单详情
  getOrderDetail: (id, type) => request(`/api/order/detail/${id}?type=${type}`, 'GET'),
  // 更新订单状态
  updateOrderStatus: (orderId, status) => request(`/api/order/status/${orderId}`, 'PUT', { status }),
  
  // ========== 门店相关 ==========
  getStoreList: () => request('/api/store/list', 'GET'),
  
  // ========== 统计数据 ==========
  getStatistics: () => request('/api/statistics', 'GET'),
};

module.exports = api;