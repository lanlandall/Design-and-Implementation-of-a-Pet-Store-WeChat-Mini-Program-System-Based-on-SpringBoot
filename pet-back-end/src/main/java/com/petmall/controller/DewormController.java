package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.DewormRecord;
import com.petmall.service.DewormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 驱虫记录控制器（小程序用）
 * 处理宠物驱虫记录的增删改查
 */
@RestController
@RequestMapping("/api/deworm")
public class DewormController {

    @Autowired
    private DewormService dewormService;

    /**
     * 获取指定宠物的驱虫记录列表
     * GET /api/deworm/list?petId=1
     */
    @GetMapping("/list")
    public Result<List<DewormRecord>> getDewormList(@RequestParam Long petId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return Result.success(dewormService.getRecordsByPetId(petId));
    }

    /**
     * 获取单条驱虫记录详情
     * GET /api/deworm/detail/1
     */
    @GetMapping("/detail/{id}")
    public Result<DewormRecord> getDewormDetail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        DewormRecord record = dewormService.getRecordById(id);
        if (record == null) {
            return Result.error("记录不存在");
        }
        return Result.success(record);
    }

    /**
     * 添加驱虫记录
     * POST /api/deworm/add
     */
    @PostMapping("/add")
    public Result<DewormRecord> addDeworm(@RequestBody DewormRecord record, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        record.setUserId(userId);
        boolean success = dewormService.addRecord(record);
        return success ? Result.success(record) : Result.error("添加失败");
    }

    /**
     * 更新驱虫记录
     * PUT /api/deworm/update
     */
    @PutMapping("/update")
    public Result<String> updateDeworm(@RequestBody DewormRecord record, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        boolean success = dewormService.updateRecord(record);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 删除驱虫记录
     * DELETE /api/deworm/delete/1
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> deleteDeworm(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        boolean success = dewormService.deleteRecord(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }
}