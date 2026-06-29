package com.petmall.entity;

import java.util.Date;

/**
 * 用户实体类
 * 对应数据库表：user
 */
public class User {
    private Long id;                // 用户ID，主键，自增
    private String openid;          // 微信openid，唯一标识
    private String username;        // 用户名/昵称
    private String phone;           // 手机号
    private String role;            // 角色：admin-管理员，user-普通用户
    private String account;         // 账号（管理员用）
    private String password;        // 密码（管理员用）
    private String address;         // 地址
    private Date createTime;        // 创建时间
    private Date updateTime;        // 更新时间
    private Date lastLoginTime;     // 最后登录时间
    private String avatarUrl;       // 头像URL

    // ========== Getter 和 Setter ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOpenid() { return openid; }
    public void setOpenid(String openid) { this.openid = openid; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }

    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }

    public Date getLastLoginTime() { return lastLoginTime; }
    public void setLastLoginTime(Date lastLoginTime) { this.lastLoginTime = lastLoginTime; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}