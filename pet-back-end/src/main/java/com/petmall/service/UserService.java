package com.petmall.service;

import com.petmall.entity.User;
import com.petmall.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 用户业务层
 */
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    // ============================================================
    // 登录相关
    // ============================================================

    /**
     * 微信登录/注册
     */
    public User wechatLogin(String openid, String nickname, String avatarUrl) {
        User user = userMapper.selectByOpenid(openid);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setUsername(nickname);
            user.setAvatarUrl(avatarUrl);
            user.setRole("user");
            user.setCreateTime(new Date());
            user.setLastLoginTime(new Date());
            userMapper.insertWechat(user);
        } else {
            userMapper.updateLoginTime(user.getId());
        }
        return user;
    }

    /**
     * 账号密码登录
     */
    public User loginByPassword(String account, String password) {
        User user = userMapper.selectByAccount(account);
        if (user != null && password.equals(user.getPassword())) {
            return user;
        }
        return null;
    }

    /**
     * 管理员登录
     */
    public User adminLogin(String account, String password) {
        User user = userMapper.selectByAccount(account);
        if (user != null && password.equals(user.getPassword()) && "admin".equals(user.getRole())) {
            userMapper.updateLoginTime(user.getId());
            return user;
        }
        return null;
    }

    // ============================================================
    // 用户资料管理
    // ============================================================

    /**
     * 根据ID获取用户
     */
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    /**
     * 更新用户资料
     */
    public boolean updateProfile(User user) {
        return userMapper.updateProfile(user) > 0;
    }

    /**
     * 修改密码
     */
    public boolean updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null || !oldPassword.equals(user.getPassword())) {
            return false;
        }
        return userMapper.updatePassword(userId, newPassword) > 0;
    }

    /**
     * 上传头像
     */
    public String uploadAvatar(Long userId, MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = "avatar_" + userId + "_" + System.currentTimeMillis() + suffix;

            String uploadPath = "E:\\SAPP\\微信开发工具\\uploads\\avatar";
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File dest = new File(uploadPath + fileName);
            file.transferTo(dest);

            String avatarUrl = "/uploads/avatar/" + fileName;
            userMapper.updateAvatar(userId, avatarUrl);
            return avatarUrl;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ============================================================
    // 管理后台
    // ============================================================

    /**
     * 获取所有用户
     */
    public List<User> getAllUsers() {
        return userMapper.selectAll();
    }

    /**
     * 分页获取用户
     */
    public List<User> getUsersByPage(Integer pageNum, Integer pageSize) {
        int offset = (pageNum - 1) * pageSize;
        return userMapper.selectByPage(offset, pageSize);
    }

    /**
     * 统计用户总数
     */
    public int countAllUsers() {
        return userMapper.countAll();
    }

    /**
     * 新增用户
     */
    public boolean addUser(User user) {
        user.setCreateTime(new Date());
        user.setRole("user");
        return userMapper.insert(user) > 0;
    }

//    /**
//     * 更新用户信息
//     */
//    public boolean updateUser(User user) {
//        return userMapper.update(user) > 0;
//    }

    /**
     * 更新用户状态
     */
    public boolean updateUserStatus(Long id, Integer status) {
        return userMapper.updateStatus(id, status) > 0;
    }

    /**
     * 删除用户
     */
    public boolean deleteUser(Long id) {
        return userMapper.deleteById(id) > 0;
    }

    // ============================================================
    // Token相关
    // ============================================================

    /**
     * 生成Token
     */
    public String generateToken(Long userId) {
        return UUID.randomUUID().toString().replace("-", "") + "_" + userId;
    }

    /**
     * 从Token解析用户ID
     */
    public Long getUserIdFromToken(String token) {
        try {
            String[] parts = token.split("_");
            return Long.parseLong(parts[1]);
        } catch (Exception e) {
            return null;
        }
    }
}