package com.petmall.service;

import com.petmall.entity.Pet;
import com.petmall.mapper.PetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 宠物业务逻辑层
 */
@Service
public class PetService {

    @Autowired
    private PetMapper petMapper;

    /**
     * 获取用户的宠物列表（小程序用）
     */
    public List<Pet> getUserPets(Long userId) {
        return petMapper.selectByUserId(userId);
    }

    /**
     * 获取宠物详情
     */
    public Pet getPetById(Long id) {
        return petMapper.selectById(id);
    }

    /**
     * 添加宠物
     */
    public boolean addPet(Pet pet) {
        return petMapper.insert(pet) > 0;
    }

    /**
     * 更新宠物信息
     */
    public boolean updatePet(Pet pet) {
        return petMapper.update(pet) > 0;
    }

    /**
     * 删除宠物（软删除）
     */
    public boolean deletePet(Long id) {
        return petMapper.softDelete(id) > 0;
    }

    /**
     * 获取所有宠物（商家后台）
     */
    public List<Pet> getAllPets() {
        return petMapper.selectAll();
    }

    /**
     * 分页获取宠物（商家后台）
     */
    public List<Pet> getPetsByPage(Integer pageNum, Integer pageSize) {
        int offset = (pageNum - 1) * pageSize;
        return petMapper.selectByPage(offset, pageSize);
    }

    /**
     * 统计宠物总数
     */
    public int countAllPets() {
        return petMapper.countAll();
    }

    /**
     * 更新宠物信息
     */
    public boolean updatePetStatus(Long id, Integer status) {
        return petMapper.updateStatus(id, status) > 0;
    }


}