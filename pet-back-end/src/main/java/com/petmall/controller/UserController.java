package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.User;
import com.petmall.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器（小程序端）
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // ============================================================
    // 登录相关
    // ============================================================

    /**
     * 微信登录（含开发者后门）
     */
    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody Map<String, String> params) {
        String openid = params.get("code");
        String nickname = params.get("nickname");
        String avatar = params.get("avatar");

        // 开发者后门
        if ("dev-login".equals(openid)) {
            User user = userService.getUserById(1L);
            if (user == null) {
                user = userService.wechatLogin("dev_test", "测试用户", null);
            }
            String token = userService.generateToken(user.getId());
            return Result.success(buildLoginResult(token, user));
        }

        if (openid == null || openid.isEmpty()) {
            openid = "test_" + System.currentTimeMillis();
        }
        if (nickname == null || nickname.isEmpty()) {
            nickname = "微信用户";
        }

        User user = userService.wechatLogin(openid, nickname, avatar);
        String token = userService.generateToken(user.getId());
        return Result.success(buildLoginResult(token, user));
    }

    /**
     * 账号密码登录
     */
    @PostMapping("/pwd-login")
    public Result<Map<String, String>> passwordLogin(@RequestBody Map<String, String> params) {
        String account = params.get("account");
        String password = params.get("password");

        if (account == null || account.isEmpty()) {
            return Result.error("请输入账号");
        }
        if (password == null || password.isEmpty()) {
            return Result.error("请输入密码");
        }

        User user = userService.loginByPassword(account, password);
        if (user == null) {
            return Result.error("账号或密码错误");
        }

        String token = userService.generateToken(user.getId());
        return Result.success(buildLoginResult(token, user));
    }

    /**
     * 构建登录返回结果
     */
    private Map<String, String> buildLoginResult(String token, User user) {
        Map<String, String> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", String.valueOf(user.getId()));
        result.put("nickname", user.getUsername());
        return result;
    }

    // ============================================================
    // 用户资料管理
    // ============================================================

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    public Result<User> getUserInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return Result.success(userService.getUserById(userId));
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/profile")
    public Result<String> updateProfile(@RequestBody User user, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        user.setId(userId);
        return userService.updateProfile(user) ? Result.success("保存成功") : Result.error("保存失败");
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public Result<String> updatePassword(@RequestBody Map<String, String> params, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }

        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");

        if (oldPassword == null || oldPassword.isEmpty()) {
            return Result.error("请输入原密码");
        }
        if (newPassword == null || newPassword.isEmpty()) {
            return Result.error("请输入新密码");
        }

        boolean success = userService.updatePassword(userId, oldPassword, newPassword);
        return success ? Result.success("修改成功") : Result.error("原密码错误");
    }

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        String avatarUrl = userService.uploadAvatar(userId, file);
        return avatarUrl != null ? Result.success(avatarUrl) : Result.error("上传失败");
    }
}