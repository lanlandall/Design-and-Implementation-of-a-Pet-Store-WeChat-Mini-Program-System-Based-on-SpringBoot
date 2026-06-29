package com.petmall.interceptor;

import com.petmall.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class TokenInterceptor implements HandlerInterceptor {

    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        System.out.println("=== TokenInterceptor ===");
        System.out.println("URI: " + uri);

        // 只放行登录接口
        if (uri.contains("/login")) {
            System.out.println("放行: " + uri);
            return true;
        }

        String token = request.getHeader("Authorization");
        System.out.println("Authorization: " + token);

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Long userId = userService.getUserIdFromToken(token);
            System.out.println("解析出的 userId: " + userId);

            if (userId != null) {
                request.setAttribute("userId", userId);
                return true;
            }
        }

        System.out.println("拦截: " + uri);
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":401,\"message\":\"请先登录\"}");
        return false;
    }
}