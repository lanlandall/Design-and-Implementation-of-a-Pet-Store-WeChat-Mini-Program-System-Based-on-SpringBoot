package com.petmall.entity;

import java.math.BigDecimal;

/**
 * 订单项实体类
 */
public class OrderItem {
    private Long id;
    private Long orderId;           // 订单ID
    private Long productId;         // 商品/服务ID
    private String name;            // 商品/服务名称
    private BigDecimal price;       // 单价
    private Integer quantity;       // 数量
    private BigDecimal totalPrice;  // 小计
    private String image;           // 图片

    // Getter 和 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}