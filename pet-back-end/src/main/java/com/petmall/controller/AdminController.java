package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.*;
import com.petmall.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商家管理控制器（Web后台用）
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private PetService petService;


    // ==================== 用户管理 ====================

    /**
     * 获取用户列表
     */
    @GetMapping("/users")
    public Result<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        List<User> users = userService.getUsersByPage(pageNum, pageSize);
        int total = userService.countAllUsers();

        Map<String, Object> result = new HashMap<>();
        result.put("list", users);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);

        return Result.success(result);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/users/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }

    /**
     * 新增用户
     */
    @PostMapping("/users")
    public Result<User> createUser(@RequestBody User user) {
        boolean success = userService.addUser(user);
        return success ? Result.success(user) : Result.error("添加失败");
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/users/{id}")
    public Result<String> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        boolean success = userService.updateProfile(user);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 更新用户状态（启用/禁用）
     */
    @PutMapping("/users/{id}/status")
    public Result<String> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        boolean success = userService.updateUserStatus(id, status);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }


    /**
     * 删除用户
     */
    @DeleteMapping("/users/{id}")
    public Result<String> deleteUser(@PathVariable Long id) {
        boolean success = userService.deleteUser(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }

    // ==================== 宠物管理 ====================

    /**
     * 获取所有宠物
     */
    @GetMapping("/pets")
    public Result<Map<String, Object>> getPets(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        List<Pet> pets = petService.getPetsByPage(pageNum, pageSize);
        int total = petService.countAllPets();

        Map<String, Object> result = new HashMap<>();
        result.put("list", pets);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);

        return Result.success(result);
    }

    /**
     * 获取宠物详情
     */
    @GetMapping("/pets/{id}")
    public Result<Pet> getPetById(@PathVariable Long id) {
        Pet pet = petService.getPetById(id);
        if (pet == null) {
            return Result.error("宠物不存在");
        }
        return Result.success(pet);
    }

    /**
     * 新增宠物
     */
    @PostMapping("/pets")
    public Result<Pet> createPet(@RequestBody Pet pet) {
        boolean success = petService.addPet(pet);
        return success ? Result.success(pet) : Result.error("添加失败");
    }

    /**
     * 更新宠物信息
     */
    @PutMapping("/pets/{id}")
    public Result<String> updatePet(@PathVariable Long id, @RequestBody Pet pet) {
        pet.setId(id);
        boolean success = petService.updatePet(pet);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 更新宠物状态（启用/禁用）
     */
    @PutMapping("/pets/{id}/status")
    public Result<String> updatePetStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        boolean success = petService.updatePetStatus(id, status);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 获取指定用户的所有宠物
     */
    @GetMapping("/users/{userId}/pets")
    public Result<List<Pet>> getUserPets(@PathVariable Long userId) {
        List<Pet> pets = petService.getUserPets(userId);
        return Result.success(pets);
    }

    /**
     * 删除宠物
     */
    @DeleteMapping("/pets/{id}")
    public Result<String> deletePet(@PathVariable Long id) {
        boolean success = petService.deletePet(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }


    // ==================== 商品管理 ====================

    /**
     * 获取商品列表（分页）
     */
    @GetMapping("/products")
    public Result<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer petType,
            @RequestParam(required = false) Integer status) {

        int offset = (pageNum - 1) * pageSize;
        List<Product> products = productService.getProductsByPage(name, categoryId, petType, status, offset, pageSize);
        int total = productService.countProducts(name, categoryId, petType, status);

        Map<String, Object> result = new HashMap<>();
        result.put("list", products);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);

        return Result.success(result);
    }

    /**
     * 获取商品详情
     */
    @GetMapping("/products/{id}")
    public Result<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        return Result.success(product);
    }

    /**
     * 添加商品
     */
    @PostMapping("/products")
    public Result<String> addProduct(@RequestBody Product product) {
        boolean success = productService.addProduct(product);
        return success ? Result.success("添加成功") : Result.error("添加失败");
    }

    /**
     * 更新商品信息
     */
    @PutMapping("/products/{id}")
    public Result<String> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        boolean success = productService.updateProduct(product);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 更新商品状态（上架/下架）
     */
    @PutMapping("/products/{id}/status")
    public Result<String> updateProductStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        if (status == null) {
            return Result.error("状态不能为空");
        }
        boolean success = productService.updateProductStatus(id, status);
        return success ? Result.success("状态更新成功") : Result.error("状态更新失败");
    }

    /**
     * 更新商品库存
     */
    @PutMapping("/products/{id}/stock")
    public Result<String> updateProductStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer stock = body.get("stock");
        if (stock == null || stock < 0) {
            return Result.error("库存不能为空或负数");
        }
        boolean success = productService.updateProductStock(id, stock);
        return success ? Result.success("库存更新成功") : Result.error("库存更新失败");
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/products/{id}")
    public Result<String> deleteProduct(@PathVariable Long id) {
        boolean hasOrder = productService.hasPendingOrders(id);
        if (hasOrder) {
            return Result.error("该商品有未完成订单，无法删除");
        }
        boolean success = productService.deleteProduct(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }

    // ==================== 服务管理 ====================

    /**
     * 获取服务列表（分页）
     */
    @GetMapping("/services")
    public Result<Map<String, Object>> getServices(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryType,  // 静态分类类型：1洗澡美容 2医疗健康 3寄养训练 4其他
            @RequestParam(required = false) Integer status) {

        int offset = (pageNum - 1) * pageSize;  // offset 计算
        List<Service> services = serviceService.getServicesByPage(name, categoryType, status, offset, pageSize);
        int total = serviceService.countServices(name, categoryType, status);

        Map<String, Object> result = new HashMap<>();
        result.put("list", services);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);

        return Result.success(result);
    }

    /**
     * 添加服务
     */
    @PostMapping("/services")
    public Result<Service> addService(@RequestBody Service service) {
        boolean success = serviceService.addService(service);
        return success ? Result.success(service) : Result.error("添加失败");
    }

    /**
     * 更新服务信息
     */
    @PutMapping("/services/{id}")
    public Result<String> updateService(@PathVariable Long id, @RequestBody Service service) {
        service.setId(id);
        boolean success = serviceService.updateService(service);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 更新服务状态
     */
    @PutMapping("/services/{id}/status")
    public Result<String> updateServiceStatus(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        boolean success = serviceService.updateServiceStatus(id, status);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 删除服务
     */
    @DeleteMapping("/services/{id}")
    public Result<String> deleteService(@PathVariable Long id) {
        // 检查是否有未完成的服务订单关联
        boolean hasOrder = serviceService.hasPendingOrders(id);
        if (hasOrder) {
            return Result.error("该服务有未完成订单，无法删除");
        }
        boolean success = serviceService.deleteService(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }


    // ==================== 订单管理（管理后台）====================

    /**
     * 获取订单列表（分页筛选）
     */
    @GetMapping("/orders")
    public Result<Map<String, Object>> getOrders(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {

        int offset = (pageNum - 1) * pageSize;
        List<Orders> orders = orderService.getOrders(orderType, status, keyword, offset, pageSize);
        int total = orderService.countOrders(orderType, status, keyword);

        Map<String, Object> result = new HashMap<>();
        result.put("list", orders);
        result.put("total", total);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return Result.success(result);
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/orders/{id}")
    public Result<Map<String, Object>> getOrderDetail(@PathVariable Long id) {
        Orders order = orderService.getOrderById(id);
        if (order == null) {
            return Result.error("订单不存在");
        }
        List<OrderItem> items = orderService.getOrderItems(id);

        Map<String, Object> result = new HashMap<>();
        result.put("order", order);
        result.put("items", items);

        return Result.success(result);
    }

    // ========== 商城订单特有操作 ==========

    /**
     * 商城订单发货
     */
    @PutMapping("/orders/product/{id}/ship")
    public Result<String> shipProductOrder(@PathVariable Long id) {
        boolean success = orderService.shipProductOrder(id);
        return success ? Result.success("发货成功") : Result.error("发货失败");
    }

    /**
     * 完成商城订单
     */
    @PutMapping("/orders/product/{id}/complete")
    public Result<String> completeProductOrder(@PathVariable Long id) {
        boolean success = orderService.completeProductOrder(id);
        return success ? Result.success("订单已完成") : Result.error("操作失败");
    }

    /**
     * 取消商城订单
     */
    @PutMapping("/orders/product/{id}/cancel")
    public Result<String> cancelProductOrder(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        boolean success = orderService.cancelProductOrder(id, reason);
        return success ? Result.success("订单已取消") : Result.error("取消失败");
    }

// ========== 服务订单特有操作 ==========

    /**
     * 确认服务订单
     */
    // 1. 商家确认订单（待确认 → 待付款）
    @PutMapping("/orders/service/{id}/confirm-order")
    public Result<String> confirmOrder(@PathVariable Long id) {
        boolean success = orderService.confirmOrder(id);
        return success ? Result.success("订单已确认") : Result.error("操作失败");
    }

    // 2. 商家开始服务（待服务 → 服务中）
    @PutMapping("/orders/service/{id}/start")
    public Result<String> startService(@PathVariable Long id) {
        boolean success = orderService.startService(id);
        return success ? Result.success("已开始服务") : Result.error("操作失败");
    }

    // 3. 商家完成服务（服务中 → 已完成）
    @PutMapping("/orders/service/{id}/complete")
    public Result<String> completeService(@PathVariable Long id) {
        boolean success = orderService.completeService(id);
        return success ? Result.success("服务已完成") : Result.error("操作失败");
    }


    /**
     * 取消服务订单
     */
    @PutMapping("/orders/service/{id}/cancel")
    public Result<String> cancelServiceOrder(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        boolean success = orderService.cancelServiceOrder(id, reason);
        return success ? Result.success("订单已取消") : Result.error("取消失败");
    }

    /**
     * 商城订单退款（商家直接退款）
     */
    @PostMapping("/orders/product/{id}/refund")
    public Result<String> productRefund(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        boolean success = orderService.productRefund(id, reason);
        return success ? Result.success("退款成功") : Result.error("退款失败");
    }

    /**
     * 服务订单退款（商家直接退款）
     */
    @PostMapping("/orders/service/{id}/refund")
    public Result<String> serviceRefund(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        boolean success = orderService.serviceRefund(id, reason);
        return success ? Result.success("退款成功") : Result.error("退款失败");
    }

    /**
     * 获取今日订单
     */
    @GetMapping("/orders/today")
    public Result<Map<String, Object>> getTodayOrders() {
        List<Orders> orders = orderService.getTodayOrders();
        Map<String, Object> result = new HashMap<>();
        result.put("list", orders);
        result.put("total", orders.size());
        return Result.success(result);
    }


    // ==================== 统计数据 ====================

    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productService.countAllProducts());
        stats.put("totalServices", serviceService.countAllServices());
        stats.put("totalUsers", userService.countAllUsers());
        stats.put("totalPets", petService.countAllPets());

        // 订单统计（通过 Service 调用）
        stats.put("todayCount", orderService.countTodayOrders());
        stats.put("todayAmount", orderService.sumTodayAmount());
        stats.put("pendingCount", orderService.countPendingOrders());
        stats.put("statusCount", orderService.countByStatus());
        stats.put("monthAmount", orderService.sumMonthAmount());
        stats.put("totalOrders", orderService.countOrders());
        stats.put("totalIncome", orderService.sumTotalIncome());

        return Result.success(stats);
    }
}