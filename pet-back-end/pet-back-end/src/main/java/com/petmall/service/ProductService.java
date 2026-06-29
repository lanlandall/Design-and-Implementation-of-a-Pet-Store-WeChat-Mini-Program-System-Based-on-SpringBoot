package com.petmall.service;

import com.petmall.entity.Product;
import com.petmall.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 商品业务层
 */
@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    // ============================================================
    // 小程序端方法
    // ============================================================

    /**
     * 分页查询商品列表（小程序端）
     */
    public List<Product> getProductsByPage(Integer petType, Long categoryId, int offset, int pageSize) {
        return productMapper.selectByPage(petType, categoryId, offset, pageSize);
    }

    /**
     * 搜索商品（分页）
     */
    public List<Product> searchProducts(String keyword, Integer petType, Long categoryId, int offset, int pageSize) {
        return productMapper.searchProducts(keyword, petType, categoryId, offset, pageSize);
    }

    /**
     * 统计搜索结果数量
     */
    public int countSearch(String keyword, Integer petType, Long categoryId) {
        return productMapper.countSearch(keyword, petType, categoryId);
    }

    /**
     * 获取商品总数（小程序端）
     */
    public int getProductsCount(Integer petType, Long categoryId) {
        return productMapper.countByCondition(petType, categoryId);
    }

    /**
     * 根据ID获取商品详情
     */
    public Product getProductById(Long id) {
        return productMapper.selectById(id);
    }

    /**
     * 根据分类获取商品
     */
    public List<Product> getProductsByCategory(Long categoryId) {
        return productMapper.selectByCategory(categoryId);
    }

    /**
     * 根据宠物类型获取商品
     */
    public List<Product> getProductsByPetType(Integer petType) {
        return productMapper.selectByPetType(petType);
    }

    /**
     * 搜索商品
     */
    public List<Product> searchProducts(String keyword) {
        return productMapper.searchByKeyword(keyword);
    }

    // ============================================================
    // 管理后台端方法
    // ============================================================

    /**
     * 分页查询商品列表（管理后台）
     */
    public List<Product> getProductsByPage(String name, Long categoryId, Integer petType,
                                                Integer status, int offset, int pageSize) {
        return productMapper.selectAdminByPage(name, categoryId, petType, status, offset, pageSize);
    }

    /**
     * 获取商品总数（管理后台）
     */
    public int countProducts(String name, Long categoryId, Integer petType, Integer status) {
        return productMapper.countProductsByCondition(name, categoryId, petType, status);
    }

    /**
     * 新增商品
     */
    @Transactional
    public boolean addProduct(Product product) {
        return productMapper.insert(product) > 0;
    }

    /**
     * 更新商品信息
     */
    @Transactional
    public boolean updateProduct(Product product) {
        return productMapper.update(product) > 0;
    }

    /**
     * 更新商品状态（上架/下架）
     */
    @Transactional
    public boolean updateProductStatus(Long id, Integer status) {
        return productMapper.updateStatus(id, status) > 0;
    }

    /**
     * 更新商品库存
     */
    @Transactional
    public boolean updateProductStock(Long id, Integer stock) {
        return productMapper.updateStock(id, stock) > 0;
    }

    /**
     * 删除商品
     */
    @Transactional
    public boolean deleteProduct(Long id) {
        return productMapper.deleteById(id) > 0;
    }

    /**
     * 检查商品是否有未完成订单
     */
    public boolean hasPendingOrders(Long productId) {
        return productMapper.countPendingOrdersByProductId(productId) > 0;
    }

    /**
     * 获取统计数据
     */
    public int countAllProducts() {
        return productMapper.countAll();
    }

    // ============================================================
    // 通用方法
    // ============================================================

    /**
     * 获取所有上架商品
     */
    public List<Product> getAllActiveProducts() {
        return productMapper.selectAllActive();
    }

    /**
     * 扣减库存
     */
    @Transactional
    public boolean decreaseStock(Long id, Integer quantity) {
        Product product = productMapper.selectById(id);
        if (product == null || product.getStock() < quantity) {
            return false;
        }
        return productMapper.decreaseStock(id, quantity) > 0;
    }

    /**
     * 增加库存
     */
    @Transactional
    public boolean increaseStock(Long id, Integer quantity) {
        return productMapper.increaseStock(id, quantity) > 0;
    }

    /**
     * 增加销量
     */
    @Transactional
    public boolean increaseSales(Long id, Integer quantity) {
        return productMapper.increaseSales(id, quantity) > 0;
    }

    /**
     * 检查商品名称是否存在
     */
    public boolean isNameExist(String name, Long excludeId) {
        return productMapper.countByName(name, excludeId) > 0;
    }
}