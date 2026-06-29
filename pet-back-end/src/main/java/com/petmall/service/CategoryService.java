package com.petmall.service;

import com.petmall.entity.Category;
import com.petmall.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 分类业务逻辑层
 */
@Service
public class CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    /**
     * 获取所有分类
     */
    public List<Category> getAllCategories() {
        return categoryMapper.selectAll();
    }

    /**
     * 根据宠物类型获取分类
     */
    public List<Category> getCategoriesByPetType(Integer petType) {
        return categoryMapper.selectByPetType(petType);
    }

    /**
     * 根据ID获取分类
     */
    public Category getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    /**
     * 添加分类
     */
    public boolean addCategory(Category category) {
        return categoryMapper.insert(category) > 0;
    }

    /**
     * 更新分类
     */
    public boolean updateCategory(Category category) {
        return categoryMapper.update(category) > 0;
    }

    /**
     * 删除分类
     */
    public boolean deleteCategory(Long id) {
        return categoryMapper.deleteById(id) > 0;
    }
}