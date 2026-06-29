// pages/1/3pets/pet.js
const app = getApp();
const api = require('../../../utils/api.js');

Page({
  data: {
    petList: [],
    showModal: false,
    showDeleteModal: false,
    modalTitle: '添加宠物',
    isEdit: false,
    editId: null,
    deleteId: null,
    deletePetName: '',
    typeList: ['狗狗', '猫咪', '兔子', '仓鼠', '鸟类', '其他'],
    typeIndex: 0,
    formData: {
      name: '',
      type: '狗狗',
      breed: '',
      age: '',
      weight: '',
      birthday: ''
    }
  },

  onLoad() {
    this.loadPetList();
  },

  onShow() {
    this.loadPetList();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 加载宠物列表
  async loadPetList() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    try {
      const res = await api.getPetList();
      wx.hideLoading();

      if (res.code === 200 && res.data) {
        // 为每个宠物添加随机头像颜色
        const colors = ['#9b59b6', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#1abc9c'];
        const petList = res.data.map((pet, index) => ({
          ...pet,
          avatarColor: colors[index % colors.length]
        }));
        this.setData({ petList });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('加载宠物列表失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      modalTitle: '添加宠物',
      isEdit: false,
      editId: null,
      typeIndex: 0,
      formData: {
        name: '',
        type: '狗狗',
        breed: '',
        age: '',
        weight: '',
        birthday: ''
      }
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const pet = this.data.petList.find(p => p.id == id);
    
    if (!pet) return;

    // 获取类型索引
    const typeIndex = this.data.typeList.indexOf(pet.type) >= 0 
      ? this.data.typeList.indexOf(pet.type) 
      : 0;

    this.setData({
      showModal: true,
      modalTitle: '编辑宠物',
      isEdit: true,
      editId: id,
      typeIndex: typeIndex,
      formData: {
        name: pet.name || '',
        type: pet.type || '狗狗',
        breed: pet.breed || '',
        age: pet.age || '',
        weight: pet.weight || '',
        birthday: pet.birthday || ''
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  stopPropagation() {},

  // 表单输入
  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
  },

  onBreedInput(e) {
    this.setData({ 'formData.breed': e.detail.value });
  },

  onAgeInput(e) {
    this.setData({ 'formData.age': e.detail.value });
  },

  onWeightInput(e) {
    this.setData({ 'formData.weight': e.detail.value });
  },

  onTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      typeIndex: index,
      'formData.type': this.data.typeList[index]
    });
  },

  onBirthdayChange(e) {
    this.setData({ 'formData.birthday': e.detail.value });
  },

  // 保存宠物
  async savePet() {
    const { formData, isEdit, editId } = this.data;

    // 验证
    if (!formData.name || !formData.name.trim()) {
      wx.showToast({ title: '请输入宠物名称', icon: 'none' });
      return;
    }

    if (!formData.age) {
      wx.showToast({ title: '请输入宠物年龄', icon: 'none' });
      return;
    }

    const data = {
      name: formData.name.trim(),
      type: formData.type,
      breed: formData.breed,
      age: parseInt(formData.age),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      birthday: formData.birthday || null
    };

    wx.showLoading({ title: isEdit ? '更新中...' : '添加中...' });

    try {
      let res;
      if (isEdit) {
        res = await api.updatePet(editId, data);
      } else {
        res = await api.addPet(data);
      }

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: isEdit ? '修改成功' : '添加成功', icon: 'success' });
        this.setData({ showModal: false });
        this.loadPetList();
        
        // 通知上一页刷新宠物列表
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.loadPetList) {
          prevPage.loadPetList();
        }
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('保存宠物失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
  },

  // 显示删除确认
  deletePet(e) {
    const id = e.currentTarget.dataset.id;
    const pet = this.data.petList.find(p => p.id == id);
    
    this.setData({
      showDeleteModal: true,
      deleteId: id,
      deletePetName: pet ? pet.name : ''
    });
  },

  closeDeleteModal() {
    this.setData({ showDeleteModal: false });
  },

  // 确认删除
  async confirmDelete() {
    const { deleteId } = this.data;

    wx.showLoading({ title: '删除中...' });

    try {
      const res = await api.deletePet(deleteId);
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '删除成功', icon: 'success' });
        this.setData({ showDeleteModal: false });
        this.loadPetList();
        
        // 通知上一页刷新宠物列表
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.loadPetList) {
          prevPage.loadPetList();
        }
        
        // 如果删除的是当前选中的宠物，清除缓存
        const selectedPetId = wx.getStorageSync('selectedPetId');
        if (selectedPetId == deleteId) {
          wx.removeStorageSync('selectedPet');
          wx.removeStorageSync('selectedPetId');
        }
      } else {
        wx.showToast({ title: res.message || '删除失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('删除宠物失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
  }
});