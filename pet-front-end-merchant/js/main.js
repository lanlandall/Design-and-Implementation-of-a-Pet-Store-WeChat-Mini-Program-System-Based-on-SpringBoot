// js/main.js - 完整整合版
let currentTab = 'users';
let currentUserPage = 1, currentPetPage = 1, currentProductPage = 1, currentServicePage = 1, currentOrderPage = 1;
let expandedUsers = new Set();
let currentAddPetUserId = null;
let editingItem = null;
let editingType = null;
let isAddMode = false;

// 默认头像 base64 (防止图片加载失败无限循环)
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 24 24\' fill=\'%23999\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/%3E%3C/svg%3E';

// 全局图片错误处理 (只执行一次，防止无限循环)
window.handleImageError = function(img) {
    if (img.hasAttribute('data-error-handled')) return;
    img.setAttribute('data-error-handled', 'true');
    img.onerror = null;
    img.src = DEFAULT_AVATAR;
};

// 商品分类映射
const CATEGORY_MAP = {
    1: '狗狗主粮', 2: '狗狗零食', 3: '驱虫清洁', 4: '营养保健',
    5: '家居出行', 6: '常备药品', 7: '玩具', 8: '服饰',
    9: '猫咪主粮', 10: '猫咪零食', 11: '保健护理', 12: '生活用品',
    13: '常备药品', 14: '玩具', 15: '服饰'
};

// 服务分类映射
const SERVICE_CATEGORY_MAP = {
    1: '推荐套餐', 2: '限时折扣', 3: '基础护理',
    4: '上门铲屎', 5: '宠物寄养', 6: '专车运送'
};

// 订单状态映射
const ORDER_STATUS_MAP = {
    // 通用状态
    0: '待付款',
    3: '已完成',
    4: '已取消',
    5: '退款中',
    6: '已退款',
    
    // 商城订单状态
    1: '待发货',
    2: '已发货',
    
    // 服务订单状态
    10: '待确认',      // 用户下单，等待商家确认
    11: '待服务',      // 用户已付款，等待服务
    12: '服务中',      // 服务进行中
    13: '已完成',
    14: '已取消',
    15: '退款申请中',
    16: '已退款',
    17: '退款拒绝'
};

// 获取订单状态样式
function getOrderStatusClass(status) {
    // 已完成或已退款用绿色
    if (status === 3 || status === 13 || status === 16) return 'status-on';
    // 已取消用灰色
    if (status === 4 || status === 14) return 'status-off';
    // 退款中用橙色
    if (status === 5 || status === 15) return 'status-refund';
    // 待确认用蓝色
    if (status === 10) return 'status-pending';
    // 其他用黄色
    return 'status-pending';
}

// 获取订单状态文本
function getOrderStatusText(status) {
    return ORDER_STATUS_MAP[status] || '未知';
}

// 时间格式化（包含时分秒）
function formatDateTime(d) {
    if (!d) return '-';
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    } catch(e) {
        return d;
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initNavigation();
    bindEvents();
    loadUsers();
    loadPets();
    loadProducts();
    loadServices();
    loadOrders();
    loadAdminName();
    initUploadEvents();
});

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) window.location.href = 'login.html';
}

function loadAdminName() {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
        try {
            const info = JSON.parse(adminInfo);
            const adminNameSpan = document.getElementById('adminName');
            if (adminNameSpan) adminNameSpan.textContent = info.username || '商家管理员';
        } catch(e) {}
    }
}

// ========== 导航 ==========
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(`${tab}Page`);
            if (targetPage) targetPage.classList.add('active');
            
            const titles = { users: '用户管理', pets: '宠物管理', products: '商品管理', services: '服务管理', orders: '订单管理' };
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) pageTitle.textContent = titles[tab];
            
            const addBtn = document.getElementById('addBtn');
            if (addBtn) {
                if (tab === 'users') {
                    addBtn.style.display = 'inline-flex';
                    addBtn.textContent = '+ 新增用户';
                    addBtn.onclick = () => openAddUserModal();
                } else if (tab === 'products') {
                    addBtn.style.display = 'inline-flex';
                    addBtn.textContent = '+ 新增商品';
                    addBtn.onclick = () => openAddProductModal();
                } else if (tab === 'services') {
                    addBtn.style.display = 'inline-flex';
                    addBtn.textContent = '+ 新增服务';
                    addBtn.onclick = () => openAddServiceModal();
                } else {
                    addBtn.style.display = 'none';
                }
            }
            
            currentTab = tab;
            if (tab === 'users') loadUsers();
            else if (tab === 'pets') loadPets();
            else if (tab === 'products') loadProducts();
            else if (tab === 'services') loadServices();
            else if (tab === 'orders') loadOrders();
        });
    });
}

function bindEvents() {
    // 用户筛选
    const resetUserFilter = document.getElementById('resetUserFilter');
    if (resetUserFilter) resetUserFilter.addEventListener('click', () => { 
        const userSearch = document.getElementById('userSearch');
        if (userSearch) userSearch.value = ''; 
        loadUsers(1); 
    });
    const userSearch = document.getElementById('userSearch');
    if (userSearch) userSearch.addEventListener('input', debounce(() => loadUsers(1), 300));
    
    // 宠物筛选
    const resetPetFilter = document.getElementById('resetPetFilter');
    if (resetPetFilter) resetPetFilter.addEventListener('click', () => { 
        const petSearch = document.getElementById('petSearch');
        const petTypeFilter = document.getElementById('petTypeFilter');
        if (petSearch) petSearch.value = ''; 
        if (petTypeFilter) petTypeFilter.value = ''; 
        loadPets(1); 
    });
    const petSearch = document.getElementById('petSearch');
    if (petSearch) petSearch.addEventListener('input', debounce(() => loadPets(1), 300));
    const petTypeFilter = document.getElementById('petTypeFilter');
    if (petTypeFilter) petTypeFilter.addEventListener('change', () => loadPets(1));
    
    // 商品筛选
    const resetProductFilter = document.getElementById('resetProductFilter');
    if (resetProductFilter) resetProductFilter.addEventListener('click', () => { 
        const productSearch = document.getElementById('productSearch');
        const productCategory = document.getElementById('productCategory');
        const productStatus = document.getElementById('productStatus');
        if (productSearch) productSearch.value = ''; 
        if (productCategory) productCategory.value = ''; 
        if (productStatus) productStatus.value = ''; 
        loadProducts(1); 
    });
    const productSearch = document.getElementById('productSearch');
    if (productSearch) productSearch.addEventListener('input', debounce(() => loadProducts(1), 300));
    const productCategory = document.getElementById('productCategory');
    if (productCategory) productCategory.addEventListener('change', () => loadProducts(1));
    const productStatus = document.getElementById('productStatus');
    if (productStatus) productStatus.addEventListener('change', () => loadProducts(1));
    
    // 服务筛选
    const resetServiceFilter = document.getElementById('resetServiceFilter');
    if (resetServiceFilter) resetServiceFilter.addEventListener('click', () => { 
        const serviceSearch = document.getElementById('serviceSearch');
        const serviceCategory = document.getElementById('serviceCategory');
        const serviceStatus = document.getElementById('serviceStatus');
        if (serviceSearch) serviceSearch.value = ''; 
        if (serviceCategory) serviceCategory.value = ''; 
        if (serviceStatus) serviceStatus.value = ''; 
        loadServices(1); 
    });
    const serviceSearch = document.getElementById('serviceSearch');
    if (serviceSearch) serviceSearch.addEventListener('input', debounce(() => loadServices(1), 300));
    const serviceCategory = document.getElementById('serviceCategory');
    if (serviceCategory) serviceCategory.addEventListener('change', () => loadServices(1));
    const serviceStatus = document.getElementById('serviceStatus');
    if (serviceStatus) serviceStatus.addEventListener('change', () => loadServices(1));
    
    // 订单筛选
    const resetOrderFilter = document.getElementById('resetOrderFilter');
    if (resetOrderFilter) resetOrderFilter.addEventListener('click', () => { 
        const orderSearch = document.getElementById('orderSearch');
        const orderType = document.getElementById('orderType');
        const orderStatus = document.getElementById('orderStatus');
        if (orderSearch) orderSearch.value = ''; 
        if (orderType) orderType.value = ''; 
        if (orderStatus) orderStatus.value = ''; 
        loadOrders(1); 
    });
    const orderSearch = document.getElementById('orderSearch');
    if (orderSearch) orderSearch.addEventListener('input', debounce(() => loadOrders(1), 300));
    const orderType = document.getElementById('orderType');
    if (orderType) orderType.addEventListener('change', () => loadOrders(1));
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) orderStatus.addEventListener('change', () => loadOrders(1));
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { 
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            window.location.href = 'login.html';
        }
    });
    
    // 弹窗关闭事件
    const closeModalBtn = document.querySelector('#editModal .close');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeEditModal);
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveItem);
    
    const closeOrderBtn = document.querySelector('#orderModal .close');
    if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeOrderModal);
    
    const closeUserModalBtn = document.getElementById('closeUserModal');
    if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', closeUserModal);
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    if (cancelUserBtn) cancelUserBtn.addEventListener('click', closeUserModal);
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) saveUserBtn.addEventListener('click', saveUser);
    
    const closePetModalBtn = document.getElementById('closePetModal');
    if (closePetModalBtn) closePetModalBtn.addEventListener('click', closePetModal);
    const cancelPetBtn = document.getElementById('cancelPetBtn');
    if (cancelPetBtn) cancelPetBtn.addEventListener('click', closePetModal);
    const savePetBtn = document.getElementById('savePetBtn');
    if (savePetBtn) savePetBtn.addEventListener('click', savePet);
    
    const closeAddPetModalBtn = document.getElementById('closeAddPetModal');
    if (closeAddPetModalBtn) closeAddPetModalBtn.addEventListener('click', closeAddPetModal);
    const cancelAddPetBtn = document.getElementById('cancelAddPetBtn');
    if (cancelAddPetBtn) cancelAddPetBtn.addEventListener('click', closeAddPetModal);
    const saveAddPetBtn = document.getElementById('saveAddPetBtn');
    if (saveAddPetBtn) saveAddPetBtn.addEventListener('click', saveNewPet);
}

function initUploadEvents() {
    // 用户头像上传
    const userAvatarFile = document.getElementById('userAvatarFile');
    if (userAvatarFile) {
        userAvatarFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = await uploadImage(file);
                if (url) {
                    const preview = document.getElementById('userAvatarPreview');
                    const urlInput = document.getElementById('editAvatarUrl');
                    if (preview) preview.src = url + '?t=' + Date.now();
                    if (urlInput) urlInput.value = url;
                }
            }
        });
    }
    
    // 新增宠物头像上传
    const addPetAvatarFile = document.getElementById('addPetAvatarFile');
    if (addPetAvatarFile) {
        addPetAvatarFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = await uploadImage(file);
                if (url) {
                    const preview = document.getElementById('addPetAvatarPreview');
                    const urlInput = document.getElementById('addPetAvatar');
                    if (preview) preview.src = url + '?t=' + Date.now();
                    if (urlInput) urlInput.value = url;
                }
            }
        });
    }
    
    // 编辑宠物头像上传
    const petAvatarFile = document.getElementById('petAvatarFile');
    if (petAvatarFile) {
        petAvatarFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = await uploadImage(file);
                if (url) {
                    const preview = document.getElementById('petAvatarPreview');
                    const urlInput = document.getElementById('editPetAvatar');
                    if (preview) preview.src = url + '?t=' + Date.now();
                    if (urlInput) urlInput.value = url;
                }
            }
        });
    }
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await axios.post('http://localhost:8080/api/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.code === 200) return response.data.data;
        alert('上传失败：' + response.data.message);
        return null;
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败');
        return null;
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ========== 用户管理 ==========
async function loadUsers(page = 1) {
    currentUserPage = page;
    const keyword = document.getElementById('userSearch')?.value || '';
    try {
        const res = await API.getUsers({ keyword, page: currentUserPage, pageSize: 20 });
        if (res.code === 200) {
            const data = res.data;
            const users = data?.list || [];
            const total = data?.total || 0;
            renderUsers(users);
            const totalUsersSpan = document.getElementById('totalUsers');
            const totalUserPetsSpan = document.getElementById('totalUserPets');
            const activeUsersSpan = document.getElementById('activeUsers');
            if (totalUsersSpan) totalUsersSpan.innerText = total;
            if (totalUserPetsSpan) totalUserPetsSpan.innerText = users.reduce((s, u) => s + (u.petCount || 0), 0);
            if (activeUsersSpan) activeUsersSpan.innerText = users.filter(u => u.status == 1).length;
            renderPagination('userPagination', total, currentUserPage, (p) => loadUsers(p));
        } else {
            const tbody = document.getElementById('userTableBody');
            if (tbody) tbody.innerHTML = `<td><td colspan="10" class="loading">${res.message || '加载失败'}</td></tr>`;
        }
    } catch(e) { 
        console.error(e); 
        const tbody = document.getElementById('userTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="10" class="loading">加载失败</td>';
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    if (!users?.length) { 
        tbody.innerHTML = '<tr><td colspan="10" class="loading">暂无数据</td>'; 
        return; 
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td><span class="expand-icon" onclick="toggleUserPets(${u.id})">${expandedUsers.has(u.id) ? '▼' : '▶'}</span></td>
            <td>${u.id}</td>
            <td><img src="${u.avatarUrl || DEFAULT_AVATAR}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="handleImageError(this)"></td>
            <td><strong>${u.username || '-'}</strong></td>
            <td>${u.phone || '-'}</td>
            <td>${u.address || '-'}</td>
            <td><span class="status-badge status-on">${u.petCount || 0}只</span></td>
            <td>${formatDate(u.createTime)}</td>
            <td><span class="status-badge ${u.status == 1 ? 'status-on' : 'status-off'}">${u.status == 1 ? '正常' : '禁用'}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editUser(${u.id})">编辑</button>
                <button class="btn btn-success btn-sm" onclick="openAddPetForUser(${u.id}, '${u.username}')">➕ 新建宠物</button>
                <button class="btn ${u.status == 1 ? 'btn-warning' : 'btn-success'} btn-sm" onclick="toggleUserStatus(${u.id}, ${u.status})">${u.status == 1 ? '禁用' : '启用'}</button>
             </td>
         </tr>
        ${expandedUsers.has(u.id) ? `<tr><td colspan="10"><div class="pet-subtable"><div style="padding:8px;font-weight:600">🐾 ${u.username}的宠物列表</div><div id="user-pets-${u.id}" style="padding:16px;text-align:center">加载中...</div></div></td></tr>` : ''}
    `).join('');
    expandedUsers.forEach(uid => loadUserPets(uid));
}

async function loadUserPets(uid) {
    try {
        const res = await API.getUserPets(uid);
        const c = document.getElementById(`user-pets-${uid}`);
        if (c && res.code === 200) {
            const pets = res.data;
            if (!pets?.length) {
                c.innerHTML = '<div style="padding:16px;text-align:center;color:#999">暂无宠物</div>';
            } else {
                c.innerHTML = `<table style="width:100%"><thead><tr><th>宠物名</th><th>品种</th><th>类型</th><th>年龄</th><th>状态</th><th>操作</th></tr></thead><tbody>${pets.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.breed || '-'}</td>
                        <td>${p.type || '-'}</td>
                        <td>${p.age || 0}个月</td>
                        <td><span class="status-badge ${p.status == 1 ? 'status-on' : 'status-off'}">${p.status == 1 ? '正常' : '禁用'}</span></td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editPet(${p.id})">编辑</button>
                            <button class="btn btn-danger btn-sm" onclick="deletePetFromUser(${p.id}, ${uid})">删除</button>
                        </td>
                    </tr>
                `).join('')}</tbody></table>`;
            }
        }
    } catch(e) { console.error(e); }
}

window.deletePetFromUser = async function(petId, userId) {
    if (confirm('确定删除该宠物吗？删除后无法恢复！')) {
        const res = await API.deletePet(petId);
        if (res.code === 200) {
            alert('删除成功');
            loadUsers(currentUserPage);
            loadPets(currentPetPage);
        } else {
            alert(res.message || '删除失败');
        }
    }
};

window.toggleUserPets = function(uid) {
    if (expandedUsers.has(uid)) expandedUsers.delete(uid);
    else expandedUsers.add(uid);
    loadUsers(currentUserPage);
};

function openAddUserModal() {
    const title = document.getElementById('userModalTitle');
    const username = document.getElementById('editUsername');
    const phone = document.getElementById('editPhone');
    const address = document.getElementById('editAddress');
    const avatarUrl = document.getElementById('editAvatarUrl');
    const preview = document.getElementById('userAvatarPreview');
    
    if (title) title.innerText = '新增用户';
    if (username) username.value = '';
    if (phone) phone.value = '';
    if (address) address.value = '';
    if (avatarUrl) avatarUrl.value = '';
    if (preview) preview.src = DEFAULT_AVATAR;
    
    window.isAddUser = true;
    window.currentEditUserId = null;
    
    const modal = document.getElementById('userModal');
    if (modal) modal.style.display = 'flex';
}

window.editUser = async function(id) {
    try {
        const res = await API.getUserById(id);
        if (res.code === 200) {
            const u = res.data;
            const title = document.getElementById('userModalTitle');
            const username = document.getElementById('editUsername');
            const phone = document.getElementById('editPhone');
            const address = document.getElementById('editAddress');
            const avatarUrl = document.getElementById('editAvatarUrl');
            const preview = document.getElementById('userAvatarPreview');
            
            if (title) title.innerText = '编辑用户';
            if (username) username.value = u.username || '';
            if (phone) phone.value = u.phone || '';
            if (address) address.value = u.address || '';
            if (avatarUrl) avatarUrl.value = u.avatarUrl || '';
            if (preview) preview.src = u.avatarUrl || DEFAULT_AVATAR;
            
            window.isAddUser = false;
            window.currentEditUserId = id;
            
            const modal = document.getElementById('userModal');
            if (modal) modal.style.display = 'flex';
        } else {
            alert(res.message || '获取用户信息失败');
        }
    } catch(e) { 
        console.error(e);
        alert('获取用户信息失败');
    }
};

window.saveUser = async function() {
    const usernameInput = document.getElementById('editUsername');
    const username = usernameInput ? usernameInput.value : '';
    if (!username) { 
        alert('请填写用户名'); 
        return; 
    }
    
    const data = {
        username: username,
        phone: document.getElementById('editPhone')?.value || '',
        address: document.getElementById('editAddress')?.value || '',
        avatarUrl: document.getElementById('editAvatarUrl')?.value || null
    };
    
    let res;
    if (window.isAddUser) {
        res = await API.createUser(data);
        if (res.code === 200) {
            closeUserModal();
            loadUsers(currentUserPage);
            alert('新增用户成功');
        } else {
            alert(res.message || '新增用户失败');
        }
    } else {
        res = await API.updateUser(window.currentEditUserId, data);
        if (res.code === 200) {
            closeUserModal();
            loadUsers(currentUserPage);
            alert('保存成功');
        } else {
            alert(res.message || '保存失败');
        }
    }
};

window.closeUserModal = function() { 
    const modal = document.getElementById('userModal');
    if (modal) modal.style.display = 'none'; 
};

window.toggleUserStatus = async function(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 1 ? '启用' : '禁用';
    if (confirm(`确定要${action}该用户吗？`)) {
        const res = await API.updateUserStatus(id, newStatus);
        if (res.code === 200) { 
            alert(`${action}成功`); 
            loadUsers(currentUserPage); 
        } else {
            alert(res.message || '操作失败');
        }
    }
};

// 为用户新建宠物
window.openAddPetForUser = function(userId, username) {
    currentAddPetUserId = userId;
    const nameInput = document.getElementById('addPetName');
    const breedInput = document.getElementById('addPetBreed');
    const typeSelect = document.getElementById('addPetType');
    const ageInput = document.getElementById('addPetAge');
    const statusSelect = document.getElementById('addPetStatus');
    const avatarInput = document.getElementById('addPetAvatar');
    const preview = document.getElementById('addPetAvatarPreview');
    
    if (nameInput) nameInput.value = '';
    if (breedInput) breedInput.value = '';
    if (typeSelect) typeSelect.value = '狗';
    if (ageInput) ageInput.value = '';
    if (statusSelect) statusSelect.value = '1';
    if (avatarInput) avatarInput.value = '';
    if (preview) preview.src = DEFAULT_AVATAR;
    
    const modal = document.getElementById('addPetModal');
    if (modal) modal.style.display = 'flex';
};

window.saveNewPet = async function() {
    const nameInput = document.getElementById('addPetName');
    const name = nameInput ? nameInput.value : '';
    if (!name) { 
        alert('请填写宠物名称'); 
        return; 
    }
    
    const data = {
        userId: currentAddPetUserId,
        name: name,
        breed: document.getElementById('addPetBreed')?.value || '',
        type: document.getElementById('addPetType')?.value || '狗',
        age: parseInt(document.getElementById('addPetAge')?.value) || 0,
        status: parseInt(document.getElementById('addPetStatus')?.value) || 1,
        avatar: document.getElementById('addPetAvatar')?.value || null
    };
    
    const res = await API.createPet(data);
    if (res.code === 200) {
        closeAddPetModal();
        loadUsers(currentUserPage);
        alert('新增宠物成功');
    } else {
        alert(res.message || '新增失败');
    }
};

window.closeAddPetModal = function() { 
    const modal = document.getElementById('addPetModal');
    if (modal) modal.style.display = 'none';
    currentAddPetUserId = null;
};

// ========== 宠物管理 ==========
async function loadPets(page = 1) {
    currentPetPage = page;
    const keyword = document.getElementById('petSearch')?.value || '';
    const type = document.getElementById('petTypeFilter')?.value || '';
    try {
        const res = await API.getPets({ keyword, type, page: currentPetPage, pageSize: 20 });
        if (res.code === 200) {
            const data = res.data;
            const pets = data?.list || [];
            const total = data?.total || 0;
            renderPets(pets);
            
            // 统计各种类型
            const totalPetsSpan = document.getElementById('totalPets');
            const catCountSpan = document.getElementById('catCount');
            const dogCountSpan = document.getElementById('dogCount');
            const rabbitCountSpan = document.getElementById('rabbitCount');
            const hamsterCountSpan = document.getElementById('hamsterCount');
            const birdCountSpan = document.getElementById('birdCount');
            
            if (totalPetsSpan) totalPetsSpan.innerText = total;
            if (catCountSpan) catCountSpan.innerText = pets.filter(p => p.type === '猫').length;
            if (dogCountSpan) dogCountSpan.innerText = pets.filter(p => p.type === '狗').length;
            if (rabbitCountSpan) rabbitCountSpan.innerText = pets.filter(p => p.type === '兔').length;
            if (hamsterCountSpan) hamsterCountSpan.innerText = pets.filter(p => p.type === '仓鼠').length;
            if (birdCountSpan) birdCountSpan.innerText = pets.filter(p => p.type === '鸟').length;
            
            renderPagination('petPagination', total, currentPetPage, (p) => loadPets(p));
        } else {
            const tbody = document.getElementById('petTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="loading">${res.message || '加载失败'}</td></tr>`;
        }
    } catch(e) { 
        console.error(e); 
        const tbody = document.getElementById('petTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="10" class="loading">加载失败</td></tr>';
    }
}

function renderPets(pets) {
    const tbody = document.getElementById('petTableBody');
    if (!tbody) return;
    if (!pets?.length) { 
        tbody.innerHTML = '<tr><td colspan="10" class="loading">暂无数据</td></tr>'; 
        return; 
    }
    tbody.innerHTML = pets.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.avatar || DEFAULT_AVATAR}" style="width:36px;height:36px;border-radius:10px;object-fit:cover;" onerror="handleImageError(this)"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.breed || '-'}</td>
            <td><span class="status-badge status-on">${p.type || '-'}</span></td>
            <td>${p.age || 0}个月</td>
            <td>${p.ownerName || '-'}</td>
            <td>${p.ownerPhone || '-'}</td>
            <td><span class="status-badge ${p.status == 1 ? 'status-on' : 'status-off'}">${p.status == 1 ? '正常' : '禁用'}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editPet(${p.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="deletePet(${p.id})">删除</button>
                <button class="btn ${p.status == 1 ? 'btn-warning' : 'btn-success'} btn-sm" onclick="togglePetStatus(${p.id}, ${p.status})">${p.status == 1 ? '禁用' : '启用'}</button>
            </td>
        </tr>
    `).join('');
}

window.editPet = async function(id) {
    try {
        const res = await API.getPetById(id);
        if (res.code === 200) {
            const p = res.data;
            const nameInput = document.getElementById('editPetName');
            const breedInput = document.getElementById('editPetBreed');
            const typeSelect = document.getElementById('editPetType');
            const ageInput = document.getElementById('editPetAge');
            const statusSelect = document.getElementById('editPetStatus');
            const avatarInput = document.getElementById('editPetAvatar');
            const preview = document.getElementById('petAvatarPreview');
            
            if (nameInput) nameInput.value = p.name || '';
            if (breedInput) breedInput.value = p.breed || '';
            if (typeSelect) typeSelect.value = p.type || '狗';
            if (ageInput) ageInput.value = p.age || 0;
            if (statusSelect) statusSelect.value = p.status || 1;
            if (avatarInput) avatarInput.value = p.avatar || '';
            if (preview) preview.src = p.avatar || DEFAULT_AVATAR;
            
            window.currentEditPetId = id;
            
            const modal = document.getElementById('petModal');
            if (modal) modal.style.display = 'flex';
        } else {
            alert(res.message || '获取宠物信息失败');
        }
    } catch(e) { 
        console.error(e);
        alert('获取宠物信息失败');
    }
};

window.savePet = async function() {
    const id = window.currentEditPetId;
    if (!id) return;
    
    const data = {
        name: document.getElementById('editPetName')?.value || '',
        breed: document.getElementById('editPetBreed')?.value || '',
        type: document.getElementById('editPetType')?.value || '狗',
        age: parseInt(document.getElementById('editPetAge')?.value) || 0,
        status: parseInt(document.getElementById('editPetStatus')?.value) || 1,
        avatar: document.getElementById('editPetAvatar')?.value || null
    };
    
    const res = await API.updatePet(id, data);
    if (res.code === 200) {
        closePetModal();
        loadPets(currentPetPage);
        loadUsers(currentUserPage);
        alert('保存成功');
    } else {
        alert(res.message || '保存失败');
    }
};

window.deletePet = async function(id) {
    if (confirm('确定删除该宠物吗？删除后无法恢复！')) {
        const res = await API.deletePet(id);
        if (res.code === 200) { 
            loadPets(currentPetPage); 
            loadUsers(currentUserPage); 
            alert('删除成功'); 
        } else {
            alert(res.message || '删除失败');
        }
    }
};

window.togglePetStatus = async function(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 1 ? '启用' : '禁用';
    if (confirm(`确定要${action}该宠物吗？`)) {
        const res = await API.updatePetStatus(id, newStatus);
        if (res.code === 200) {
            alert(`${action}成功`);
            loadPets(currentPetPage);
            loadUsers(currentUserPage);
        } else {
            alert(res.message || '操作失败');
        }
    }
};

window.closePetModal = function() { 
    const modal = document.getElementById('petModal');
    if (modal) modal.style.display = 'none'; 
};

// ========== 商品管理 ==========
async function loadProducts(page = 1) {
    currentProductPage = page;
    const search = document.getElementById('productSearch')?.value || '';
    const categoryId = document.getElementById('productCategory')?.value || '';
    const status = document.getElementById('productStatus')?.value || '';
    
    const params = {
        pageNum: currentProductPage,
        pageSize: 20,
        ...(search && { keyword: search }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(status !== '' && { status: parseInt(status) })
    };
    
    try {
        const result = await API.getProducts(params);
        if (result.code === 200) {
            const data = result.data;
            const products = data.list || data || [];
            const total = data.total || products.length;
            renderProducts(products);
            updateProductStats(products);
            renderPagination('productPagination', total, currentProductPage, (page) => {
                currentProductPage = page;
                loadProducts(page);
            });
        } else {
            const tbody = document.getElementById('productTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="loading">${result.message || '加载失败'}</td></tr>`;
        }
    } catch (error) {
        console.error('加载商品失败:', error);
        const tbody = document.getElementById('productTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="loading">网络错误</td>';
    }
}

function renderProducts(products) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">暂无数据</td>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image_url || DEFAULT_AVATAR}" class="product-image" onerror="handleImageError(this)"></td>
            <td><strong>${product.name}</strong></td>
            <td>${CATEGORY_MAP[product.category_id] || '其他'}</td>
            <td style="color: #9b59b6; font-weight: 600;">¥${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.sales || 0}</td>
            <td><span class="status-badge ${product.status == 1 ? 'status-on' : 'status-off'}">${product.status == 1 ? '已上架' : '已下架'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">编辑</button>
                <button class="btn btn-sm ${product.status == 1 ? 'btn-danger' : 'btn-success'}" onclick="toggleProductStatus(${product.id}, ${product.status})">${product.status == 1 ? '下架' : '上架'}</button>
            </td>
        </tr>
    `).join('');
}

function updateProductStats(products) {
    const total = products.length;
    const onShelf = products.filter(p => p.status == 1).length;
    const totalProductsSpan = document.getElementById('totalProducts');
    const onShelfProductsSpan = document.getElementById('onShelfProducts');
    const offShelfProductsSpan = document.getElementById('offShelfProducts');
    if (totalProductsSpan) totalProductsSpan.textContent = total;
    if (onShelfProductsSpan) onShelfProductsSpan.textContent = onShelf;
    if (offShelfProductsSpan) offShelfProductsSpan.textContent = total - onShelf;
}

function openAddProductModal() {
    isAddMode = true;
    editingType = 'product';
    editingItem = null;
    
    const title = document.getElementById('modalTitle');
    const originalPriceGroup = document.getElementById('originalPriceGroup');
    const stockGroup = document.getElementById('stockGroup');
    const nameInput = document.getElementById('editName');
    const priceInput = document.getElementById('editPrice');
    const originalPriceInput = document.getElementById('editOriginalPrice');
    const stockInput = document.getElementById('editStock');
    const statusSelect = document.getElementById('editStatus');
    
    if (title) title.textContent = '新增商品';
    if (originalPriceGroup) originalPriceGroup.style.display = 'flex';
    if (stockGroup) stockGroup.style.display = 'block';
    if (nameInput) nameInput.value = '';
    if (priceInput) priceInput.value = '';
    if (originalPriceInput) originalPriceInput.value = '';
    if (stockInput) stockInput.value = '';
    if (statusSelect) statusSelect.value = '1';
    
    ensureCategorySelect('product');
    
    const categorySelect = document.getElementById('editCategoryId');
    if (categorySelect) categorySelect.value = '1';
    
    openEditModal();
}

window.editProduct = async function(id) {
    isAddMode = false;
    editingType = 'product';
    editingItem = id;
    
    const title = document.getElementById('modalTitle');
    const originalPriceGroup = document.getElementById('originalPriceGroup');
    const stockGroup = document.getElementById('stockGroup');
    
    if (title) title.textContent = '编辑商品';
    if (originalPriceGroup) originalPriceGroup.style.display = 'flex';
    if (stockGroup) stockGroup.style.display = 'block';
    
    ensureCategorySelect('product');
    
    try {
        const result = await API.getProductById(id);
        if (result.code === 200) {
            const product = result.data;
            const nameInput = document.getElementById('editName');
            const priceInput = document.getElementById('editPrice');
            const originalPriceInput = document.getElementById('editOriginalPrice');
            const stockInput = document.getElementById('editStock');
            const statusSelect = document.getElementById('editStatus');
            const categorySelect = document.getElementById('editCategoryId');
            
            if (nameInput) nameInput.value = product.name || '';
            if (priceInput) priceInput.value = product.price || '';
            if (originalPriceInput) originalPriceInput.value = product.original_price || '';
            if (stockInput) stockInput.value = product.stock || '';
            if (statusSelect) statusSelect.value = product.status || '1';
            if (categorySelect) categorySelect.value = product.category_id || '1';
        } else {
            alert(result.message || '获取商品信息失败');
            return;
        }
    } catch (error) {
        console.error('获取商品详情失败:', error);
        alert('获取商品信息失败');
        return;
    }
    
    openEditModal();
};

window.toggleProductStatus = async function(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 1 ? '上架' : '下架';
    if (confirm(`确定要${action}该商品吗？`)) {
        const result = await API.updateProductStatus(id, newStatus);
        if (result.code === 200) {
            alert(`${action}成功`);
            loadProducts(currentProductPage);
        } else {
            alert(result.message || `${action}失败`);
        }
    }
};

// ========== 服务管理 ==========
async function loadServices(page = 1) {
    currentServicePage = page;
    const search = document.getElementById('serviceSearch')?.value || '';
    const categoryId = document.getElementById('serviceCategory')?.value || '';
    const status = document.getElementById('serviceStatus')?.value || '';
    
    const params = {
        pageNum: currentServicePage,
        pageSize: 20,
        ...(search && { keyword: search }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(status !== '' && { status: parseInt(status) })
    };
    
    try {
        const result = await API.getServices(params);
        if (result.code === 200) {
            const data = result.data;
            const services = data.list || data || [];
            const total = data.total || services.length;
            renderServices(services);
            updateServiceStats(services);
            renderPagination('servicePagination', total, currentServicePage, (page) => {
                currentServicePage = page;
                loadServices(page);
            });
        } else {
            const tbody = document.getElementById('serviceTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="loading">${result.message || '加载失败'}</td></tr>`;
        }
    } catch (error) {
        console.error('加载服务失败:', error);
        const tbody = document.getElementById('serviceTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="loading">网络错误</td>';
    }
}

function renderServices(services) {
    const tbody = document.getElementById('serviceTableBody');
    if (!tbody) return;
    if (!services || services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">暂无数据</td>';
        return;
    }
    
    tbody.innerHTML = services.map(service => `
        <tr>
            <td>${service.id}</td>
            <td><img src="${service.image_url || DEFAULT_AVATAR}" class="product-image" onerror="handleImageError(this)"></td>
            <td><strong>${service.name}</strong></td>
            <td>${SERVICE_CATEGORY_MAP[service.category_id] || '其他'}</td>
            <td style="color: #9b59b6; font-weight: 600;">¥${service.price}</td>
            <td>${service.original_price ? '¥' + service.original_price : '-'}</td>
            <td>${service.sales || 0}</td>
            <td><span class="status-badge ${service.status == 1 ? 'status-on' : 'status-off'}">${service.status == 1 ? '已上架' : '已下架'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">编辑</button>
                <button class="btn btn-sm ${service.status == 1 ? 'btn-danger' : 'btn-success'}" onclick="toggleServiceStatus(${service.id}, ${service.status})">${service.status == 1 ? '下架' : '上架'}</button>
              </td>
        </tr>
    `).join('');
}

function updateServiceStats(services) {
    const total = services.length;
    const onShelf = services.filter(s => s.status == 1).length;
    const totalServicesSpan = document.getElementById('totalServices');
    const onShelfServicesSpan = document.getElementById('onShelfServices');
    const offShelfServicesSpan = document.getElementById('offShelfServices');
    if (totalServicesSpan) totalServicesSpan.textContent = total;
    if (onShelfServicesSpan) onShelfServicesSpan.textContent = onShelf;
    if (offShelfServicesSpan) offShelfServicesSpan.textContent = total - onShelf;
}

function openAddServiceModal() {
    isAddMode = true;
    editingType = 'service';
    editingItem = null;
    
    const title = document.getElementById('modalTitle');
    const originalPriceGroup = document.getElementById('originalPriceGroup');
    const stockGroup = document.getElementById('stockGroup');
    const nameInput = document.getElementById('editName');
    const priceInput = document.getElementById('editPrice');
    const originalPriceInput = document.getElementById('editOriginalPrice');
    const statusSelect = document.getElementById('editStatus');
    
    if (title) title.textContent = '新增服务';
    if (originalPriceGroup) originalPriceGroup.style.display = 'flex';
    if (stockGroup) stockGroup.style.display = 'none';
    if (nameInput) nameInput.value = '';
    if (priceInput) priceInput.value = '';
    if (originalPriceInput) originalPriceInput.value = '';
    if (statusSelect) statusSelect.value = '1';
    
    // 使用固定服务分类
    showFixedServiceCategory();
    
    const categorySelect = document.getElementById('editCategoryId');
    if (categorySelect) categorySelect.value = '1';
    
    openEditModal();
}

window.editService = async function(id) {
    isAddMode = false;
    editingType = 'service';
    editingItem = id;
    
    const title = document.getElementById('modalTitle');
    const originalPriceGroup = document.getElementById('originalPriceGroup');
    const stockGroup = document.getElementById('stockGroup');
    
    if (title) title.textContent = '编辑服务';
    if (originalPriceGroup) originalPriceGroup.style.display = 'flex';
    if (stockGroup) stockGroup.style.display = 'none';
    
    // 使用固定服务分类
    showFixedServiceCategory();
    
    try {
        const result = await API.getServiceById(id);
        if (result.code === 200) {
            const service = result.data;
            const nameInput = document.getElementById('editName');
            const priceInput = document.getElementById('editPrice');
            const originalPriceInput = document.getElementById('editOriginalPrice');
            const statusSelect = document.getElementById('editStatus');
            const categorySelect = document.getElementById('editCategoryId');
            
            if (nameInput) nameInput.value = service.name || '';
            if (priceInput) priceInput.value = service.price || '';
            if (originalPriceInput) originalPriceInput.value = service.original_price || '';
            if (statusSelect) statusSelect.value = service.status || '1';
            if (categorySelect) categorySelect.value = service.category_id || '1';
        } else {
            alert(result.message || '获取服务信息失败');
            return;
        }
    } catch (error) {
        console.error('获取服务详情失败:', error);
        alert('获取服务信息失败');
        return;
    }
    
    openEditModal();
};

// 固定的服务分类（不调用数据库）
function showFixedServiceCategory() {
    let group = document.getElementById('categoryGroup');
    if (group) group.remove();
    
    const form = document.getElementById('editForm');
    const nameGroup = document.querySelector('#editForm .form-group:first-child');
    if (form && nameGroup) {
        const newGroup = document.createElement('div');
        newGroup.className = 'form-group';
        newGroup.id = 'categoryGroup';
        newGroup.innerHTML = `
            <label>服务分类 <span style="color: red;">*</span></label>
            <select id="editCategoryId" class="form-input">
                <option value="1">推荐套餐</option>
                <option value="2">限时折扣</option>
                <option value="3">基础护理</option>
                <option value="4">上门铲屎</option>
                <option value="5">宠物寄养</option>
                <option value="6">专车运送</option>
            </select>
        `;
        nameGroup.insertAdjacentElement('afterend', newGroup);
    }
}

window.toggleServiceStatus = async function(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    const action = newStatus == 1 ? '上架' : '下架';
    if (confirm(`确定要${action}该服务吗？`)) {
        const result = await API.updateServiceStatus(id, newStatus);
        if (result.code === 200) {
            alert(`${action}成功`);
            loadServices(currentServicePage);
        } else {
            alert(result.message || `${action}失败`);
        }
    }
};

// ========== 订单管理 ==========
async function loadOrders(page = 1) {
    currentOrderPage = page;
    const search = document.getElementById('orderSearch')?.value || '';
    const orderType = document.getElementById('orderType')?.value || '';
    const status = document.getElementById('orderStatus')?.value || '';
    
    const params = {
        pageNum: currentOrderPage,
        pageSize: 20,
        ...(search && { keyword: search }),
        ...(orderType && { orderType: parseInt(orderType) }),
        ...(status !== '' && { status: parseInt(status) })
    };
    
    try {
        const result = await API.getOrders(params);
        if (result.code === 200) {
            const data = result.data;
            const orders = data.list || data || [];
            const total = data.total || orders.length;
            renderOrders(orders);
            updateOrderStats(orders);
            renderPagination('orderPagination', total, currentOrderPage, (page) => {
                currentOrderPage = page;
                loadOrders(page);
            });
        } else {
            const tbody = document.getElementById('orderTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="loading">${result.message || '加载失败'} </td></tr>`;
        }
    } catch (error) {
        console.error('加载订单失败:', error);
        const tbody = document.getElementById('orderTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="loading">网络错误</td>';
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('orderTableBody');
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">暂无订单数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const orderId = order.id || '-';
        const orderNo = order.orderNo || '-';
        const userId = order.userId || '-';
        
        const orderTypeValue = order.orderType || '';
        const isProductOrder = orderTypeValue === 'PRODUCT';
        const isServiceOrder = orderTypeValue === 'SERVICE';
        const typeText = isProductOrder ? '商城订单' : (isServiceOrder ? '服务订单' : '未知');
        
        const payAmount = order.totalAmount || 0;
        const createTime = order.createTime || '-';
        const serviceTime = order.serviceTime || '-';
        
        let status = order.status;
        if (typeof status === 'string') status = parseInt(status);
        if (isNaN(status)) status = 0;
        
        // ========== 服务订单按钮逻辑 ==========
        const canConfirm = isServiceOrder && status === 10;      // 待确认 → 确认订单
        const canStart = isServiceOrder && status === 11;        // 待服务 → 开始服务
        const canComplete = isServiceOrder && status === 12;     // 服务中 → 完成服务
        const canCancel = isServiceOrder && status === 10;       // 待确认可取消
        
        // ========== 商城订单按钮逻辑 ==========
        const canCancelProduct = isProductOrder && status === 0;
        const canProductRefund = isProductOrder && (status === 1 || status === 2 || status === 3);
        
        return `
            <tr>
                <td>${orderId}</td>
                <td><strong>${orderNo}</strong></td>
                <td>${userId}</td>
                <td><span class="order-type-badge ${isProductOrder ? 'type-product' : 'type-service'}">${typeText}</span></td>
                <td style="color: #9b59b6; font-weight: 600;">¥${parseFloat(payAmount).toFixed(2)}</td>
                <td><span class="status-badge ${getOrderStatusClass(status)}">${getOrderStatusText(status)}</span></td>
                <td>${formatDateTime(createTime)}</td>
                <td>${serviceTime !== '-' ? formatDateTime(serviceTime) : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrderDetail(${orderId})">详情</button>
                    
                    <!-- 服务订单按钮 -->
                    ${canConfirm ? `<button class="btn btn-sm btn-success" onclick="confirmOrder(${orderId})">确认订单</button>` : ''}
                    ${canStart ? `<button class="btn btn-sm btn-success" onclick="startService(${orderId})">开始服务</button>` : ''}
                    ${canComplete ? `<button class="btn btn-sm btn-success" onclick="completeService(${orderId})">完成服务</button>` : ''}
                    ${canCancel ? `<button class="btn btn-sm btn-danger" onclick="cancelServiceOrder(${orderId})">取消订单</button>` : ''}
                    
                    <!-- 商城订单按钮 -->
                    ${canCancelProduct ? `<button class="btn btn-sm btn-danger" onclick="cancelProductOrder(${orderId})">取消订单</button>` : ''}
                    ${canProductRefund ? `<button class="btn btn-sm btn-warning" onclick="productRefund(${orderId})">退款</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStats(orders) {
    const totalOrdersSpan = document.getElementById('totalOrders');
    const pendingOrdersSpan = document.getElementById('pendingOrders');
    const totalIncomeSpan = document.getElementById('totalIncome');
    
    if (totalOrdersSpan) totalOrdersSpan.textContent = orders.length;
    
    // 待处理：待付款(0)、待发货(1)、待确认(10)、待服务(11)
    const pending = orders.filter(o => [0, 1, 10, 11].includes(o.status)).length;
    if (pendingOrdersSpan) pendingOrdersSpan.textContent = pending;
    
    // 总收入：已完成(3)、已完成(13)、已收货(3)
    const totalIncome = orders.filter(o => o.status === 3 || o.status === 13).reduce((sum, o) => {
        const amount = o.pay_amount || o.totalAmount || o.total_amount || 0;
        return sum + parseFloat(amount);
    }, 0);
    
    if (totalIncomeSpan) totalIncomeSpan.textContent = `¥${totalIncome.toFixed(2)}`;
}

// ========== 订单详情 ==========
window.viewOrderDetail = async function(id) {
    const result = await API.getOrderDetail(id);
    if (result.code === 200) {
        const order = result.data;
        const isServiceOrder = order.orderType === 'SERVICE';
        const status = order.status !== undefined ? order.status : 0;
        
        const canProductRefund = !isServiceOrder && (status === 1 || status === 2 || status === 3);
        const canCancelService = isServiceOrder && status === 10;
        const canConfirmService = isServiceOrder && status === 10;
        const canServiceRefund = isServiceOrder && (status === 11 || status === 12);
        const canHandleRefund = isServiceOrder && status === 15;
        
        const detailBody = document.getElementById('orderDetailBody');
        if (detailBody) {
            detailBody.innerHTML = `
                <div style="margin-bottom: 12px;"><strong>订单ID：</strong> ${order.id}</div>
                <div style="margin-bottom: 12px;"><strong>订单号：</strong> ${order.orderNo}</div>
                <div style="margin-bottom: 12px;"><strong>用户ID：</strong> ${order.userId}</div>
                <div style="margin-bottom: 12px;"><strong>用户名：</strong> ${order.userName || '-'}</div>
                <div style="margin-bottom: 12px;"><strong>订单类型：</strong> ${order.orderType === 'PRODUCT' ? '商城订单' : '服务订单'}</div>
                <div style="margin-bottom: 12px;"><strong>总金额：</strong> ¥${order.totalAmount}</div>
                <div style="margin-bottom: 12px;"><strong>状态：</strong> <span class="status-badge ${getOrderStatusClass(status)}">${getOrderStatusText(status)}</span></div>
                <div style="margin-bottom: 12px;"><strong>创建时间：</strong> ${formatDateTime(order.createTime)}</div>
                ${order.serviceTime ? `<div style="margin-bottom: 12px;"><strong>服务时间：</strong> ${formatDateTime(order.serviceTime)}</div>` : ''}
                ${order.payTime ? `<div style="margin-bottom: 12px;"><strong>支付时间：</strong> ${formatDateTime(order.payTime)}</div>` : ''}
                ${order.receiverName ? `<div style="margin-bottom: 12px;"><strong>收货人：</strong> ${order.receiverName} ${order.receiverPhone}</div>` : ''}
                ${order.receiverAddress ? `<div style="margin-bottom: 12px;"><strong>收货地址：</strong> ${order.receiverAddress}</div>` : ''}
                ${order.remark ? `<div style="margin-bottom: 12px;"><strong>备注：</strong> ${order.remark}</div>` : ''}
                
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0e0e0; display: flex; gap: 12px; flex-wrap: wrap;">
                    ${canProductRefund ? `<button class="btn btn-warning" onclick="productRefund(${order.id}); closeOrderModal();">退款</button>` : ''}
                    ${canCancelService ? `<button class="btn btn-danger" onclick="cancelServiceOrder(${order.id}); closeOrderModal();">取消订单</button>` : ''}
                    ${canConfirmService ? `<button class="btn btn-success" onclick="confirmServiceOrder(${order.id}); closeOrderModal();">确认订单</button>` : ''}
                    ${canServiceRefund ? `<button class="btn btn-warning" onclick="serviceRefund(${order.id}); closeOrderModal();">退款</button>` : ''}
                    ${canHandleRefund ? `
                        <button class="btn btn-success" onclick="agreeRefund(${order.id}); closeOrderModal();">同意退款</button>
                        <button class="btn btn-danger" onclick="rejectRefund(${order.id}); closeOrderModal();">拒绝退款</button>
                    ` : ''}
                </div>
            `;
        }
        const modal = document.getElementById('orderModal');
        if (modal) modal.style.display = 'block';
    } else {
        alert(result.message || '获取订单详情失败');
    }
};

// 确认服务订单（待付款0 → 待服务11）
window.confirmOrder = async function(orderId) {
    const res = await API.confirmOrder(orderId);
    if (res.code === 200) {
        alert('订单已确认，等待用户付款');
        loadOrders(currentOrderPage);
    }
};

// 开始服务（11 → 12）
window.startService = async function(orderId) {
    const res = await API.startService(orderId);
    if (res.code === 200) {
        alert('已开始服务');
        loadOrders(currentOrderPage);
    }
};

// 完成服务（12 → 13）
window.completeService = async function(orderId) {
    const res = await API.completeService(orderId);
    if (res.code === 200) {
        alert('服务已完成');
        loadOrders(currentOrderPage);
    }
};

// ========== 订单退款操作 ==========

// 商城订单退款（商家直接退款）
window.productRefund = async function(orderId) {
    const reason = prompt('请输入退款原因：', '商家主动退款');
    if (!reason) return;
    
    if (confirm(`确定要退款这笔订单吗？\n退款原因：${reason}\n退款后金额将原路返回`)) {
        try {
            const res = await API.productRefund?.(orderId, reason);
            if (res && res.code === 200) {
                alert('退款成功');
                loadOrders(currentOrderPage);
            } else {
                alert(res?.message || '退款失败');
            }
        } catch(e) {
            console.error('退款失败:', e);
            alert('退款失败，请稍后重试');
        }
    }
};

// 服务订单退款（商家直接退款）
window.serviceRefund = async function(orderId) {
    const reason = prompt('请输入退款原因：', '商家主动退款');
    if (!reason) return;
    
    if (confirm(`确定要退款这笔订单吗？\n退款原因：${reason}\n退款后金额将原路返回`)) {
        try {
            const res = await API.serviceRefund?.(orderId, reason);
            if (res && res.code === 200) {
                alert('退款成功');
                loadOrders(currentOrderPage);
            } else {
                alert(res?.message || '退款失败');
            }
        } catch(e) {
            console.error('退款失败:', e);
            alert('退款失败，请稍后重试');
        }
    }
};

// 取消服务订单（商家取消，待确认状态）
window.cancelServiceOrder = async function(orderId) {
    const reason = prompt('请输入取消原因：', '商家取消订单');
    if (!reason) return;
    
    if (confirm(`确定要取消这笔订单吗？\n取消原因：${reason}`)) {
        try {
            const res = await API.cancelServiceOrder?.(orderId, reason);
            if (res && res.code === 200) {
                alert('订单已取消');
                loadOrders(currentOrderPage);
            } else {
                alert(res?.message || '取消失败');
            }
        } catch(e) {
            console.error('取消订单失败:', e);
            alert('取消失败，请稍后重试');
        }
    }
};

// 用户申请退款（服务订单）
window.applyRefund = async function(orderId) {
    const reason = prompt('请输入退款原因：', '');
    if (!reason) return;
    
    if (confirm(`确定要申请退款吗？\n退款原因：${reason}`)) {
        try {
            const res = await API.applyRefund?.(orderId, reason);
            if (res && res.code === 200) {
                alert('退款申请已提交，等待商家审核');
                loadOrders(currentOrderPage);
            } else {
                alert(res?.message || '申请失败');
            }
        } catch(e) {
            console.error('申请退款失败:', e);
            alert('申请失败，请稍后重试');
        }
    }
};

// 商家同意退款
window.agreeRefund = async function(orderId) {
    if (confirm('确定要同意退款吗？退款后金额将原路返回')) {
        try {
            const res = await API.agreeRefund?.(orderId);
            if (res && res.code === 200) {
                alert('退款成功');
                loadOrders(currentOrderPage);
            } else {
                alert(res?.message || '退款失败');
            }
        } catch(e) {
            console.error('退款失败:', e);
            alert('退款失败，请稍后重试');
        }
    }
};

// 商家拒绝退款
window.rejectRefund = async function(orderId) {
    const reason = prompt('请输入拒绝原因：', '');
    if (!reason) return;
    
    if (confirm('确定要拒绝退款吗？')) {
        try {
            const res = await API.rejectRefund?.(orderId, reason);
            if (res && res.code === 200) {
                alert('已拒绝退款申请');
                loadOrders(currentOrderPage);
            } else {
                alert(res?.message || '操作失败');
            }
        } catch(e) {
            console.error('拒绝退款失败:', e);
            alert('操作失败，请稍后重试');
        }
    }
};

// ========== 通用方法 ==========
function ensureCategorySelect(type) {
    let categoryGroup = document.getElementById('categoryGroup');
    
    // 如果没有分类组，创建新的
    if (!categoryGroup) {
        const form = document.getElementById('editForm');
        const nameGroup = document.querySelector('#editForm .form-group:first-child');
        if (form && nameGroup) {
            categoryGroup = document.createElement('div');
            categoryGroup.className = 'form-group';
            categoryGroup.id = 'categoryGroup';
            
            if (type === 'product') {
                categoryGroup.innerHTML = `
                    <label>商品分类 <span style="color: red;">*</span></label>
                    <select id="editCategoryId" class="form-input">
                        <option value="">请选择分类</option>
                        <option value="1">狗狗主粮</option>
                        <option value="2">狗狗零食</option>
                        <option value="3">驱虫清洁</option>
                        <option value="4">营养保健</option>
                        <option value="5">家居出行</option>
                        <option value="6">常备药品</option>
                        <option value="7">玩具</option>
                        <option value="8">服饰</option>
                        <option value="9">猫咪主粮</option>
                        <option value="10">猫咪零食</option>
                        <option value="11">保健护理</option>
                        <option value="12">生活用品</option>
                    </select>
                `;
            } else {
                categoryGroup.innerHTML = `
                    <label>服务分类 <span style="color: red;">*</span></label>
                    <select id="editCategoryId" class="form-input">
                        <option value="">请选择分类</option>
                        <option value="1">推荐套餐</option>
                        <option value="2">限时折扣</option>
                        <option value="3">基础护理</option>
                        <option value="4">上门铲屎</option>
                        <option value="5">宠物寄养</option>
                        <option value="6">专车运送</option>
                    </select>
                `;
            }
            nameGroup.insertAdjacentElement('afterend', categoryGroup);
        }
    } else {
        // 已存在分类组，只更新下拉框选项
        const select = document.getElementById('editCategoryId');
        if (select) {
            if (type === 'product') {
                select.innerHTML = `
                    <option value="">请选择分类</option>
                    <option value="1">狗狗主粮</option>
                    <option value="2">狗狗零食</option>
                    <option value="3">驱虫清洁</option>
                    <option value="4">营养保健</option>
                    <option value="5">家居出行</option>
                    <option value="6">常备药品</option>
                    <option value="7">玩具</option>
                    <option value="8">服饰</option>
                    <option value="9">猫咪主粮</option>
                    <option value="10">猫咪零食</option>
                    <option value="11">保健护理</option>
                    <option value="12">生活用品</option>
                `;
            } else {
                select.innerHTML = `
                    <option value="">请选择分类</option>
                    <option value="1">推荐套餐</option>
                    <option value="2">限时折扣</option>
                    <option value="3">基础护理</option>
                    <option value="4">上门铲屎</option>
                    <option value="5">宠物寄养</option>
                    <option value="6">专车运送</option>
                `;
            }
        }
    }
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('editForm');
    if (form) form.reset();
    editingItem = null;
    editingType = null;
    isAddMode = false;
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

async function saveItem() {
    const nameInput = document.getElementById('editName');
    const priceInput = document.getElementById('editPrice');
    const originalPriceInput = document.getElementById('editOriginalPrice');
    const statusSelect = document.getElementById('editStatus');
    const stockInput = document.getElementById('editStock');
    const categorySelect = document.getElementById('editCategoryId');
    
    const name = nameInput ? nameInput.value : '';
    const price = priceInput ? priceInput.value : '';
    const originalPrice = originalPriceInput ? originalPriceInput.value : '';
    const status = statusSelect ? statusSelect.value : '1';
    const stock = stockInput ? stockInput.value : '';
    const categoryId = categorySelect ? categorySelect.value : null;
    
    if (!name || !price) {
        alert('请填写名称和价格');
        return;
    }
    
    if (!categoryId) {
        alert('请选择分类');
        return;
    }
    
    // 根据编辑类型构建不同的数据
    let result;
    if (isAddMode) {
        if (editingType === 'product') {
            const data = { 
                name, 
                price: parseFloat(price), 
                status: parseInt(status),
                categoryId: parseInt(categoryId),
                petType: 1,
                stock: stock ? parseInt(stock) : 0
            };
            if (originalPrice) data.originalPrice = parseFloat(originalPrice);
            result = await API.createProduct(data);
        } else {
            // 服务新增
            const data = { 
                name, 
                price: parseFloat(price), 
                status: parseInt(status),
                categoryId: parseInt(categoryId)
            };
            if (originalPrice) data.originalPrice = parseFloat(originalPrice);
            result = await API.createService(data);
        }
    } else {
        if (editingType === 'product') {
            const data = { 
                name, 
                price: parseFloat(price), 
                status: parseInt(status),
                categoryId: parseInt(categoryId),
                stock: stock ? parseInt(stock) : 0
            };
            if (originalPrice) data.originalPrice = parseFloat(originalPrice);
            result = await API.updateProduct(editingItem, data);
        } else {
            // 服务编辑
            const data = { 
                name, 
                price: parseFloat(price), 
                status: parseInt(status),
                categoryId: parseInt(categoryId)
            };
            if (originalPrice) data.originalPrice = parseFloat(originalPrice);
            result = await API.updateService(editingItem, data);
        }
    }
    
    if (result.code === 200) {
        alert(isAddMode ? '新增成功' : '保存成功');
        closeEditModal();
        if (editingType === 'product') loadProducts(currentProductPage);
        else loadServices(currentServicePage);
    } else {
        alert(result.message || (isAddMode ? '新增失败' : '保存失败'));
    }
}

function renderPagination(containerId, total, currentPage, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const pageSize = 20;
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    html += `<span class="page-info">第 ${currentPage} / ${totalPages} 页，共 ${total} 条</span>`;
    html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    
    container.innerHTML = html;
    
    const prevBtn = container.querySelector('.page-btn:first-child');
    const nextBtn = container.querySelector('.page-btn:last-child');
    
    if (prevBtn && !prevBtn.disabled) {
        prevBtn.addEventListener('click', () => {
            const page = parseInt(prevBtn.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        });
    }
    
    if (nextBtn && !nextBtn.disabled) {
        nextBtn.addEventListener('click', () => {
            const page = parseInt(nextBtn.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        });
    }
}

function formatDate(d) { 
    if (!d) return '-'; 
    const date = new Date(d); 
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; 
}