package com.petmall.mapper;

import com.petmall.entity.Pet;
import org.apache.ibatis.annotations.*;
import java.util.List;

/**
 * 宠物数据访问层
 */
@Mapper
public interface PetMapper {

    /**
     * 根据ID查询宠物
     */
    @Select("SELECT * FROM pet WHERE id = #{id}")
    Pet selectById(@Param("id") Long id);

    /**
     * 查询用户的宠物列表
     */
    @Select("SELECT * FROM pet WHERE user_id = #{userId} AND status = 1 ORDER BY id DESC")
    List<Pet> selectByUserId(@Param("userId") Long userId);

    /**
     * 查询所有宠物（商家后台用）
     */
    @Select("SELECT p.*, u.username as ownerName FROM pet p LEFT JOIN user u ON p.user_id = u.id ORDER BY p.id DESC")
    List<Pet> selectAll();

    /**
     * 分页查询宠物（商家后台用）
     */
    @Select("SELECT p.*, u.username as ownerName FROM pet p LEFT JOIN user u ON p.user_id = u.id ORDER BY p.id DESC LIMIT #{offset}, #{pageSize}")
    List<Pet> selectByPage(@Param("offset") int offset, @Param("pageSize") int pageSize);

    /**
     * 统计宠物总数
     */
    @Select("SELECT COUNT(*) FROM pet")
    int countAll();

    /**
     * 添加宠物
     */
    @Insert("INSERT INTO pet(user_id, name, age, breed, type, avatar, weight, birthday, category, image_url, is_available, status, create_time) " +
            "VALUES(#{userId}, #{name}, #{age}, #{breed}, #{type}, #{avatar}, #{weight}, #{birthday}, #{category}, #{imageUrl}, #{isAvailable}, 1, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Pet pet);

    /**
     * 更新宠物信息
     */
    @Update("UPDATE pet SET name = #{name}, age = #{age}, breed = #{breed}, type = #{type}, " +
            "avatar = #{avatar}, weight = #{weight}, birthday = #{birthday}, category = #{category}, " +
            "image_url = #{imageUrl}, is_available = #{isAvailable}, update_time = NOW() WHERE id = #{id}")
    int update(Pet pet);

    /**
     * 软删除宠物（status设为0）
     */
    @Update("UPDATE pet SET status = 0, update_time = NOW() WHERE id = #{id}")
    int softDelete(@Param("id") Long id);

    /**
     * 物理删除宠物
     */
    @Delete("DELETE FROM pet WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Update("UPDATE pet SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}