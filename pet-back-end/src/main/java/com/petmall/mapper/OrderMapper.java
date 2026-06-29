package com.petmall.mapper;

import com.petmall.entity.Orders;
import org.apache.ibatis.annotations.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Date;

/**
 * 订单 Mapper
 */
@Mapper
public interface OrderMapper {

    // ============================================================
    // 基础操作
    // ============================================================

    @Insert("INSERT INTO orders(order_no, user_id, order_type, total_amount, status, " +
            "receiver_name, receiver_phone, receiver_address, service_time, remark, " +
            "pet_id, pet_name, pay_time, create_time) " +
            "VALUES(#{orderNo}, #{userId}, #{orderType}, #{totalAmount}, #{status}, " +
            "#{receiverName}, #{receiverPhone}, #{receiverAddress}, #{serviceTime}, #{remark}, " +
            "#{petId}, #{petName}, #{payTime}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Orders order);

    @Select("SELECT * FROM orders WHERE id = #{id}")
    Orders selectById(@Param("id") Long id);

    @Select("SELECT * FROM orders WHERE order_no = #{orderNo}")
    Orders selectByOrderNo(@Param("orderNo") String orderNo);

    @Update("UPDATE orders SET status = #{status}, pay_time = NOW(), update_time = NOW() WHERE id = #{id}")
    int updateStatusWithPayTime(@Param("id") Long id, @Param("status") Integer status);

    // ============================================================
    // 用户端查询
    // ============================================================

    @Select("<script>" +
            "SELECT * FROM orders WHERE user_id = #{userId} AND order_type = #{orderType}" +
            "<if test='status != null'> AND status = #{status}</if>" +
            " ORDER BY create_time DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Orders> selectUserOrdersByType(@Param("userId") Long userId,
                                        @Param("orderType") String orderType,
                                        @Param("status") Integer status,
                                        @Param("offset") int offset,
                                        @Param("pageSize") int pageSize);

    @Select("<script>" +
            "SELECT COUNT(*) FROM orders WHERE user_id = #{userId} AND order_type = #{orderType}" +
            "<if test='status != null'> AND status = #{status}</if>" +
            "</script>")
    int countUserOrdersByType(@Param("userId") Long userId,
                              @Param("orderType") String orderType,
                              @Param("status") Integer status);

    @Select("<script>" +
            "SELECT * FROM orders WHERE user_id = #{userId}" +
            "<if test='orderType != null and orderType != \"ALL\"'> AND order_type = #{orderType}</if>" +
            "<if test='status != null'> AND status = #{status}</if>" +
            " ORDER BY create_time DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Orders> selectUserOrders(@Param("userId") Long userId,
                                  @Param("orderType") String orderType,
                                  @Param("status") Integer status,
                                  @Param("offset") int offset,
                                  @Param("pageSize") int pageSize);

    @Select("<script>" +
            "SELECT COUNT(*) FROM orders WHERE user_id = #{userId}" +
            "<if test='orderType != null and orderType != \"ALL\"'> AND order_type = #{orderType}</if>" +
            "<if test='status != null'> AND status = #{status}</if>" +
            "</script>")
    int countUserOrders(@Param("userId") Long userId,
                        @Param("orderType") String orderType,
                        @Param("status") Integer status);

    @Select("SELECT COUNT(*) FROM orders WHERE user_id = #{userId} AND status = #{status}")
    int countUserOrdersByStatus(@Param("userId") Long userId, @Param("status") Integer status);

    /**
     * 更新支付时间
     */
    @Update("UPDATE orders SET pay_time = #{payTime}, update_time = NOW() WHERE id = #{orderId}")
    int updatePayTime(@Param("orderId") Long orderId, @Param("payTime") Date payTime);
    // ============================================================
    // 管理后台查询
    // ============================================================
    /**
     * 获取订单列表（管理后台）
     */
    @Select("<script>" +
            "SELECT o.*, u.username as user_name, u.avatar_url as user_avatar FROM orders o " +
            "LEFT JOIN user u ON o.user_id = u.id WHERE 1=1" +
            "<if test='orderType != null and orderType != \"\"'> AND o.order_type = #{orderType}</if>" +
            "<if test='status != null'> AND o.status = #{status}</if>" +
            "<if test='keyword != null and keyword != \"\"'> " +
            " AND (o.order_no LIKE CONCAT('%', #{keyword}, '%') OR o.receiver_name LIKE CONCAT('%', #{keyword}, '%') OR o.receiver_phone LIKE CONCAT('%', #{keyword}, '%'))" +
            "</if>" +
            " ORDER BY o.create_time DESC LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<Orders> selectAdminOrders(@Param("orderType") String orderType,
                                   @Param("status") Integer status,
                                   @Param("keyword") String keyword,
                                   @Param("offset") int offset,
                                   @Param("pageSize") int pageSize);


    /**
     * 统计订单数量（通用方法，支持筛选）
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM orders o WHERE 1=1" +
            "<if test='orderType != null and orderType != \"\"'> AND o.order_type = #{orderType}</if>" +
            "<if test='status != null'> AND o.status = #{status}</if>" +
            "<if test='keyword != null and keyword != \"\"'> " +
            " AND (o.order_no LIKE CONCAT('%', #{keyword}, '%') OR o.receiver_name LIKE CONCAT('%', #{keyword}, '%') OR o.receiver_phone LIKE CONCAT('%', #{keyword}, '%'))" +
            "</if>" +
            "</script>")
    int countOrders(@Param("orderType") String orderType,
                         @Param("status") Integer status,
                         @Param("keyword") String keyword);


    /**
     * 更新物流单号
     */
    @Update("UPDATE orders SET tracking_no = #{trackingNo}, update_time = NOW() WHERE id = #{id}")
    int updateTrackingNo(@Param("id") Long id, @Param("trackingNo") String trackingNo);
    /**
     * 今日订单数
     */
    @Select("SELECT COUNT(*) FROM orders WHERE DATE(create_time) = CURDATE()")
    int countTodayOrders();

    /**
     * 今日销售额（已付款订单）
     */
    @Select("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(create_time) = CURDATE() AND status >= 1")
    BigDecimal sumTodayAmount();

    /**
     * 本月销售额（已付款订单）
     */
    @Select("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE YEAR(create_time) = YEAR(NOW()) AND MONTH(create_time) = MONTH(NOW()) AND status >= 1")
    BigDecimal sumMonthAmount();

    /**
     * 各状态订单数量统计
     */
    @Select("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
    List<Map<String, Object>> countByStatus();

    /**
     * 统计总收入（已付款订单）
     */
    @Select("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status >= 1")
    BigDecimal sumTotalIncome();

    /**
     * 今日订单列表
     */
    @Select("SELECT o.*, u.username as user_name FROM orders o LEFT JOIN user u ON o.user_id = u.id WHERE DATE(o.create_time) = CURDATE() ORDER BY o.create_time DESC")
    List<Orders> selectTodayOrders();


    // ============================================================
    // 小程序端和管理端共用
    // ============================================================
    /**
     * 更新订单状态
     */
    @Update("UPDATE orders SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

}