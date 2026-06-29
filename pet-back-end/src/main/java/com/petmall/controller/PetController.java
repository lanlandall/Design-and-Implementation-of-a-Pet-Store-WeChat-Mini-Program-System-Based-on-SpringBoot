package com.petmall.controller;

import com.petmall.dto.Result;
import com.petmall.entity.Pet;
import com.petmall.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 宠物控制器（小程序用）
 */
@RestController
@RequestMapping("/api/pet")
public class PetController {

    @Autowired
    private PetService petService;

    /**
     * 获取我的宠物列表
     */
    @GetMapping("/list")
    public Result<List<Pet>> getMyPets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        return Result.success(petService.getUserPets(userId));
    }

    /**
     * 获取宠物详情
     */
    @GetMapping("/detail/{id}")
    public Result<Pet> getPetDetail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        Pet pet = petService.getPetById(id);
        if (pet == null || !pet.getUserId().equals(userId)) {
            return Result.error("宠物不存在");
        }
        return Result.success(pet);
    }

    /**
     * 添加宠物
     */
    @PostMapping("/add")
    public Result<Pet> addPet(@RequestBody Pet pet, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        pet.setUserId(userId);
        pet.setStatus(1);
        boolean success = petService.addPet(pet);
        return success ? Result.success(pet) : Result.error("添加失败");
    }

    /**
     * 更新宠物信息
     */
    @PutMapping("/update")
    public Result<String> updatePet(@RequestBody Pet pet, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        Pet existingPet = petService.getPetById(pet.getId());
        if (existingPet == null || !existingPet.getUserId().equals(userId)) {
            return Result.error("宠物不存在");
        }
        boolean success = petService.updatePet(pet);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * 删除宠物
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> deletePet(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("请先登录");
        }
        Pet pet = petService.getPetById(id);
        if (pet == null || !pet.getUserId().equals(userId)) {
            return Result.error("宠物不存在");
        }
        boolean success = petService.deletePet(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }
}