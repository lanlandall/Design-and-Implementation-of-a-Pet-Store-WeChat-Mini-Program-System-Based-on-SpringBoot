// pages/1/2position/map.js
const app = getApp();

Page({
  data: {
    latitude: 39.9042,
    longitude: 116.4074,
    scale: 15,
    markers: [],
    currentAddress: '正在定位...',
    nearbyShops: [],
    showShopList: false,
    loading: true
  },

  onLoad() {
    this.getUserLocation();
    this.loadNearbyShops();
  },

  // 获取用户当前位置
  getUserLocation() {
    const that = this;
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        that.setData({
          latitude: latitude,
          longitude: longitude,
          loading: false
        });
        
        // 添加当前位置标记
        that.addCurrentLocationMarker(latitude, longitude);
        
        // 获取地址名称
        that.getAddressName(latitude, longitude);
        
        // 加载附近门店
        that.loadNearbyShops(latitude, longitude);
      },
      fail: () => {
        that.setData({ loading: false });
        that.setData({ currentAddress: '定位失败，请点击刷新' });
        wx.showModal({
          title: '提示',
          content: '请允许定位权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    });
  },

  // 添加当前位置标记
  addCurrentLocationMarker(lat, lng) {
    this.setData({
      markers: [{
        id: 0,
        latitude: lat,
        longitude: lng,
        iconPath: '/images/current-location.png',
        width: 30,
        height: 30,
        callout: {
          content: '我在这里',
          color: '#5e4b8c',
          fontSize: 12,
          borderRadius: 20,
          bgColor: '#ffffff',
          padding: 8,
          display: 'ALWAYS'
        }
      }]
    });
  },

  // 获取地址名称
  getAddressName(latitude, longitude) {
    const that = this;
    
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77`,
      success: (res) => {
        if (res.data.status === 0) {
          const addr = res.data.result.formatted_addresses?.recommend || 
                      res.data.result.address ||
                      `${res.data.result.address_component.city}${res.data.result.address_component.district}`;
          that.setData({ currentAddress: addr });
        } else {
          that.setData({ currentAddress: `${latitude.toFixed(4)},${longitude.toFixed(4)}` });
        }
      },
      fail: () => {
        that.setData({ currentAddress: `${latitude.toFixed(4)},${longitude.toFixed(4)}` });
      }
    });
  },

  // 加载附近宠物店
  loadNearbyShops(lat, lng) {
    // 模拟附近宠物店数据（实际应从后端获取）
    const shops = [
      {
        id: 1,
        name: '萌宠诊所（望京店）',
        address: '望京街10号',
        latitude: lat + 0.002,
        longitude: lng + 0.003,
        distance: 0.3,
        rating: 4.8
      },
      {
        id: 2,
        name: '宠物家（朝悦店）',
        address: '朝阳大悦城B1',
        latitude: lat - 0.0015,
        longitude: lng + 0.005,
        distance: 0.5,
        rating: 4.6
      },
      {
        id: 3,
        name: '爱宠乐园',
        address: '三里屯SOHO 5号',
        latitude: lat + 0.005,
        longitude: lng - 0.002,
        distance: 0.8,
        rating: 4.9
      },
      {
        id: 4,
        name: '汪星人宠物店',
        address: '建国门外大街1号',
        latitude: lat - 0.003,
        longitude: lng - 0.004,
        distance: 1.2,
        rating: 4.5
      }
    ];
    
    // 添加门店标记
    const markers = [...this.data.markers];
    shops.forEach((shop, index) => {
      markers.push({
        id: shop.id,
        latitude: shop.latitude,
        longitude: shop.longitude,
        iconPath: '/images/pet-shop.png',
        width: 32,
        height: 32,
        callout: {
          content: shop.name,
          color: '#5e4b8c',
          fontSize: 12,
          borderRadius: 20,
          bgColor: '#ffffff',
          padding: 8,
          display: 'ALWAYS'
        }
      });
    });
    
    this.setData({
      nearbyShops: shops,
      markers: markers
    });
  },

  // 刷新位置
  refreshLocation() {
    this.setData({ loading: true });
    this.getUserLocation();
    this.loadNearbyShops(this.data.latitude, this.data.longitude);
  },

  // 回到当前位置
  goToCurrentLocation() {
    const mapContext = wx.createMapContext('map');
    mapContext.moveToLocation();
    wx.showToast({ title: '已回到当前位置', icon: 'success' });
  },

  // 点击门店标记
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const shop = this.data.nearbyShops.find(s => s.id === markerId);
    if (shop) {
      wx.showModal({
        title: shop.name,
        content: `${shop.address}\n距您${shop.distance}km\n评分：${shop.rating}`,
        confirmText: '去这里',
        success: (res) => {
          if (res.confirm) {
            // 打开地图导航
            wx.openLocation({
              latitude: shop.latitude,
              longitude: shop.longitude,
              name: shop.name,
              address: shop.address,
              scale: 18
            });
          }
        }
      });
    }
  },

  // 切换门店列表
  toggleShopList() {
    this.setData({ showShopList: !this.data.showShopList });
  },

  // 前往门店
  goToShop(e) {
    const shop = e.currentTarget.dataset;
    wx.openLocation({
      latitude: shop.lat,
      longitude: shop.lng,
      name: shop.name,
      address: shop.address,
      scale: 18
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});