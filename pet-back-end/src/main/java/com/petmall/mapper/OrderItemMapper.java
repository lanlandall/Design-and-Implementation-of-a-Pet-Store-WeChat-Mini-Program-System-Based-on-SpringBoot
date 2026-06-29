package com.petmall.mapper;

import com.petmall.entity.OrderItem;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 订单项 Mapper
 */
@Mapper
public interface OrderItemMapper {

    @Insert("INSERT INTO order_item(order_id, product_id, name, price, quantity, total_price, image) " +
            "VALUES(#{orderId}, #{productId}, #{name}, #{price}, #{quantity}, #{totalPrice}, #{image})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(OrderItem item);

    @Select("SELECT * FROM order_item WHERE order_id = #{orderId}")
    List<OrderItem> selectByOrderId(@Param("orderId") Long orderId);

    @Select("SELECT * FROM order_item WHERE id = #{id}")
    OrderItem selectById(@Param("id") Long id);

    @Delete("DELETE FROM order_item WHERE order_id = #{orderId}")
    int deleteByOrderId(@Param("orderId") Long orderId);
}