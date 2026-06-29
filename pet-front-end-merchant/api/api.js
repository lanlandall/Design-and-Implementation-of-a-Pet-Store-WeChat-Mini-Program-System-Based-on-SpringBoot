// api/api.js
const API_BASE_URL = 'http://localhost:8080/api';

// 定义 request 函数（必须在所有API调用之前）
async function request(url, options = {}) {
    const token = localStorage.getItem('adminToken');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const data = await response.json();
        
        if (data.code === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            window.location.href = 'login.html';
        }
        
        return data;
    } catch (error) {
        console.error('请求失败:', error);
        return { code: 500, message: '网络错误' };
    }
}

const API = {
    // ========== 管理员登录 ==========
    adminLogin: async (account, password) => {
        return request('/admin/login', {
            method: 'POST',
            body: { account, password }
        });
    },
    // ========== 管理员登出 ==========
    adminLogout: async () => {
        return request('/admin/logout', {
            method: 'POST'
        });
    },
    
    // ========== 用户管理 ==========
    getUsers: async (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/users?${query}`);
    },
    getUserById: async (id) => {
        return request(`/admin/users/${id}`);
    },
    createUser: async (data) => {
        return request('/admin/users', {
            method: 'POST',
            body: data
        });
    },
    updateUser: async (id, data) => {
        return request(`/admin/users/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    updateUserStatus: async (id, status) => {
        return request(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: { status }
        });
    },
    deleteUser: async (id) => {
        return request(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    },
    
    // ========== 宠物管理 ==========
    getPets: async (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/pets?${query}`);
    },
    getUserPets: async (userId) => {
        return request(`/admin/users/${userId}/pets`);
    },
    getPetById: async (id) => {
        return request(`/admin/pets/${id}`);
    },
    createPet: async (data) => {
        return request('/admin/pets', {
            method: 'POST',
            body: data
        });
    },
    updatePet: async (id, data) => {
        return request(`/admin/pets/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    updatePetStatus: async (id, status) => {
        return request(`/admin/pets/${id}/status`, {
            method: 'PUT',
            body: { status }
        });
    },
    deletePet: async (id) => {
        return request(`/admin/pets/${id}`, {
            method: 'DELETE'
        });
    },
    
    // ========== 商品管理 ==========
    getProducts: async (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/products?${query}`);
    },
    getProductById: async (id) => {
        return request(`/admin/products/${id}`);
    },
    createProduct: async (data) => {
        return request('/admin/products', {
            method: 'POST',
            body: data
        });
    },
    updateProduct: async (id, data) => {
        return request(`/admin/products/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    updateProductStatus: async (id, status) => {
        return request(`/admin/products/${id}/status`, {
            method: 'PUT',
            body: { status }
        });
    },
    updateProductStock: async (id, stock) => {
        return request(`/admin/products/${id}/stock`, {
            method: 'PUT',
            body: { stock }
        });
    },
    deleteProduct: async (id) => {
        return request(`/admin/products/${id}`, {
            method: 'DELETE'
        });
    },
    
    // ========== 服务管理 ==========
    getServices: async (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/services?${query}`);
    },
    getServiceById: async (id) => {
        return request(`/admin/services/${id}`);
    },
    createService: async (data) => {
        return request('/admin/services', {
            method: 'POST',
            body: data
        });
    },
    updateService: async (id, data) => {
        return request(`/admin/services/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    updateServiceStatus: async (id, status) => {
        return request(`/admin/services/${id}/status`, {
            method: 'PUT',
            body: { status }
        });
    },
    deleteService: async (id) => {
        return request(`/admin/services/${id}`, {
            method: 'DELETE'
        });
    },
    
    // ========== 订单管理 ==========
    getOrders: async (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/orders?${query}`);
    },
    getOrderDetail: async (id) => {
        return request(`/admin/orders/${id}`);
    },
    
    // ========== 商城订单操作 ==========
    // 商城订单付款
    payProductOrder: (orderId) => {
        return request('/product/order/pay/' + orderId, 'POST');
    },
    shipProductOrder: async (id) => {
        return request(`/admin/orders/product/${id}/ship`, {
            method: 'PUT'
        });
    },
    completeProductOrder: async (id) => {
        return request(`/admin/orders/product/${id}/complete`, {
            method: 'PUT'
        });
    },
    // 取消商城订单
cancelProductOrder: (orderId) => {
    return request('/product/order/cancel/' + orderId, 'PUT');
  },
    // 商城订单退款（商家直接退款）
    productRefund: async (orderId, reason) => {
        return request(`/admin/orders/product/${orderId}/refund`, {
            method: 'POST',
            body: { reason }
        });
    },

    // ========== 服务订单操作 ==========
    // 商家确认订单（待确认10 → 待付款0）
    confirmOrder: async (id) => {
        return request(`/admin/orders/service/${id}/confirm-order`, {
            method: 'PUT'
        });
    },
    // 服务订单付款
    payServiceOrder: (orderId) => {
        return request('/service/order/pay/' + orderId, 'POST');
    },
    // 商家开始服务（待服务11 → 服务中12）
    startService: async (id) => {
        return request(`/admin/orders/service/${id}/start`, {
            method: 'PUT'
        });
    },
    // 商家完成服务（服务中12 → 已完成13）
    completeService: async (id) => {
        return request(`/admin/orders/service/${id}/complete`, {
            method: 'PUT'
        });
    },
    // 取消服务订单
    cancelServiceOrder: async (id, reason) => {
        return request(`/admin/orders/service/${id}/cancel`, {
            method: 'PUT',
            body: { reason }
        });
    },
    // 服务订单退款（商家直接退款）
    serviceRefund: async (orderId, reason) => {
        return request(`/orders/service/${orderId}/refund`, {
            method: 'POST',
            body: { reason }
        });
    },
    // 用户申请退款
    applyRefund: async (orderId, reason) => {
        return request(`/orders/service/${orderId}/refund/apply`, {
            method: 'POST',
            body: { reason }
        });
    },
    // 商家同意退款
    agreeRefund: async (orderId) => {
        return request(`/orders/service/${orderId}/refund/agree`, {
            method: 'PUT'
        });
    },
    // 商家拒绝退款
    rejectRefund: async (orderId, reason) => {
        return request(`/orders/service/${orderId}/refund/reject`, {
            method: 'POST',
            body: { reason }
        });
    },
    
    // ========== 今日订单 ==========
    getTodayOrders: async () => {
        return request('/admin/orders/today');
    },
    
    // ========== 分类管理 ==========
    getCategoryPage: (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/category/page?${query}`);
    },
    getAllCategories: () => request('/admin/category/all', 'GET'),
    addCategory: (data) => request('/admin/category', 'POST', data),
    updateCategory: (id, data) => request(`/admin/category/${id}`, 'PUT', data),
    deleteCategory: (id) => request(`/admin/category/${id}`, 'DELETE'),
    
    // ========== 统计数据 ==========
    getStatistics: async () => {
        return request('/admin/statistics');
    }
};