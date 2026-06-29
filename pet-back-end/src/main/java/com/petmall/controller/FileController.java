package com.petmall.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileController {

    @PostMapping("/image")
    public Map<String, Object> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (file.isEmpty()) {
                result.put("code", 400);
                result.put("message", "文件不能为空");
                return result;
            }

            // 获取原文件名和后缀
            String originalFilename = file.getOriginalFilename();
            String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));

            // 生成新文件名
            String newFileName = UUID.randomUUID().toString() + suffix;

            // 保存路径
            String uploadPath = System.getProperty("user.dir") + "/uploads/";
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 保存文件
            File destFile = new File(uploadPath + newFileName);
            file.transferTo(destFile);

            // 返回访问URL
            String fileUrl = "/uploads/" + newFileName;
            result.put("code", 200);
            result.put("data", fileUrl);
            result.put("message", "上传成功");
        } catch (IOException e) {
            result.put("code", 500);
            result.put("message", "上传失败: " + e.getMessage());
        }
        return result;
    }
}