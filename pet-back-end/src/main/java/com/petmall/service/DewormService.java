package com.petmall.service;

import com.petmall.entity.DewormRecord;
import com.petmall.mapper.DewormRecordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 驱虫记录业务逻辑层
 */
@Service
public class DewormService {

    @Autowired
    private DewormRecordMapper dewormRecordMapper;

    /**
     * 获取指定宠物的驱虫记录列表
     */
    public List<DewormRecord> getRecordsByPetId(Long petId) {
        return dewormRecordMapper.selectByPetId(petId);
    }

    /**
     * 获取单条驱虫记录
     */
    public DewormRecord getRecordById(Long id) {
        return dewormRecordMapper.selectById(id);
    }

    /**
     * 添加驱虫记录
     */
    public boolean addRecord(DewormRecord record) {
        return dewormRecordMapper.insert(record) > 0;
    }

    /**
     * 更新驱虫记录
     */
    public boolean updateRecord(DewormRecord record) {
        return dewormRecordMapper.update(record) > 0;
    }

    /**
     * 删除驱虫记录
     */
    public boolean deleteRecord(Long id) {
        return dewormRecordMapper.deleteById(id) > 0;
    }
}