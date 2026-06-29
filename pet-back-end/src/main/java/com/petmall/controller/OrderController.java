package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.OrderItem;
import com.petmall.entity.Orders;
import com.petmall.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 订单控制器（小程序端）
 */
@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ============================================================
    // 小程序端 - 服务订单接口
    // ============================================================

    /**
     * 获取服务订单列表
     * GET /api/service/order/list?pageNum=1&pageSize=10&status=1
     */
    @GetMapping("/api/service/order/list")
    public Result<Map<String, Object>> getServiceOrders(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return Result.success(orderService.getUserServiceOrders(userId, status, pageNum, pageSize));
    }

    /**
     * 创建服务订单
     * POST /api/service/order/create
     */
    @PostMapping("/api/service/order/create")
    public Result<Orders> createServiceOrder(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }

        Long serviceId = Long.valueOf(params.get("serviceId").toString());
        Integer quantity = params.get("quantity") != null ?
                Integer.valueOf(params.get("quantity").toString()) : 1;
        String serviceTimeStr = (String) params.get("serviceTime");
        String remark = (String) params.get("remark");
        Long petId = params.get("petId") != null ?
                Long.valueOf(params.get("petId").toString()) : null;
        String petName = (String) params.get("petName");
        String receiverName = (String) params.get("receiverName");
        String receiverPhone = (String) params.get("receiverPhone");
        String address = (String) params.get("address");

        Date serviceTime;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            serviceTime = sdf.parse(serviceTimeStr);
        } catch (Exception e) {
            serviceTime = new Date();
        }

        Orders order = orderService.createServiceOrder(userId, serviceId, quantity,
                serviceTime, remark, petId, petName, receiverName, receiverPhone, address);
        return Result.success(order);
    }

    /**
     * 支付服务订单
     * POST /api/service/order/pay/{orderId}
     */
    @PostMapping("/api/service/order/pay/{orderId}")
    public Result<String> payServiceOrder(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }

        Orders order = orderService.getOrderById(orderId);
        if (order == null) {
            return Result.error("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            return Result.error("无权操作");
        }
        if (order.getStatus() != 0) {
            return Result.error("订单状态不正确，无法支付");
        }

        // 更新状态：待付款(0) → 待服务(11)
        boolean success = orderService.updateOrderStatus(orderId, 11, userId, "SERVICE");
        if (success) {
            // 记录支付时间
            orderService.updatePayTime(orderId, new Date());
            return Result.success("支付成功");
        }
        return Result.error("支付失败");
    }

    /**
     * 取消服务订单
     * PUT /api/service/order/cancel/{orderId}
     */
    @PutMapping("/api/service/order/cancel/{orderId}")
    public Result<String> cancelServiceOrder(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return cancelOrder(orderId, userId);
    }

    // ============================================================
    // 小程序端 - 商城订单接口
    // ============================================================

    /**
     * 获取商城订单列表
     * GET /api/product/order/list?pageNum=1&pageSize=10&status=1
     */
    @GetMapping("/api/product/order/list")
    public Result<Map<String, Object>> getProductOrders(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return Result.success(orderService.getUserProductOrders(userId, status, pageNum, pageSize));
    }

    /**
     * 创建商城订单
     * POST /api/product/order/create
     */
    @PostMapping("/api/product/order/create")
    public Result<Orders> createProductOrder(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }

        // 兼容两种传参方式
        List<Map<String, Object>> itemsMap;
        if (params.containsKey("items")) {
            // 方式1：传 items 数组
            itemsMap = (List<Map<String, Object>>) params.get("items");
        } else {
            // 方式2：传 productId 和 quantity（新增）
            itemsMap = new ArrayList<>();
            Map<String, Object> item = new HashMap<>();
            item.put("productId", params.get("productId"));
            item.put("quantity", params.get("quantity"));
            itemsMap.add(item);
        }

        String receiverName = (String) params.get("receiverName");
        String receiverPhone = (String) params.get("receiverPhone");
        String receiverAddress = (String) params.get("receiverAddress");
        String remark = (String) params.get("remark");

        List<OrderItem> items = new ArrayList<>();
        for (Map<String, Object> itemMap : itemsMap) {
            OrderItem item = new OrderItem();
            item.setProductId(Long.valueOf(itemMap.get("productId").toString()));
            item.setQuantity(Integer.valueOf(itemMap.get("quantity").toString()));
            // 商品名称、价格等信息会在 Service 层从数据库查询
            items.add(item);
        }

        Orders order = orderService.createProductOrder(userId, items, receiverName, receiverPhone, receiverAddress, remark);
        return Result.success(order);
    }


    /**
     * 支付商城订单（待付款 → 待发货）
     */
    @PostMapping("/api/product/order/pay/{orderId}")
    public Result<String> payProductOrder(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }

        Orders order = orderService.getOrderById(orderId);
        if (order == null) {
            return Result.error("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            return Result.error("无权操作");
        }
        if (order.getStatus() != 0) {
            return Result.error("订单状态不正确，无法支付");
        }

        boolean success = orderService.updateOrderStatus(orderId, 1, userId, "PRODUCT");
        if (success) {
            orderService.updatePayTime(orderId, new Date());
            return Result.success("支付成功");
        }
        return Result.error("支付失败");
    }

    /**
     * 取消商城订单
     * PUT /api/product/order/cancel/{orderId}
     */
    @PutMapping("/api/product/order/cancel/{orderId}")
    public Result<String> cancelProductOrder(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return cancelOrder(orderId, userId);
    }

    /**
     * 确认收货
     * PUT /api/product/order/confirm/{orderId}
     */
    @PutMapping("/api/product/order/confirm/{orderId}")
    public Result<String> confirmReceipt(@PathVariable Long orderId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        boolean success = orderService.updateOrderStatus(orderId, 4, userId, "PRODUCT");
        return success ? Result.success("确认收货成功") : Result.error("操作失败");
    }

    // ============================================================
    // 小程序端 - 订单通用接口
    // ============================================================

    /**
     * 获取订单详情
     * GET /api/order/detail/{id}?type=SERVICE 或 PRODUCT
     */
    @GetMapping("/api/order/detail/{id}")
    public Result<Map<String, Object>> getOrderDetail(
            @PathVariable Long id,
            @RequestParam(defaultValue = "PRODUCT") String type,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }

        Orders order = orderService.getOrderById(id);
        if (order == null || !order.getUserId().equals(userId)) {
            return Result.error("订单不存在");
        }

        List<OrderItem> items = orderService.getOrderItems(id);

        Map<String, Object> result = new HashMap<>();
        result.put("order", order);
        result.put("items", items);

        return Result.success(result);
    }

    /**
     * 获取所有订单列表（统一接口）
     * GET /api/order/list?pageNum=1&pageSize=10&orderType=SERVICE/PRODUCT/ALL&status=1
     */
    @GetMapping("/api/order/list")
    public Result<Map<String, Object>> getOrderList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) Integer status,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return Result.success(orderService.getUserOrders(userId, orderType, status, pageNum, pageSize));
    }

    // ============================================================
    // 通用取消订单方法
    // ============================================================

    private Result<String> cancelOrder(Long orderId, Long userId) {
        Orders order = orderService.getOrderById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            return Result.error("订单不存在");
        }

        // 允许取消的状态：待付款(0)、待确认(10)、待发货(1)、待服务(11)
        if (order.getStatus() != 0 && order.getStatus() != 10 && order.getStatus() != 1 && order.getStatus() != 11) {
            return Result.error("当前状态无法取消");
        }

        boolean success = orderService.cancelOrder(orderId);
        return success ? Result.success("取消成功") : Result.error("取消失败");
    }
}