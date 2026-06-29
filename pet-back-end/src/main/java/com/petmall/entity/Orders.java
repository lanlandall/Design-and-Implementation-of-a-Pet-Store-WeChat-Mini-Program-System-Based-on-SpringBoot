package com.petmall.entity;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 订单实体类
 */
public class Orders {
    private Long id;
    private String orderNo;              // 订单号
    private Long userId;                 // 用户ID
    private String orderType;            // 订单类型：PRODUCT-商城，SERVICE-服务
    private BigDecimal totalAmount;      // 总金额
    private Integer status;              // 状态：0待付款 1待服务/待发货 2进行中/待收货 3已完成 4待评价 -1已取消
    private String receiverName;         // 收货人姓名
    private String receiverPhone;        // 收货人电话
    private String receiverAddress;      // 收货地址
    private Date serviceTime;            // 服务时间
    private String remark;               // 备注
    private Long petId;                  // 宠物ID
    private String petName;              // 宠物名称
    private Date payTime;                // 支付时间
    private Date createTime;             // 创建时间
    private Date updateTime;             // 更新时间

    // 扩展字段（非数据库字段）
    private List<OrderItem> items;       // 订单项列表
    private String userName;             // 用户名（关联查询）
    private String userAvatar;           // 用户头像（关联查询）

    // Getter 和 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
    public Date getServiceTime() { return serviceTime; }
    public void setServiceTime(Date serviceTime) { this.serviceTime = serviceTime; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }
    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }
    public Date getPayTime() { return payTime; }
    public void setPayTime(Date payTime) { this.payTime = payTime; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
}