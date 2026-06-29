package com.petmall.mapper;

import com.petmall.entity.DewormRecord;
import org.apache.ibatis.annotations.*;
import java.util.List;

/**
 * 驱虫记录数据访问层
 */
@Mapper
public interface DewormRecordMapper {

    /**
     * 根据宠物ID查询驱虫记录列表
     */
    @Select("SELECT * FROM deworm_record WHERE pet_id = #{petId} ORDER BY deworm_date DESC")
    List<DewormRecord> selectByPetId(@Param("petId") Long petId);

    /**
     * 根据ID查询单条驱虫记录
     */
    @Select("SELECT * FROM deworm_record WHERE id = #{id}")
    DewormRecord selectById(@Param("id") Long id);

    /**
     * 添加驱虫记录
     */
    @Insert("INSERT INTO deworm_record(user_id, pet_id, type, deworm_date, next_deworm_date, medicine, remark, create_time) " +
            "VALUES(#{userId}, #{petId}, #{type}, #{dewormDate}, #{nextDewormDate}, #{medicine}, #{remark}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DewormRecord record);

    /**
     * 更新驱虫记录
     */
    @Update("UPDATE deworm_record SET type = #{type}, deworm_date = #{dewormDate}, next_deworm_date = #{nextDewormDate}, " +
            "medicine = #{medicine}, remark = #{remark} WHERE id = #{id}")
    int update(DewormRecord record);

    /**
     * 删除驱虫记录
     */
    @Delete("DELETE FROM deworm_record WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}