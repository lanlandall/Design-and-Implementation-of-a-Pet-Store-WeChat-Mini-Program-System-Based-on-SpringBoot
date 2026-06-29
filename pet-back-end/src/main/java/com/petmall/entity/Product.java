package com.petmall.entity;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 商品实体类
 */
public class Product {
    private Long id;
    private Long categoryId;            // 分类ID
    private Integer petType;            // 宠物类型：1猫 2狗 3其他
    private String name;                // 商品名称
    private String description;         // 商品描述
    private BigDecimal price;           // 现价
    private BigDecimal originalPrice;   // 原价
    private String imageUrl;               // 封面图
    private String images;              // 详情图（多张，逗号分隔）
    private Integer stock;              // 库存
    private Integer sales;              // 销量
    private Integer status;             // 状态：1上架 0下架
    private Integer sortOrder;          // 排序
    private Date createTime;            // 创建时间
    private Date updateTime;            // 更新时间

    // Getter 和 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Integer getPetType() { return petType; }
    public void setPetType(Integer petType) { this.petType = petType; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String ImageUrl) { this.imageUrl = ImageUrl; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Integer getSales() { return sales; }
    public void setSales(Integer sales) { this.sales = sales; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }

}