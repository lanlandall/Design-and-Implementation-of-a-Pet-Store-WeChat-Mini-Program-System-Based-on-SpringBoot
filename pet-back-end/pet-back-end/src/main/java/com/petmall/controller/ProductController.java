package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.Product;
import com.petmall.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品控制器（小程序用）
 */
@RestController
@RequestMapping("/api/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * 获取商品列表（支持分页和筛选）
     * GET /api/product/list?pageNum=1&pageSize=10&petType=1&categoryId=1
     */
    @GetMapping("/list")
    public Result<Map<String, Object>> getProductList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer petType,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {

        // 计算偏移量
        int offset = (pageNum - 1) * pageSize;

        // 查询商品列表
        List<Product> products = productService.getProductsByPage(petType, categoryId, offset, pageSize);
        int total = productService.getProductsCount(petType, categoryId);

        // 如果有搜索关键词，进行模糊搜索
        if (keyword != null && !keyword.trim().isEmpty()) {
            products = productService.searchProducts(keyword, petType, categoryId, offset, pageSize);
            total = productService.countSearch(keyword, petType, categoryId);
        } else {
            // 否则按分类筛选
            products = productService.getProductsByPage(petType, categoryId, offset, pageSize);
            total = productService.getProductsCount(petType, categoryId);
        }

        // 封装分页结果
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
    @GetMapping("/detail/{id}")
    public Result<Product> getProductDetail(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        return Result.success(product);
    }

    /**
     * 根据分类获取商品
     */
    @GetMapping("/category/{categoryId}")
    public Result<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return Result.success(productService.getProductsByCategory(categoryId));
    }

    /**
     * 根据宠物类型获取商品
     */
    @GetMapping("/petType/{petType}")
    public Result<List<Product>> getProductsByPetType(@PathVariable Integer petType) {
        return Result.success(productService.getProductsByPetType(petType));
    }

    /**
     * 搜索商品
     */
    @GetMapping("/search")
    public Result<List<Product>> searchProducts(@RequestParam String keyword) {
        return Result.success(productService.searchProducts(keyword));
    }
}