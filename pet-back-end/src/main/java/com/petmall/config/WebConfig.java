package com.petmall.config;

import com.petmall.interceptor.TokenInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private TokenInterceptor tokenInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tokenInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/admin/**",

                        // 登录接口
                        "/api/user/login",
                        "/api/user/pwd-login",
                        "/api/admin/login",
                        // 商品查询（只读）
                        "/api/product/list",
                        "/api/product/detail/**",
                        "/api/product/category/**",
                        "/api/product/petType/**",
                        "/api/product/search",
                        // 服务查询（只读）
                        "/api/service/list",
                        "/api/service/detail/**",
                        "/api/service/category/**",
                        "/api/service/search",
                        // 分类
                        "/api/category/**",
                        // 门店
                        "/api/store/**"
                );
    }
}