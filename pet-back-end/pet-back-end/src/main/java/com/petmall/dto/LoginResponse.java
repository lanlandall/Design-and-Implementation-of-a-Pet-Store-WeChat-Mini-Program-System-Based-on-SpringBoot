package com.petmall.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long userId;
    private String token;
    private String nickname;
    private String avatar;
}