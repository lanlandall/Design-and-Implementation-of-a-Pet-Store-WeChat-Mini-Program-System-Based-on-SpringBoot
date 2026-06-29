package com.petmall.mapper;

import com.petmall.entity.User;
import org.apache.ibatis.annotations.*;
import java.util.List;

/**
 * 用户数据访问层
 */
@Mapper
public interface UserMapper {

    // ============================================================
    // 查询
    // ============================================================

    /**
     * 根据ID查询用户
     */
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(@Param("id") Long id);

    /**
     * 根据账号查询用户
     */
    @Select("SELECT * FROM user WHERE account = #{account}")
    User selectByAccount(@Param("account") String account);

    /**
     * 根据openid查询用户
     */
    @Select("SELECT * FROM user WHERE openid = #{openid}")
    User selectByOpenid(@Param("openid") String openid);

    /**
     * 查询所有用户
     */
    @Select("SELECT * FROM user ORDER BY id DESC")
    List<User> selectAll();

    /**
     * 分页查询用户
     */
    @Select("SELECT * FROM user ORDER BY id DESC LIMIT #{offset}, #{pageSize}")
    List<User> selectByPage(@Param("offset") int offset, @Param("pageSize") int pageSize);

    /**
     * 统计用户总数
     */
    @Select("SELECT COUNT(*) FROM user")
    int countAll();

    // ============================================================
    // 新增
    // ============================================================

    /**
     * 微信用户注册
     */
    @Insert("INSERT INTO user(openid, username, avatar_url, role, create_time, last_login_time) " +
            "VALUES(#{openid}, #{username}, #{avatarUrl}, 'user', NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertWechat(User user);

    /**
     * 新增用户
     */
    @Insert("INSERT INTO user(username, phone, address, avatar_url, role, create_time) " +
            "VALUES(#{username}, #{phone}, #{address}, #{avatarUrl}, 'user', NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    /**
     * 新增管理员
     */
    @Insert("INSERT INTO user(account, password, username, role, create_time) " +
            "VALUES(#{account}, #{password}, #{username}, 'admin', NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertAdmin(User user);

    // ============================================================
    // 更新
    // ============================================================

    /**
     * 更新用户资料
     */
    @Update("UPDATE user SET username = #{username}, phone = #{phone}, account = #{account}, " +
            "avatar_url = #{avatarUrl}, address = #{address}, update_time = NOW() WHERE id = #{id}")
    int updateProfile(User user);

    /**
     * 修改密码
     */
    @Update("UPDATE user SET password = #{password} WHERE id = #{id}")
    int updatePassword(@Param("id") Long id, @Param("password") String password);

    /**
     * 更新头像
     */
    @Update("UPDATE user SET avatar_url = #{avatarUrl} WHERE id = #{id}")
    int updateAvatar(@Param("id") Long id, @Param("avatarUrl") String avatarUrl);

    /**
     * 更新用户状态
     */
    @Update("UPDATE user SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 更新最后登录时间
     */
    @Update("UPDATE user SET last_login_time = NOW() WHERE id = #{id}")
    int updateLoginTime(@Param("id") Long id);

    // ============================================================
    // 删除
    // ============================================================

    /**
     * 删除用户
     */
    @Delete("DELETE FROM user WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}