package com.petmall.utils;

import com.alibaba.fastjson.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class WxUtil {

    @Value("${wx.app-id}")
    private String appId;

    @Value("${wx.app-secret}")
    private String appSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getOpenid(String code) {
        String url = "https://api.weixin.qq.com/sns/jscode2session?" +
                "appid=" + appId +
                "&secret=" + appSecret +
                "&js_code=" + code +
                "&grant_type=authorization_code";

        String response = restTemplate.getForObject(url, String.class);
        JSONObject json = JSONObject.parseObject(response);

        return json.getString("openid");
    }
}