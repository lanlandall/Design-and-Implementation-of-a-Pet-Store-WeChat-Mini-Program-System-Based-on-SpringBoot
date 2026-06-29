package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.Service;
import com.petmall.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 服务控制器（小程序端）
 */
@RestController
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    // ============================================================
    // 小程序端接口（无需管理员权限）
    // ============================================================

    /**
     * 获取所有服务（可按分类类型筛选）
     * GET /api/service/list?categoryType=1
     */
    @GetMapping("/api/service/list")
    public Result<List<Service>> getServiceList(@RequestParam(required = false) Integer categoryType) {
        if (categoryType != null) {
            return Result.success(serviceService.getServicesByCategoryType(categoryType));
        }
        return Result.success(serviceService.getAllServices());
    }

    /**
     * 根据分类获取服务
     * GET /api/service/category/{categoryId}
     */
    @GetMapping("/api/service/category/{categoryId}")
    public Result<List<Service>> getServicesByCategory(@PathVariable Long categoryId) {
        return Result.success(serviceService.getServicesByCategoryId(categoryId));
    }

    /**
     * 获取服务详情
     * GET /api/service/detail/{id}
     */
    @GetMapping("/api/service/detail/{id}")
    public Result<Service> getServiceDetail(@PathVariable Long id) {
        Service service = serviceService.getServiceById(id);
        if (service == null) {
            return Result.error("服务不存在");
        }
        return Result.success(service);
    }

    /**
     * 搜索服务
     * GET /api/service/search?keyword=xxx
     */
    @GetMapping("/api/service/search")
    public Result<List<Service>> searchServices(@RequestParam String keyword) {
        return Result.success(serviceService.searchServices(keyword));
    }

}