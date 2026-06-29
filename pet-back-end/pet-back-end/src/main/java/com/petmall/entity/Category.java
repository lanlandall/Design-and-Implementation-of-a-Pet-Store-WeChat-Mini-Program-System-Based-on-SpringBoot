package com.petmall.entity;

import java.util.Date;

/**
 * 分类实体类
 * 对应数据库表：category
 * 用于商品分类管理（狗狗主粮、狗狗零食等）
 */
public class Category {
    private Long id;            // 分类ID，主键，自增
    private String name;        // 分类名称，如：狗狗主粮、狗狗零食
    private Integer petType;    // 宠物类型：1-狗，2-猫
    private Integer sortOrder;  // 排序顺序，数字越小越靠前
    private Integer isFixed;    // 是否固定位置：0-否，1-是
    private Date createTime;    // 创建时间

    // ========== Getter 和 Setter ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getPetType() { return petType; }
    public void setPetType(Integer petType) { this.petType = petType; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Integer getIsFixed() { return isFixed; }
    public void setIsFixed(Integer isFixed) { this.isFixed = isFixed; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
}