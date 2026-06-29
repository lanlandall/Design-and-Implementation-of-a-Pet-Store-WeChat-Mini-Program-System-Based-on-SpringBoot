// pages/4/1news/news.js
const app = getApp();

Page({
  data: {
    // 状态
    loading: false,
    refreshing: false,
    
    // 百科分类
    knowledgeCategories: [
      { id: 1, name: '疾病自查', icon: '🏥', bgColor: 'linear-gradient(135deg, #ff9a9e, #fad0c4)', url: '/pages/4/2disease/self-check' },
      { id: 2, name: '疾病百科', icon: '📚', bgColor: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', url: '/pages/4/3disease/encyclopedia' },
      { id: 3, name: '紧急急救', icon: '🚑', bgColor: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', url: '/pages/4/4emergency/emergency' },
      { id: 4, name: '宠物训练', icon: '🎾', bgColor: 'linear-gradient(135deg, #ffd1d1, #fff3b0)', url: '/pages/4/5training/training' },
      { id: 5, name: '怀孕课堂', icon: '🤰', bgColor: 'linear-gradient(135deg, #d4fc79, #96e6a1)', url: '/pages/4/6pregnancy/pregnancy' }
    ],
    
    // 帖子数据
    posts: [],
    loadingPosts: false,
    hasMorePosts: true,
    pageNum: 1,
    pageSize: 10
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadPosts(true);
  },

  // 初始化数据
  initData() {
    this.loadPosts(true);
  },

  // 加载帖子数据
  loadPosts(isRefresh = false) {
    if (this.data.loadingPosts || (!isRefresh && !this.data.hasMorePosts)) return;
    
    this.setData({ loadingPosts: true });
    
    if (isRefresh) {
      this.setData({
        pageNum: 1,
        hasMorePosts: true,
        posts: []
      });
    }
    
    // 模拟网络请求 - 实际开发中替换为真实API
    setTimeout(() => {
      const mockPosts = this.generateMockPosts(this.data.pageNum);
      const newPosts = isRefresh ? mockPosts : [...this.data.posts, ...mockPosts];
      
      this.setData({
        posts: newPosts,
        loadingPosts: false,
        hasMorePosts: mockPosts.length === this.data.pageSize,
        pageNum: this.data.pageNum + 1
      });
    }, 800);
  },

  // 生成模拟帖子数据（小红书样式）
  generateMockPosts(pageNum) {
    const users = [
      { id: 101, name: '豆豆麻麻', avatar: '' },
      { id: 102, name: '喵星人铲屎官', avatar: '' },
      { id: 103, name: '金毛小七', avatar: '' },
      { id: 104, name: '布偶猫舍', avatar: '' },
      { id: 105, name: '宠物医生王', avatar: '' }
    ];
    
    const contents = [
      { title: '我家金毛的日常护理', desc: '今天给大家分享一下金毛的日常护理小技巧...', images: ['/images/post1-1.jpg', '/images/post1-2.jpg', '/images/post1-3.jpg'] },
      { title: '猫咪呕吐怎么办？', desc: '最近很多猫友问我猫咪呕吐的问题，今天统一回复一下...', images: ['/images/post2-1.jpg', '/images/post2-2.jpg'] },
      { title: '狗狗训练小技巧', desc: '教你3分钟教会狗狗坐下', images: ['/images/post3-1.jpg'] },
      { title: '宠物驱虫时间表', desc: '建议收藏！宠物驱虫时间表来了...', images: ['/images/post4-1.jpg', '/images/post4-2.jpg', '/images/post4-3.jpg', '/images/post4-4.jpg'] },
      { title: '新猫到家注意事项', desc: '第一次养猫必看的注意事项...', images: ['/images/post5-1.jpg', '/images/post5-2.jpg'] }
    ];
    
    const posts = [];
    const startIndex = (pageNum - 1) * this.data.pageSize;
    
    for (let i = 0; i < this.data.pageSize; i++) {
      const userIndex = (startIndex + i) % users.length;
      const contentIndex = (startIndex + i) % contents.length;
      const user = users[userIndex];
      const content = contents[contentIndex];
      
      posts.push({
        id: startIndex + i + 1000,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        time: `${Math.floor(Math.random() * 24)}分钟前`,
        title: content.title,
        desc: content.desc,
        images: content.images,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        isLiked: false,
        isFollowed: false
      });
    }
    
    return posts;
  },

  // ===== 百科分类跳转 =====
  goToKnowledge(e) {
    const { id, name } = e.currentTarget.dataset;
    const category = this.data.knowledgeCategories.find(c => c.id === id);
    
    if (category && category.url) {
      wx.navigateTo({
        url: category.url
      });
    } else {
      wx.showToast({
        title: `${name}页面开发中`,
        icon: 'none'
      });
    }
  },

  goToAllKnowledge() {
    wx.navigateTo({
      url: '/pages/4/7knowledge/all'
    });
  },

  // ===== 社区相关 =====
  goToAllPosts() {
    wx.navigateTo({
      url: '/pages/4/8community/all'
    });
  },

  goToPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/4/9post/detail?id=${postId}`
    });
  },

  goToPublish() {
    wx.navigateTo({
      url: '/pages/4/10publish/publish'
    });
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/4/11search/search'
    });
  },

  // 关注/取消关注
  onFollow(e) {
    const userId = e.currentTarget.dataset.id;
    const posts = this.data.posts.map(post => {
      if (post.user.id === userId) {
        return {
          ...post,
          isFollowed: !post.isFollowed
        };
      }
      return post;
    });
    
    this.setData({ posts });
    
    wx.showToast({
      title: posts.find(p => p.user.id === userId).isFollowed ? '关注成功' : '已取消关注',
      icon: 'none'
    });
  },

  // 点赞/取消点赞
  onLike(e) {
    const postId = e.currentTarget.dataset.id;
    const posts = this.data.posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked: isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    });
    
    this.setData({ posts });
  },

  // 评论
  onComment(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/4/12comment/comment?postId=${postId}`
    });
  },

  // 分享
  onShare(e) {
    const postId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['分享到朋友圈', '分享给好友', '复制链接'],
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });
        
        // 更新分享数
        const posts = this.data.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              shares: post.shares + 1
            };
          }
          return post;
        });
        
        this.setData({ posts });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { url, list } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: list
    });
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ refreshing: true });
    
    setTimeout(() => {
      this.loadPosts(true);
      this.setData({ refreshing: false });
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 加载更多
  loadMore() {
    this.loadPosts();
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '养宠百科 - 学习宠物知识',
      path: '/pages/4/1news/news'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '养宠百科 - 学习宠物知识',
      query: ''
    };
  }
});