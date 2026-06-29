package com.petmall.entity;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

/**
 * 驱虫记录实体类
 * 对应数据库表：deworm_record
 * 记录宠物的驱虫历史信息
 */
public class DewormRecord {
    private Long id;                // 记录ID，主键，自增
    private Long userId;            // 用户ID，关联user表，记录是哪个用户的宠物
    private Long petId;             // 宠物ID，关联pet表，记录是哪只宠物
    private String type;            // 驱虫类型：体内驱虫/体外驱虫/体内外同驱
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date dewormDate;        // 驱虫日期，实际执行驱虫的日期
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date nextDewormDate;    // 下次驱虫日期，提醒用户下次驱虫时间
    private String medicine;        // 药品名称，使用的驱虫药名称
    private String remark;          // 备注，补充说明
    private Date createTime;        // 创建时间，记录添加时间

    // ========== Getter 和 Setter ==========
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Date getDewormDate() { return dewormDate; }
    public void setDewormDate(Date dewormDate) { this.dewormDate = dewormDate; }
    public Date getNextDewormDate() { return nextDewormDate; }
    public void setNextDewormDate(Date nextDewormDate) { this.nextDewormDate = nextDewormDate; }
    public String getMedicine() { return medicine; }
    public void setMedicine(String medicine) { this.medicine = medicine; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
}