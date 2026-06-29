package com.petmall.mapper;

import com.petmall.entity.Product;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 商品 Mapper
 */
@Mapper
public interface ProductMapper {

    // ============================================================
    // 小程序端查询
    // ============================================================

    /**
     * 分页查询（小程序端）
     */
    @Select("<script>" +
            "SELECT * FROM product WHERE status = 1" +
            "<if test='petType != null'> AND pet_type = #{petType}</if>" +
            "<if test='categoryId != null'> AND category_id = #{categoryId}</if>" +
            " ORDER BY sort_order ASC, id DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Product> selectByPage(@Param("petType") Integer petType,
                               @Param("categoryId") Long categoryId,
                               @Param("offset") int offset,
                               @Param("pageSize") int pageSize);

    /**
     * 搜索商品（分页）
     */
    @Select("<script>" +
            "SELECT * FROM product WHERE status = 1" +
            "<if test='keyword != null and keyword != \"\"'> AND name LIKE CONCAT('%', #{keyword}, '%')</if>" +
            "<if test='petType != null'> AND pet_type = #{petType}</if>" +
            "<if test='categoryId != null'> AND category_id = #{categoryId}</if>" +
            " ORDER BY id DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Product> searchProducts(@Param("keyword") String keyword,
                                 @Param("petType") Integer petType,
                                 @Param("categoryId") Long categoryId,
                                 @Param("offset") int offset,
                                 @Param("pageSize") int pageSize);

    /**
     * 统计搜索结果数量
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM product WHERE status = 1" +
            "<if test='keyword != null and keyword != \"\"'> AND name LIKE CONCAT('%', #{keyword}, '%')</if>" +
            "<if test='petType != null'> AND pet_type = #{petType}</if>" +
            "<if test='categoryId != null'> AND category_id = #{categoryId}</if>" +
            "</script>")
    int countSearch(@Param("keyword") String keyword,
                    @Param("petType") Integer petType,
                    @Param("categoryId") Long categoryId);

    /**
     * 统计数量（小程序端）
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM product WHERE status = 1" +
            "<if test='petType != null'> AND pet_type = #{petType}</if>" +
            "<if test='categoryId != null'> AND category_id = #{categoryId}</if>" +
            "</script>")
    int countByCondition(@Param("petType") Integer petType,
                         @Param("categoryId") Long categoryId);

    /**
     * 根据ID查询
     */
    @Select("SELECT * FROM product WHERE id = #{id}")
    Product selectById(@Param("id") Long id);

    /**
     * 根据分类查询
     */
    @Select("SELECT * FROM product WHERE category_id = #{categoryId} AND status = 1 ORDER BY sort_order ASC, id DESC")
    List<Product> selectByCategory(@Param("categoryId") Long categoryId);

    /**
     * 根据宠物类型查询
     */
    @Select("SELECT * FROM product WHERE pet_type = #{petType} AND status = 1 ORDER BY sort_order ASC, id DESC")
    List<Product> selectByPetType(@Param("petType") Integer petType);

    /**
     * 关键词搜索
     */
    @Select("SELECT * FROM product WHERE status = 1 AND (name LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%')) ORDER BY sales DESC, id DESC")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 查询所有上架商品
     */
    @Select("SELECT * FROM product WHERE status = 1 ORDER BY sort_order ASC, id DESC")
    List<Product> selectAllActive();

    // ============================================================
    // 管理后台端查询
    // ============================================================

    /**
     * 分页查询（管理后台）
     */
    @Select("<script>" +
            "SELECT * FROM product WHERE 1=1" +
            "<if test='name != null and name != \"\"'> AND name LIKE CONCAT('%', #{name}, '%')</if>" +
            "<if test='categoryId != null'> AND category_id = #{categoryId}</if>" +
            "<if test='petType != null'> AND pet_type = #{petType}</if>" +
            "<if test='status != null'> AND status = #{status}</if>" +
            " ORDER BY id DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Product> selectAdminByPage(@Param("name") String name,
                                    @Param("categoryId") Long categoryId,
                                    @Param("petType") Integer petType,
                                    @Param("status") Integer status,
                                    @Param("offset") int offset,
                                    @Param("pageSize") int pageSize);

    /**
     * 统计数量（管理后台）
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM product WHERE 1=1" +
            "<if test='name != null and name != \"\"'> AND name LIKE CONCAT('%', #{name}, '%')</if>" +
            "<if test='categoryId != null'> AND category_id = #{categoryId}</if>" +
            "<if test='petType != null'> AND pet_type = #{petType}</if>" +
            "<if test='status != null'> AND status = #{status}</if>" +
            "</script>")
    int countProductsByCondition(@Param("name") String name,
                              @Param("categoryId") Long categoryId,
                              @Param("petType") Integer petType,
                              @Param("status") Integer status);

    /**
     * 获取统计数据
     */
    @Select("SELECT COUNT(*) FROM product")
    int countAll();

    /**
     * 检查名称是否存在
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM product WHERE name = #{name}" +
            "<if test='excludeId != null'> AND id != #{excludeId}</if>" +
            "</script>")
    int countByName(@Param("name") String name, @Param("excludeId") Long excludeId);

    /**
     * 检查商品是否有未完成订单
     */
    @Select("SELECT COUNT(*) FROM order_item oi LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi.product_id = #{productId} AND o.order_type = 'PRODUCT' AND o.status IN (0, 1, 2)")
    int countPendingOrdersByProductId(@Param("productId") Long productId);

    // ============================================================
    // 增删改操作
    // ============================================================

    /**
     * 新增商品
     */
    @Insert("INSERT INTO product(category_id, pet_type, name, description, price, original_price, " +
            "image_url, stock, sales, status, sort_order, create_time) " +
            "VALUES(#{categoryId}, #{petType}, #{name}, #{description}, #{price}, #{originalPrice}, " +
            "#{imageUrl}, #{stock}, #{sales}, #{status}, #{sortOrder}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Product product);

    /**
     * 更新商品
     */
    @Update("UPDATE product SET " +
            "category_id = #{categoryId}, " +
            "pet_type = #{petType}, " +
            "name = #{name}, " +
            "description = #{description}, " +
            "price = #{price}, " +
            "original_price = #{originalPrice}, " +
            "image_url = #{image_url}, " +
            "sort_order = #{sortOrder}, " +
            "update_time = NOW() " +
            "WHERE id = #{id}")
    int update(Product product);

    /**
     * 更新状态
     */
    @Update("UPDATE product SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 更新库存
     */
    @Update("UPDATE product SET stock = #{stock}, update_time = NOW() WHERE id = #{id}")
    int updateStock(@Param("id") Long id, @Param("stock") Integer stock);

    /**
     * 扣减库存
     */
    @Update("UPDATE product SET stock = stock - #{quantity}, sales = sales + #{quantity}, update_time = NOW() WHERE id = #{id} AND stock >= #{quantity}")
    int decreaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);

    /**
     * 增加库存（退款时恢复）
     */
    @Update("UPDATE product SET stock = stock + #{quantity} WHERE id = #{productId}")
    int increaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    /**
     * 增加销量
     */
    @Update("UPDATE product SET sales = sales + #{quantity}, update_time = NOW() WHERE id = #{id}")
    int increaseSales(@Param("id") Long id, @Param("quantity") Integer quantity);

    /**
     * 删除商品
     */
    @Delete("DELETE FROM product WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}