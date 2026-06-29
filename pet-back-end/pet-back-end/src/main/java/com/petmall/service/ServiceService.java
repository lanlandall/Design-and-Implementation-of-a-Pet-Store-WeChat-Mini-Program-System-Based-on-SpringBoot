package com.petmall.service;

import com.petmall.entity.Service;
import com.petmall.mapper.ServiceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 服务业务层
 */
@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceMapper serviceMapper;

    // ============================================================
    // 小程序端方法
    // ============================================================

    /**
     * 获取所有上架的服务
     */
    public List<Service> getAllServices() {
        return serviceMapper.selectAll();
    }

    /**
     * 根据分类类型获取服务
     * @param categoryType 分类类型：1洗澡美容 2医疗健康 3寄养训练 4其他
     */
    public List<Service> getServicesByCategoryType(Integer categoryType) {
        return serviceMapper.selectByCategoryType(categoryType);
    }

    public List<Service> getServicesByCategoryId(Long categoryId) {
        return serviceMapper.selectByCategoryId(categoryId);
    }

    /**
     * 根据ID获取服务详情
     */
    public Service getServiceById(Long id) {
        return serviceMapper.selectById(id);
    }

    /**
     * 搜索服务（根据名称或描述）
     */
    public List<Service> searchServices(String keyword) {
        return serviceMapper.searchByKeyword(keyword);
    }

    // ============================================================
    // 管理后台端方法
    // ============================================================

    /**
     * 分页查询服务列表（支持筛选）
     */
    public List<Service> getServicesByPage(String name, Integer categoryType, Integer status, int offset, int pageSize) {
        return serviceMapper.selectByPage(name, categoryType, status, offset, pageSize);
    }

    /**
     * 获取服务总数（用于分页）
     */
    public int countServices(String name, Integer categoryType, Integer status) {
        return serviceMapper.countByCondition(name, categoryType, status);
    }

    /**
     * 新增服务
     */
    @Transactional
    public boolean addService(Service service) {
        // 设置默认值
        if (service.getStatus() == null) {
            service.setStatus(1);
        }
        if (service.getSales() == null) {
            service.setSales(0);
        }
        return serviceMapper.insert(service) > 0;
    }

    /**
     * 更新服务
     */
    @Transactional
    public boolean updateService(Service service) {
        return serviceMapper.update(service) > 0;
    }

    /**
     * 更新服务状态（上架/下架）
     */
    @Transactional
    public boolean updateServiceStatus(Long id, Integer status) {
        return serviceMapper.updateStatus(id, status) > 0;
    }

    /**
     * 删除服务
     */
    @Transactional
    public boolean deleteService(Long id) {
        return serviceMapper.deleteById(id) > 0;
    }

    /**
     * 检查服务是否有未完成订单
     */
    public boolean hasPendingOrders(Long serviceId) {
        return serviceMapper.countPendingOrdersByServiceId(serviceId) > 0;
    }

    /**
     * 获取统计数据
     */
    public int countAllServices() {
        return serviceMapper.countAll();
    }
}