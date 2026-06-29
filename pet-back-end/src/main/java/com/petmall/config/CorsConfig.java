package com.petmall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//@Configuration // 1. 标记这是一个配置类，Spring 启动时会自动加载
//public class CorsConfig implements WebMvcConfigurer { // 2. 实现 WebMvcConfigurer 接口
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) { // 3. 重写跨域映射方法
//        System.out.println("===== CORS 配置已加载 =====");  // 添加这行日志
//
//        registry.addMapping("/**") // 允许所有接口路径
//                .allowedOriginPatterns("*")
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的HTTP方法
//                .allowedHeaders("*") // 允许所有请求头
//                .allowCredentials(true) // 允许携带Cookie
//                .maxAge(3600); // 预检请求缓存时间（秒）
//    }
//}