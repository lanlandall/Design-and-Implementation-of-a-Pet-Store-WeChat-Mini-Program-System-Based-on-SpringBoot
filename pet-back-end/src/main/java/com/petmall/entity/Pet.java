package com.petmall.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 宠物实体类
 * 对应数据库表：pet
 * 记录用户的宠物信息
 */
public class Pet {
    private Long id;                // 宠物ID，主键，自增
    private Long userId;            // 用户ID，关联user表，宠物的主人
    private String name;            // 宠物名称，如：小白、旺财
    private Integer age;            // 年龄，单位：月
    private String breed;           // 品种，如：金毛、布偶猫
    private String type;            // 类型：狗、猫、兔、鼠等
    private String avatar;          // 头像URL
    private BigDecimal weight;      // 体重，单位：kg

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date birthday;          // 生日
    private Integer status;         // 状态：1-正常，0-已删除
    private Date createTime;        // 创建时间
    private Date updateTime;        // 更新时间
    private String category;        // 分类（备用字段）
    private String imageUrl;        // 图片URL（备用字段）
    private Boolean isAvailable;    // 是否可用（备用字段）

    // ========== Getter 和 Setter ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }
    public Date getBirthday() { return birthday; }
    public void setBirthday(Date birthday) { this.birthday = birthday; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}