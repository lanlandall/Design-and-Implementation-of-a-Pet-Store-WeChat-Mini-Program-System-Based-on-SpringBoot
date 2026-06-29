package com.petmall.dto;

import java.util.List;
import java.util.Map;

public class OrderCreateDTO {
    private List<Map<String, Object>> items;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String remark;
    private Long serviceId;
    private Integer quantity;
    private String serviceTime;
    private Long petId;
    private String petName;

    public List<Map<String, Object>> getItems() { return items; }
    public void setItems(List<Map<String, Object>> items) { this.items = items; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getServiceTime() { return serviceTime; }
    public void setServiceTime(String serviceTime) { this.serviceTime = serviceTime; }
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }
    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }
}