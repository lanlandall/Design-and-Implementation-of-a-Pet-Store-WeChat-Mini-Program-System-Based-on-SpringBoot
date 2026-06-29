package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.User;
import com.petmall.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;  // 添加这一行

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员登录控制器（商家Web后台用）
 * 处理商家后台的管理员登录
 */
@RestController
@RequestMapping("/api/admin")
public class AdminLoginController {

    @Autowired
    private UserService userService;

    /**
     * 管理员登录
     * 请求参数：{"account": "admin", "password": "123456"}
     */
    @PostMapping("/login")
    public Result<Map<String, String>> adminLogin(@RequestBody Map<String, String> params) {
        // 获取请求参数
        String account = params.get("account");
        String password = params.get("password");

        // 参数校验
        if (account == null || account.isEmpty()) {
            return Result.error("请输入账号");
        }
        if (password == null || password.isEmpty()) {
            return Result.error("请输入密码");
        }

        // 调用业务层验证登录
        User user = userService.adminLogin(account, password);
        if (user == null) {
            return Result.error("账号或密码错误");
        }

        // 生成token
        String token = userService.generateToken(user.getId());

        // 返回结果
        Map<String, String> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", String.valueOf(user.getId()));
        result.put("username", user.getUsername());
        result.put("role", user.getRole());

        return Result.success(result);
    }

    /**
     * 管理员登出
     */
    @PostMapping("/logout")
    public Result<String> adminLogout(HttpServletRequest request) {
        // 可以在这里实现token黑名单逻辑
        return Result.success("登出成功");
    }
}
