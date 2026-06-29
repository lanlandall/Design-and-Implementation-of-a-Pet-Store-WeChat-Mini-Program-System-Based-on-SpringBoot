package com.petmall.mapper;

import com.petmall.entity.Service;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 服务 Mapper
 */
@Mapper
public interface ServiceMapper {

    // ============================================================
    // 小程序端查询
    // ============================================================

    /**
     * 查询所有上架服务
     */
    @Select("SELECT * FROM service WHERE status = 1 ORDER BY id DESC")
    List<Service> selectAll();

    /**
     * 根据分类类型查询
     */
    @Select("SELECT * FROM service WHERE category_type = #{categoryType} AND status = 1 ORDER BY id DESC")
    List<Service> selectByCategoryType(@Param("categoryType") Integer categoryType);

    @Select("SELECT * FROM service WHERE category_id = #{categoryId} AND status = 1 ORDER BY id DESC")
    List<Service> selectByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * 根据ID查询
     */
    @Select("SELECT * FROM service WHERE id = #{id}")
    Service selectById(@Param("id") Long id);

    /**
     * 关键词搜索
     */
    @Select("SELECT * FROM service WHERE status = 1 AND (name LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%')) ORDER BY id DESC")
    List<Service> searchByKeyword(@Param("keyword") String keyword);

    // ============================================================
    // 管理后台端查询
    // ============================================================

    /**
     * 分页查询（带筛选条件）
     */
    @Select("<script>" +
            "SELECT * FROM service WHERE 1=1" +
            "<if test='name != null and name != \"\"'> AND name LIKE CONCAT('%', #{name}, '%')</if>" +
            "<if test='categoryType != null'> AND category_type = #{categoryType}</if>" +
            "<if test='status != null'> AND status = #{status}</if>" +
            " ORDER BY id DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Service> selectByPage(@Param("name") String name,
                               @Param("categoryType") Integer categoryType,
                               @Param("status") Integer status,
                               @Param("offset") int offset,
                               @Param("pageSize") int pageSize);

    /**
     * 统计数量（带筛选条件）
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM service WHERE 1=1" +
            "<if test='name != null and name != \"\"'> AND name LIKE CONCAT('%', #{name}, '%')</if>" +
            "<if test='categoryType != null'> AND category_type = #{categoryType}</if>" +
            "<if test='status != null'> AND status = #{status}</if>" +
            "</script>")
    int countByCondition(@Param("name") String name,
                         @Param("categoryType") Integer categoryType,
                         @Param("status") Integer status);

    /**
     * 检查名称是否存在
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM service WHERE name = #{name}" +
            "<if test='excludeId != null'> AND id != #{excludeId}</if>" +
            "</script>")
    int countByName(@Param("name") String name, @Param("excludeId") Long excludeId);

    // ============================================================
    // 增删改操作
    // ============================================================

    /**
     * 新增服务
     */
    @Insert("INSERT INTO service(name, category_type, price, original_price, image, description, duration, status, create_time) " +
            "VALUES(#{name}, #{categoryType}, #{price}, #{originalPrice}, #{image}, #{description}, #{duration}, #{status}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Service service);

    /**
     * 更新服务
     */
    @Update("UPDATE service SET " +
            "name = #{name}, " +
            "category_type = #{categoryType}, " +
            "price = #{price}, " +
            "original_price = #{originalPrice}, " +
            "image = #{image}, " +
            "description = #{description}, " +
            "duration = #{duration}, " +
            "update_time = NOW() " +
            "WHERE id = #{id}")
    int update(Service service);

    /**
     * 更新状态
     */
    @Update("UPDATE service SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 删除服务
     */
    @Delete("DELETE FROM service WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    /**
     * 检查服务是否有未完成订单
     */
    @Select("SELECT COUNT(*) FROM order_item oi LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi.product_id = #{serviceId} AND o.order_type = 'SERVICE' AND o.status IN (0, 1, 2)")
    int countPendingOrdersByServiceId(@Param("serviceId") Long serviceId);

    /**
     * 获取统计数据
     */
    @Select("SELECT COUNT(*) FROM service")
    int countAll();
}