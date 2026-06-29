package com.petmall.mapper;

import com.petmall.entity.Category;
import org.apache.ibatis.annotations.*;
import java.util.List;

/**
 * 分类数据访问层
 */
@Mapper
public interface CategoryMapper {

    /**
     * 查询所有分类，按排序顺序排列
     */
    @Select("SELECT * FROM category ORDER BY sort_order")
    List<Category> selectAll();

    /**
     * 根据宠物类型查询分类
     * @param petType 宠物类型：1-狗，2-猫
     */
    @Select("SELECT * FROM category WHERE pet_type = #{petType} ORDER BY sort_order")
    List<Category> selectByPetType(@Param("petType") Integer petType);

    /**
     * 根据ID查询分类
     */
    @Select("SELECT * FROM category WHERE id = #{id}")
    Category selectById(@Param("id") Long id);

    /**
     * 添加分类（商家后台用）
     */
    @Insert("INSERT INTO category(name, pet_type, sort_order, is_fixed, create_time) VALUES(#{name}, #{petType}, #{sortOrder}, #{isFixed}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Category category);

    /**
     * 更新分类（商家后台用）
     */
    @Update("UPDATE category SET name = #{name}, pet_type = #{petType}, sort_order = #{sortOrder}, is_fixed = #{isFixed} WHERE id = #{id}")
    int update(Category category);

    /**
     * 删除分类（商家后台用）
     */
    @Delete("DELETE FROM category WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}