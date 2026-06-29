package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.Category;
import com.petmall.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import javax.servlet.http.HttpServletRequest;  // 添加这一行

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // ========== 小程序端接口（无需管理员权限）==========

    @GetMapping("/category/list")
    public Result<List<Category>> getCategoryList() {
        return Result.success(categoryService.getAllCategories());
    }

    @GetMapping("/category/petType/{petType}")
    public Result<List<Category>> getCategoriesByPetType(@PathVariable Integer petType) {
        return Result.success(categoryService.getCategoriesByPetType(petType));
    }

    // ========== 管理后台接口（需要管理员权限）==========

    @PostMapping("/admin/category")
    public Result<String> add(@RequestBody Category category, HttpServletRequest request) {
        // 校验管理员权限
        if (!isAdmin(request)) {
            return Result.error("无权限");
        }
        categoryService.addCategory(category);
        return Result.success("添加成功");
    }

    @PutMapping("/admin/category/{id}")
    public Result<String> update(@PathVariable Long id,
                               @RequestBody Category category,
                               HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error("无权限");
        }
        category.setId(id);
        categoryService.updateCategory(category);
        return Result.success("修改成功");
    }

    @DeleteMapping("/admin/category/{id}")
    public Result<String> delete(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error("无权限");
        }
        categoryService.deleteCategory(id);
        return Result.success("删除成功");
    }

    // 权限校验方法
    private boolean isAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "admin".equals(role);
    }
}