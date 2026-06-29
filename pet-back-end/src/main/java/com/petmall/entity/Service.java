package com.petmall.entity;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 服务项目实体类
 * 对应数据库表：service
 * 服务项目信息
 */
public class Service {
    private Long id;                    // 服务ID，主键，自增
    private Long categoryId;            // 分类ID：1-推荐套餐，2-限时折扣，3-基础护理，4-上门铲屎，5-宠物寄养，6-专车运送
    private String name;                // 服务名称
    private String description;         // 服务描述
    private BigDecimal price;           // 现价
    private BigDecimal originalPrice;   // 原价
    private String imageUrl;            // 服务图片URL
    private Integer duration;           // 服务时长，单位：分钟
    private Integer sales;              // 销量
    private Integer status;             // 状态：1-上架，0-下架
    private Date createTime;            // 创建时间
    private Date updateTime;            // 更新时间

    // ========== Getter 和 Setter ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getSales() { return sales; }
    public void setSales(Integer sales) { this.sales = sales; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
}