package com.petmall.service;

import com.petmall.entity.OrderItem;
import com.petmall.entity.Orders;
import com.petmall.entity.Product;
import com.petmall.entity.Service;
import com.petmall.mapper.OrderItemMapper;
import com.petmall.mapper.OrderMapper;
import com.petmall.mapper.ProductMapper;
import com.petmall.mapper.ServiceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 订单业务层
 */
@org.springframework.stereotype.Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ServiceMapper serviceMapper;

    // ============================================================
    // 订单号生成
    // ============================================================

    /**
     * 生成订单号
     */
    private String generateOrderNo(String prefix) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String timestamp = sdf.format(new Date());
        int random = (int) (Math.random() * 10000);
        return prefix + timestamp + String.format("%04d", random);
    }

    // ============================================================
    // 小程序端 - 服务订单
    // ============================================================

    /**
     * 创建服务订单
     */
    @Transactional
    public Orders createServiceOrder(Long userId, Long serviceId, Integer quantity,
                                     Date serviceTime, String remark, Long petId, String petName,
                                     String receiverName, String receiverPhone, String address) {
        Service service = serviceMapper.selectById(serviceId);
        if (service == null) {
            throw new RuntimeException("服务不存在");
        }
        if (service.getStatus() != 1) {
            throw new RuntimeException("服务已下架");
        }

        // 计算总金额
        BigDecimal totalAmount = service.getPrice().multiply(new BigDecimal(quantity));

        // 创建订单
        Orders order = new Orders();
        order.setOrderNo(generateOrderNo("S"));
        order.setUserId(userId);
        order.setOrderType("SERVICE");
        order.setTotalAmount(totalAmount);
        order.setStatus(10); // 待确认状态
        order.setServiceTime(serviceTime);
        order.setRemark(remark);
        order.setPetId(petId);
        order.setPetName(petName);
        order.setCreateTime(new Date());
        order.setReceiverName(receiverName);
        order.setReceiverPhone(receiverPhone);
        order.setReceiverAddress(address);

        orderMapper.insert(order);

        // 创建订单项
        OrderItem item = new OrderItem();
        item.setOrderId(order.getId());
        item.setProductId(serviceId);
        item.setName(service.getName());
        item.setPrice(service.getPrice());
        item.setQuantity(quantity);
        item.setTotalPrice(totalAmount);
        item.setImage(service.getImageUrl());

        orderItemMapper.insert(item);

        return order;
    }

    /**
     * 获取用户服务订单列表
     */
    public Map<String, Object> getUserServiceOrders(Long userId, Integer status, Integer pageNum, Integer pageSize) {
        int offset = (pageNum - 1) * pageSize;
        List<Orders> orders = orderMapper.selectUserOrdersByType(userId, "SERVICE", status, offset, pageSize);
        int total = orderMapper.countUserOrdersByType(userId, "SERVICE", status);

        // 填充订单项
        for (Orders order : orders) {
            List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
            order.setItems(items);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", orders);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    /**
     * 更新支付时间
     */
    @Transactional
    public boolean updatePayTime(Long orderId, Date payTime) {
        return orderMapper.updatePayTime(orderId, payTime) > 0;
    }

    // ============================================================
    // 小程序端 - 商城订单
    // ============================================================

    /**
     * 创建商城订单
     */
    @Transactional
    public Orders createProductOrder(Long userId, List<OrderItem> items,
                                     String receiverName, String receiverPhone,
                                     String receiverAddress, String remark) {
        // 计算总金额并校验库存
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItem item : items) {
            Product product = productMapper.selectById(item.getProductId());
            if (product == null) {
                throw new RuntimeException("商品不存在: " + item.getName());
            }
            if (product.getStatus() != 1) {
                throw new RuntimeException("商品已下架: " + product.getName());
            }
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("商品库存不足: " + product.getName());
            }

            item.setName(product.getName());  // 确保这行代码存在
            item.setPrice(product.getPrice());
            item.setTotalPrice(product.getPrice().multiply(new BigDecimal(item.getQuantity())));
            item.setImage(product.getImageUrl());
            totalAmount = totalAmount.add(item.getTotalPrice());
            // 扣减库存
            productMapper.decreaseStock(product.getId(), item.getQuantity());
        }

        // 创建订单
        Orders order = new Orders();
        order.setOrderNo(generateOrderNo("M"));
        order.setUserId(userId);
        order.setOrderType("PRODUCT");
        order.setTotalAmount(totalAmount);
        order.setStatus(0); // 待付款
        order.setReceiverName(receiverName);
        order.setReceiverPhone(receiverPhone);
        order.setReceiverAddress(receiverAddress);
        order.setRemark(remark);
        order.setCreateTime(new Date());

        orderMapper.insert(order);

        // 保存订单项
        for (OrderItem item : items) {
            item.setOrderId(order.getId());
            orderItemMapper.insert(item);
        }

        return order;
    }



    /**
     * 获取用户商城订单列表
     */
    public Map<String, Object> getUserProductOrders(Long userId, Integer status, Integer pageNum, Integer pageSize) {
        int offset = (pageNum - 1) * pageSize;
        List<Orders> orders = orderMapper.selectUserOrdersByType(userId, "PRODUCT", status, offset, pageSize);
        int total = orderMapper.countUserOrdersByType(userId, "PRODUCT", status);

        // 填充订单项
        for (Orders order : orders) {
            List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
            order.setItems(items);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", orders);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    // ============================================================
    // 小程序端 - 通用订单
    // ============================================================

    /**
     * 根据ID获取订单
     */
    public Orders getOrderById(Long orderId) {
        return orderMapper.selectById(orderId);
    }

    /**
     * 获取订单项列表
     */
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemMapper.selectByOrderId(orderId);
    }

    /**
     * 获取用户所有订单
     */
    public Map<String, Object> getUserOrders(Long userId, String orderType, Integer status, Integer pageNum, Integer pageSize) {
        int offset = (pageNum - 1) * pageSize;
        List<Orders> orders = orderMapper.selectUserOrders(userId, orderType, status, offset, pageSize);
        int total = orderMapper.countUserOrders(userId, orderType, status);

        // 填充订单项
        for (Orders order : orders) {
            List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
            order.setItems(items);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", orders);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    /**
     * 取消订单
     */
    @Transactional
    public boolean cancelOrder(Long orderId) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) {
            return false;
        }

        System.out.println("取消订单 - 订单ID: " + orderId + ", 类型: " + order.getOrderType() + ", 当前状态: " + order.getStatus());

        // 服务订单：直接取消，状态改为 4（已取消）
        if ("SERVICE".equals(order.getOrderType())) {
            int result = orderMapper.updateStatus(orderId, 4);
            System.out.println("服务订单取消结果: " + result);
            return result > 0;
        }

        // 商城订单：恢复库存后取消
        if ("PRODUCT".equals(order.getOrderType())) {
            if (order.getStatus() >= 1 && order.getStatus() != 4) {
                List<OrderItem> items = orderItemMapper.selectByOrderId(orderId);
                for (OrderItem item : items) {
                    productMapper.increaseStock(item.getProductId(), item.getQuantity());
                }
            }
            int result = orderMapper.updateStatus(orderId, 4);
            System.out.println("商城订单取消结果: " + result);
            return result > 0;
        }

        return false;
    }

    /**
     * 更新订单状态
     */
    @Transactional
    public boolean updateOrderStatus(Long orderId, Integer status, Long userId, String orderType) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) {
            return false;
        }
        if (!order.getUserId().equals(userId)) {
            return false;
        }
        if (!order.getOrderType().equals(orderType)) {
            return false;
        }
        return orderMapper.updateStatus(orderId, status) > 0;
    }

    // ============================================================
    // 管理后台端
    // ============================================================

    /**
     * 获取订单列表（管理后台）
     */
    public List<Orders> getOrders(String orderType, Integer status, String keyword, int offset, int pageSize) {
        List<Orders> orders = orderMapper.selectAdminOrders(orderType, status, keyword, offset, pageSize);
        for (Orders order : orders) {
            List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
            order.setItems(items);
        }
        return orders;
    }

    /**
     * 统计订单数量（管理后台）
     */
    public int countOrders(String orderType, Integer status, String keyword) {
        return orderMapper.countOrders(orderType, status, keyword);
    }

    // ============================================================
    // 管理后台端 - 商城订单特有操作
    // ============================================================

    /**
     * 商城订单发货
     */
    @Transactional
    public boolean shipProductOrder(Long orderId) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null || !"PRODUCT".equals(order.getOrderType())) {
            return false;
        }
        if (order.getStatus() != 1) {
            return false; // 只有待发货状态才能发货
        }
        return orderMapper.updateStatus(orderId, 2) > 0; // 2=待收货
    }

    /**
     * 完成商城订单
     */
    @Transactional
    public boolean completeProductOrder(Long orderId) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null || !"PRODUCT".equals(order.getOrderType())) {
            return false;
        }
        if (order.getStatus() != 2) {
            return false; // 只有待收货状态才能完成
        }
        return orderMapper.updateStatus(orderId, 3) > 0; // 3=已完成
    }

    /**
     * 取消商城订单（商家取消）
     */
    @Transactional
    public boolean cancelProductOrder(Long orderId, String reason) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null || !"PRODUCT".equals(order.getOrderType())) {
            return false;
        }
        if (order.getStatus() == 3 || order.getStatus() == -1) {
            return false; // 已完成或已取消的不能取消
        }
        // 已付款的恢复库存
        if (order.getStatus() >= 1) {
            List<OrderItem> items = orderItemMapper.selectByOrderId(orderId);
            for (OrderItem item : items) {
                productMapper.increaseStock(item.getProductId(), item.getQuantity());
            }
        }
        return orderMapper.updateStatus(orderId, -1) > 0;
    }

    // ============================================================
    // 管理后台端 - 服务订单特有操作
    // ============================================================

    /**
     * 商家确认订单（待确认10 → 待付款0）
     */
    @Transactional
    public boolean confirmOrder(Long orderId) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) return false;
        if (!"SERVICE".equals(order.getOrderType())) return false;
        if (order.getStatus() != 10) return false;
        return orderMapper.updateStatus(orderId, 0) > 0;
    }

    /**
     * 商家开始服务（待服务11 → 服务中12）
     */
    @Transactional
    public boolean startService(Long orderId) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) return false;
        if (!"SERVICE".equals(order.getOrderType())) return false;
        if (order.getStatus() != 11) return false;
        return orderMapper.updateStatus(orderId, 12) > 0;
    }

    /**
     * 商家完成服务（服务中12 → 已完成13）
     */
    @Transactional
    public boolean completeService(Long orderId) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) return false;
        if (!"SERVICE".equals(order.getOrderType())) return false;
        if (order.getStatus() != 12) return false;
        return orderMapper.updateStatus(orderId, 13) > 0;
    }

    /**
     * 取消服务订单（商家取消）
     */
    @Transactional
    public boolean cancelServiceOrder(Long orderId, String reason) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null || !"SERVICE".equals(order.getOrderType())) {
            return false;
        }
        if (order.getStatus() == 13 || order.getStatus() == -1) {
            return false; // 已完成或已取消的不能取消
        }
        return orderMapper.updateStatus(orderId, -1) > 0;
    }

    /**
     * 商城订单退款
     */
    @Transactional
    public boolean productRefund(Long orderId, String reason) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) return false;
        if (!"PRODUCT".equals(order.getOrderType())) return false;
        // 只有已付款的订单才能退款：待发货(1)、已发货(2)、已完成(3)
        if (order.getStatus() != 1 && order.getStatus() != 2 && order.getStatus() != 3) {
            return false;
        }

        // 恢复库存
        List<OrderItem> items = orderItemMapper.selectByOrderId(orderId);
        for (OrderItem item : items) {
            productMapper.increaseStock(item.getProductId(), item.getQuantity());
        }

        // 更新订单状态为已退款(4) 或 已取消(-1)
        return orderMapper.updateStatus(orderId, 4) > 0;
    }

    /**
     * 服务订单退款
     */
    @Transactional
    public boolean serviceRefund(Long orderId, String reason) {
        Orders order = orderMapper.selectById(orderId);
        if (order == null) return false;
        if (!"SERVICE".equals(order.getOrderType())) return false;
        // 待服务(11)、服务中(12)可以退款
        if (order.getStatus() != 11 && order.getStatus() != 12) {
            return false;
        }
        return orderMapper.updateStatus(orderId, 16) > 0; // 16=已退款
    }

    // ============================================================
    // 统计数据
    // ============================================================

    /**
     * 获取订单统计
     */
    public int countOrders() {
        return orderMapper.countOrders(null, null, null);
    }

    public int countTodayOrders() {
        return orderMapper.countTodayOrders();
    }

    public BigDecimal sumTodayAmount() {
        BigDecimal amount = orderMapper.sumTodayAmount();
        return amount != null ? amount : BigDecimal.ZERO;
    }

    public int countPendingOrders() {
        return orderMapper.countOrders(null, 0, null)
                + orderMapper.countOrders(null, 1, null);
    }

    public List<Map<String, Object>> countByStatus() {
        return orderMapper.countByStatus();
    }

    public BigDecimal sumMonthAmount() {
        BigDecimal amount = orderMapper.sumMonthAmount();
        return amount != null ? amount : BigDecimal.ZERO;
    }

    public BigDecimal sumTotalIncome() {
        BigDecimal income = orderMapper.sumTotalIncome();
        return income != null ? income : BigDecimal.ZERO;
    }

    /**
     * 获取今日订单列表
     */
    public List<Orders> getTodayOrders() {
        List<Orders> orders = orderMapper.selectTodayOrders();
        for (Orders order : orders) {
            List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());
            order.setItems(items);
        }
        return orders;
    }

    // ============================================================
    // 用户端订单数量统计
    // ============================================================

    /**
     * 获取用户各状态订单数量
     */
    public Map<String, Integer> getUserOrderCountByStatus(Long userId) {
        Map<String, Integer> countMap = new HashMap<>();

        // 待付款
        countMap.put("pendingPayment", orderMapper.countUserOrdersByStatus(userId, 0));
        // 待发货/待服务
        countMap.put("pendingService", orderMapper.countUserOrdersByStatus(userId, 1));
        // 待收货/进行中
        countMap.put("inProgress", orderMapper.countUserOrdersByStatus(userId, 2));
        // 待评价
        countMap.put("pendingReview", orderMapper.countUserOrdersByStatus(userId, 3));
        // 已完成
        countMap.put("completed", orderMapper.countUserOrdersByStatus(userId, 4));

        return countMap;
    }

    /**
     * 获取用户订单总数
     */
    public int getUserOrderCount(Long userId) {
        return orderMapper.countUserOrders(userId, null, null);
    }
}