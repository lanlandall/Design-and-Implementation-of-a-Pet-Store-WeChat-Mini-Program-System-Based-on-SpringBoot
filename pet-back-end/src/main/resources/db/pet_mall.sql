/*
Navicat MySQL Data Transfer

Source Server         : w
Source Server Version : 80037
Source Host           : localhost:3306
Source Database       : pet_mall

Target Server Type    : MYSQL
Target Server Version : 80037
File Encoding         : 65001

Date: 2026-04-18 20:50:10
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `category`
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `pet_type` tinyint(1) DEFAULT NULL COMMENT '宠物类型：1-狗，2-猫',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `is_fixed` tinyint(1) DEFAULT '0' COMMENT '是否固定位置',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='分类表';

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES ('1', '狗狗主粮', '1', '1', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('2', '狗狗零食', '1', '2', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('3', '驱虫清洁', '1', '3', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('4', '营养保健', '1', '4', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('5', '家居出行', '1', '5', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('6', '常备药品', '1', '6', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('7', '玩具', '1', '7', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('8', '服饰', '1', '8', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('9', '猫咪主粮', '2', '1', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('10', '猫咪零食', '2', '2', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('11', '保健护理', '2', '3', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('12', '生活用品', '2', '4', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('13', '常备药品', '2', '5', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('14', '玩具', '2', '6', '0', '2026-03-20 23:04:10');
INSERT INTO `category` VALUES ('15', '服饰', '2', '7', '0', '2026-03-20 23:04:10');

-- ----------------------------
-- Table structure for `deworm_record`
-- ----------------------------
DROP TABLE IF EXISTS `deworm_record`;
CREATE TABLE `deworm_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `pet_id` bigint NOT NULL,
  `type` varchar(20) NOT NULL COMMENT '体内/体外',
  `deworm_date` date NOT NULL COMMENT '驱虫日期',
  `next_deworm_date` date DEFAULT NULL COMMENT '下次驱虫日期',
  `medicine` varchar(100) DEFAULT NULL COMMENT '药品名称',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pet_id` (`pet_id`),
  KEY `fk_deworm_user` (`user_id`),
  CONSTRAINT `fk_deworm_pet` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_deworm_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='驱虫记录表';

-- ----------------------------
-- Records of deworm_record
-- ----------------------------
INSERT INTO `deworm_record` VALUES ('16', '2', '2', '体内', '2026-03-15', '2026-04-15', '拜耳', '体重3kg，用量半片', '2026-04-15 01:37:28');
INSERT INTO `deworm_record` VALUES ('17', '2', '2', '体外', '2026-03-20', '2026-04-20', '福来恩', '滴剂，肩胛骨处', '2026-04-15 01:37:28');
INSERT INTO `deworm_record` VALUES ('18', '2', '2', '体内', '2026-04-15', '2026-05-15', '拜耳', '驱虫后状态良好', '2026-04-15 01:37:28');
INSERT INTO `deworm_record` VALUES ('19', '2', '3', '体内', '2026-03-10', '2026-04-10', '犬心保', '牛肉口味，爱吃', '2026-04-15 01:37:28');
INSERT INTO `deworm_record` VALUES ('20', '2', '3', '体外', '2026-03-25', '2026-04-25', '尼可信', '口服，牛肉味', '2026-04-15 01:37:28');
INSERT INTO `deworm_record` VALUES ('21', '1', '1', '体内', '2026-03-01', '2026-04-01', '拜耳', '正常', '2026-04-15 01:37:28');
INSERT INTO `deworm_record` VALUES ('22', '1', '1', '体外', '2026-03-10', '2026-04-10', '福来恩', '正常', '2026-04-15 01:37:28');

-- ----------------------------
-- Table structure for `orders`
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint NOT NULL,
  `order_type` varchar(20) DEFAULT NULL COMMENT '订单类型：PRODUCT/SERVICE',
  `total_amount` decimal(10,2) NOT NULL,
  `pay_amount` decimal(10,2) DEFAULT '0.00' COMMENT '实付金额',
  `total_price` decimal(19,2) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0' COMMENT '0-待付款，1-已付款，2-已发货，3-已完成，4-已取消',
  `receiver_name` varchar(50) DEFAULT NULL,
  `receiver_phone` varchar(20) DEFAULT NULL,
  `receiver_address` varchar(200) DEFAULT NULL,
  `pay_time` datetime DEFAULT NULL,
  `ship_time` datetime DEFAULT NULL,
  `service_time` datetime DEFAULT NULL COMMENT '鏈嶅姟鏃堕棿',
  `complete_time` datetime DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pet_id` bigint DEFAULT NULL,
  `pet_name` varchar(255) DEFAULT NULL,
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单表';

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES ('6', 'S202604140111439916', '2', 'SERVICE', '129.00', '0.00', null, '0', null, null, null, null, null, '2026-04-15 14:00:00', null, '2026-04-14 01:11:44', '2026-04-14 01:11:43', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('7', 'S202604140113496682', '2', 'SERVICE', '89.00', '0.00', null, '0', null, null, null, null, null, '2026-04-14 14:00:00', null, '2026-04-14 01:13:49', '2026-04-14 01:13:49', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('8', 'S202604140116261385', '2', 'SERVICE', '89.00', '0.00', null, '0', null, null, null, null, null, '2026-04-14 09:00:00', null, '2026-04-14 01:16:27', '2026-04-14 01:16:26', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('9', 'S202604140119017744', '2', 'SERVICE', '89.00', '0.00', null, '0', null, null, null, null, null, '2026-04-14 09:00:00', null, '2026-04-14 01:19:01', '2026-04-14 01:19:01', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('10', 'S202604140124325817', '2', 'SERVICE', '89.00', '0.00', null, '0', null, null, null, null, null, '2026-04-14 09:00:00', null, '2026-04-14 01:24:32', '2026-04-14 01:24:32', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('11', 'S202604140124572786', '2', 'SERVICE', '129.00', '0.00', null, '-1', null, null, null, null, null, '2026-04-14 09:00:00', null, '2026-04-14 01:24:57', '2026-04-14 02:03:36', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('12', 'S202604140128076653', '2', 'SERVICE', '89.00', '0.00', null, '-1', null, null, null, null, null, '2026-04-14 09:00:00', null, '2026-04-14 01:28:08', '2026-04-14 02:03:22', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('13', 'S202604140131361284', '2', 'SERVICE', '89.00', '0.00', null, '-1', null, null, null, null, null, '2026-04-14 09:00:00', null, '2026-04-14 01:31:36', '2026-04-14 01:54:22', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('14', 'M202604140244223419', '2', 'PRODUCT', '12.00', '0.00', null, '0', '2', '2', '2', null, null, null, null, '2026-04-14 02:44:23', '2026-04-14 02:44:22', null, null, '');
INSERT INTO `orders` VALUES ('15', 'M202604140309534922', '2', 'PRODUCT', '45.00', '0.00', null, '0', '默认地址', '138****0000', '杭州市西湖区xxx', null, null, null, null, '2026-04-14 03:09:53', '2026-04-14 03:09:53', null, null, '');
INSERT INTO `orders` VALUES ('16', 'S202604140318044180', '2', 'SERVICE', '59.00', '0.00', null, '0', null, null, null, null, null, '2026-04-14 19:00:00', null, '2026-04-14 03:18:05', '2026-04-14 03:18:04', '3', '哈士奇', null);
INSERT INTO `orders` VALUES ('17', 'S202604140321325040', '2', 'SERVICE', '29.00', '0.00', null, '0', null, null, null, null, null, '2026-04-14 19:00:00', null, '2026-04-14 03:21:32', '2026-04-14 03:21:32', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('18', 'S202604140327495892', '2', 'SERVICE', '199.00', '0.00', null, '0', '2', '2', '2', null, null, '2026-04-14 14:00:00', null, '2026-04-14 03:27:49', '2026-04-14 03:27:49', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('19', 'M202604141731081708', '2', 'PRODUCT', '35.00', '0.00', null, '0', '2', '2', '2', null, null, null, null, '2026-04-14 17:31:09', '2026-04-14 17:31:08', null, null, '');
INSERT INTO `orders` VALUES ('20', 'M202604141833170054', '2', 'PRODUCT', '49.00', '0.00', null, '0', '2', '2', '2', null, null, null, null, '2026-04-14 18:33:18', '2026-04-14 18:33:17', null, null, '');
INSERT INTO `orders` VALUES ('21', 'S202604141833271488', '2', 'SERVICE', '29.00', '0.00', null, '0', '2', '2', '2', null, null, '2026-04-14 09:00:00', null, '2026-04-14 18:33:28', '2026-04-14 19:12:25', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('22', 'S202604141913211320', '2', 'SERVICE', '199.00', '0.00', null, '10', '2', '2', '2', null, null, '2026-04-14 09:00:00', null, '2026-04-14 19:13:21', '2026-04-14 19:13:21', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('23', 'S202604141913264801', '2', 'SERVICE', '199.00', '0.00', null, '11', '2', '2', '2', '2026-04-14 20:43:10', null, '2026-04-14 14:00:00', null, '2026-04-14 19:13:27', '2026-04-14 20:43:10', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('24', 'S202604141927523909', '2', 'SERVICE', '299.00', '0.00', null, '13', '2', '2', '2', '2026-04-14 19:53:02', null, '2026-04-14 09:00:00', null, '2026-04-14 19:27:53', '2026-04-14 19:53:42', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('25', 'M202604141955064172', '2', 'PRODUCT', '59.00', '0.00', null, '0', '2', '2', '2', null, null, null, null, '2026-04-14 19:55:07', '2026-04-14 19:55:06', null, null, '');
INSERT INTO `orders` VALUES ('28', 'M202604142019296367', '2', 'PRODUCT', '49.00', '0.00', null, '1', '2', '2', '2', '2026-04-14 20:19:30', null, null, null, '2026-04-14 20:19:30', '2026-04-14 20:19:29', null, null, null);
INSERT INTO `orders` VALUES ('29', 'M202604142019444656', '2', 'PRODUCT', '45.00', '0.00', null, '1', '2', '2', '2', '2026-04-14 20:19:44', null, null, null, '2026-04-14 20:19:44', '2026-04-14 20:19:44', null, null, null);
INSERT INTO `orders` VALUES ('30', 'M202604142020581188', '2', 'PRODUCT', '49.00', '0.00', null, '4', '2', '2', '2', '2026-04-14 20:20:59', null, null, null, '2026-04-14 20:20:58', '2026-04-14 20:42:19', null, null, null);
INSERT INTO `orders` VALUES ('31', 'S202604142049532726', '2', 'SERVICE', '29.00', '0.00', null, '4', '2', '2', '2', '2026-04-14 20:50:21', null, '2026-04-14 09:00:00', null, '2026-04-14 20:49:53', '2026-04-14 20:55:11', '2', '橘猫', null);
INSERT INTO `orders` VALUES ('32', 'M202604151054087272', '2', 'PRODUCT', '49.00', '0.00', null, '4', '默认地址', '138****0000', '杭州市西湖区', '2026-04-15 10:54:08', null, null, null, '2026-04-15 10:54:08', '2026-04-15 10:54:34', null, null, null);
INSERT INTO `orders` VALUES ('33', 'S202604151055020355', '2', 'SERVICE', '89.00', '0.00', null, '13', '默认地址', '138****0000', '杭州市西湖区', '2026-04-15 10:55:27', null, '2026-04-15 14:00:00', null, '2026-04-15 10:55:02', '2026-04-15 10:55:39', '3', '雪球', null);

-- ----------------------------
-- Table structure for `order_item`
-- ----------------------------
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `service_id` bigint DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `service_time` datetime DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_price` decimal(10,2) DEFAULT NULL COMMENT '小计',
  `image` varchar(255) DEFAULT NULL COMMENT '图片',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单明细表';

-- ----------------------------
-- Records of order_item
-- ----------------------------
INSERT INTO `order_item` VALUES ('1', '6', '1', null, '安心寄养套餐', null, '129.00', '1', null, '2026-04-14 01:11:43', '129.00', null);
INSERT INTO `order_item` VALUES ('2', '7', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-14 01:13:49', '89.00', null);
INSERT INTO `order_item` VALUES ('3', '8', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-14 01:16:26', '89.00', null);
INSERT INTO `order_item` VALUES ('4', '9', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-14 01:19:01', '89.00', null);
INSERT INTO `order_item` VALUES ('5', '10', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-14 01:24:32', '89.00', null);
INSERT INTO `order_item` VALUES ('6', '11', '1', null, '安心寄养套餐', null, '129.00', '1', null, '2026-04-14 01:24:57', '129.00', null);
INSERT INTO `order_item` VALUES ('7', '12', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-14 01:28:07', '89.00', null);
INSERT INTO `order_item` VALUES ('8', '13', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-14 01:31:36', '89.00', null);
INSERT INTO `order_item` VALUES ('9', '14', '33', null, '围兜', null, '12.00', '1', null, '2026-04-14 02:44:22', '12.00', 'https://via.placeholder.com/400x400?text=No+Image');
INSERT INTO `order_item` VALUES ('10', '15', '32', null, '宠物鞋子（4只装）', null, '45.00', '1', null, '2026-04-14 03:09:53', '45.00', 'https://via.placeholder.com/400x400?text=No+Image');
INSERT INTO `order_item` VALUES ('11', '16', '7', null, '牙齿清洁', null, '59.00', '1', null, '2026-04-14 03:18:04', '59.00', null);
INSERT INTO `order_item` VALUES ('12', '17', '6', null, '修剪指甲', null, '29.00', '1', null, '2026-04-14 03:21:32', '29.00', null);
INSERT INTO `order_item` VALUES ('13', '18', '9', null, '周卡（7次）', null, '199.00', '1', null, '2026-04-14 03:27:49', '199.00', null);
INSERT INTO `order_item` VALUES ('14', '19', '31', null, '宠物项圈（皮质）', null, '35.00', '1', null, '2026-04-14 17:31:08', '35.00', 'https://via.placeholder.com/400x400?text=No+Image');
INSERT INTO `order_item` VALUES ('15', '20', '30', null, '宠物针织毛衣', null, '49.00', '1', null, '2026-04-14 18:33:17', '49.00', 'https://via.placeholder.com/400x400?text=No+Image');
INSERT INTO `order_item` VALUES ('16', '21', '6', null, '修剪指甲', null, '29.00', '1', null, '2026-04-14 18:33:27', '29.00', null);
INSERT INTO `order_item` VALUES ('17', '22', '11', null, '豪华寄养', null, '199.00', '1', null, '2026-04-14 19:13:21', '199.00', null);
INSERT INTO `order_item` VALUES ('18', '23', '11', null, '豪华寄养', null, '199.00', '1', null, '2026-04-14 19:13:26', '199.00', null);
INSERT INTO `order_item` VALUES ('19', '24', '13', null, '跨城运送', null, '299.00', '1', null, '2026-04-14 19:27:52', '299.00', null);
INSERT INTO `order_item` VALUES ('20', '25', '29', null, '宠物雨衣（S码）', null, '59.00', '1', null, '2026-04-14 19:55:06', '59.00', 'https://via.placeholder.com/400x400?text=No+Image');
INSERT INTO `order_item` VALUES ('21', '28', '30', null, '宠物针织毛衣', null, '49.00', '1', null, '2026-04-14 20:19:29', '49.00', '/images/goods/dog-sweater.jpg');
INSERT INTO `order_item` VALUES ('22', '29', '32', null, '宠物鞋子（4只装）', null, '45.00', '1', null, '2026-04-14 20:19:44', '45.00', '/images/goods/dog-shoes.jpg');
INSERT INTO `order_item` VALUES ('23', '30', '30', null, '宠物针织毛衣', null, '49.00', '1', null, '2026-04-14 20:20:58', '49.00', '/images/goods/dog-sweater.jpg');
INSERT INTO `order_item` VALUES ('24', '31', '6', null, '修剪指甲', null, '29.00', '1', null, '2026-04-14 20:49:53', '29.00', null);
INSERT INTO `order_item` VALUES ('25', '32', '16', null, '宠物针织毛衣', null, '49.00', '1', null, '2026-04-15 10:54:08', '49.00', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.uQ9qyTOYsh3dfMBcMoaeQwHaHa?w=208&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3');
INSERT INTO `order_item` VALUES ('26', '33', '2', null, '上门铲屎周卡', null, '89.00', '1', null, '2026-04-15 10:55:02', '89.00', 'https://images.pexels.com/photos/5490106/pexels-photo-5490106.jpeg?w=400&h=400&fit=crop');

-- ----------------------------
-- Table structure for `pet`
-- ----------------------------
DROP TABLE IF EXISTS `pet`;
CREATE TABLE `pet` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `name` varchar(50) NOT NULL COMMENT '宠物名称',
  `age` int DEFAULT NULL COMMENT '年龄(月)',
  `breed` varchar(50) DEFAULT NULL COMMENT '品种',
  `type` varchar(20) DEFAULT NULL COMMENT '类型',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像',
  `weight` decimal(10,2) DEFAULT NULL COMMENT '体重(kg)',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_pet_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='宠物表';

-- ----------------------------
-- Records of pet
-- ----------------------------
INSERT INTO `pet` VALUES ('1', '2', '布丁', '18', '英国短毛猫', '猫', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop', '4.50', '2024-01-15', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:08', '猫咪', null, null);
INSERT INTO `pet` VALUES ('2', '2', 'lucky', '8', '金毛寻回犬', '狗', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop', '22.00', '2024-08-20', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:14', '狗狗', null, null);
INSERT INTO `pet` VALUES ('3', '2', '雪球', '12', '布偶猫', '猫', 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=400&fit=crop', '5.20', '2024-04-10', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:19', '猫咪', null, null);
INSERT INTO `pet` VALUES ('4', '3', '豆豆', '24', '柴犬', '狗', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop', '9.50', '2023-06-10', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:20', '狗狗', null, null);
INSERT INTO `pet` VALUES ('5', '3', '糯米', '6', '美国短毛猫', '猫', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop', '3.20', '2024-10-05', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:21', '猫咪', null, null);
INSERT INTO `pet` VALUES ('6', '3', '咖啡', '15', '泰迪', '狗', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop', '4.80', '2023-12-01', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:23', '狗狗', null, null);
INSERT INTO `pet` VALUES ('7', '4', '奥利奥', '10', '边境牧羊犬', '狗', 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&h=400&fit=crop', '14.00', '2024-03-22', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:24', '狗狗', null, null);
INSERT INTO `pet` VALUES ('8', '4', '年糕', '4', '暹罗猫', '猫', 'https://images.unsplash.com/photo-1513245543132-8a05f59e3f28?w=400&h=400&fit=crop', '2.80', '2024-11-15', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:26', '猫咪', null, null);
INSERT INTO `pet` VALUES ('9', '4', '团团', '20', '柯基犬', '狗', 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=400&h=400&fit=crop', '11.50', '2023-09-08', '1', '2026-04-14 23:10:43', '2026-04-14 23:11:28', '狗狗', null, null);
INSERT INTO `pet` VALUES ('19', '2', '1', '1', '1', '狗狗', null, '1.00', '2026-04-15', '1', '2026-04-15 10:56:12', '2026-04-15 10:56:12', null, null, null);

-- ----------------------------
-- Table structure for `product`
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '商品名称',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `pet_type` tinyint(1) NOT NULL COMMENT '宠物类型',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存',
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'https://tse2-mm.cn.bing.net/th/id/OIP-C.OR8HNjC7cyF0TL9vyquRQgHaHa?w=183&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' COMMENT '鍥剧墖URL',
  `description` text COMMENT '商品描述',
  `sales` int DEFAULT '0' COMMENT '销量',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态',
  `sort_order` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='商品表';

-- ----------------------------
-- Records of product
-- ----------------------------
INSERT INTO `product` VALUES ('1', '全价成犬粮（大型犬）', '1', '1', '189.90', '229.00', '500', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.it06OZSf0fLK25KMHNMbDwHaHa?w=208&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '专为大型成犬设计的全价营养粮，含优质蛋白和多种维生素，满足日常营养需求，助力骨骼健康发育。', '234', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:37:32');
INSERT INTO `product` VALUES ('2', '幼犬成长粮（小型犬）', '1', '1', '159.00', '189.00', '380', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.RLSPy_NCcX6GE4gX5u-rMAHaHa?w=174&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '专为小型幼犬研发，添加DHA和钙质，促进大脑和骨骼发育，易消化配方。', '189', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:38:09');
INSERT INTO `product` VALUES ('3', '鸡肉味狗零食大礼包', '2', '1', '45.50', '68.00', '800', 'https://tse3-mm.cn.bing.net/th/id/OIP-C.LXWRIgvbMA1lueu31fXBlAHaHa?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '内含多种口味，鸡肉条、牛肉粒、磨牙棒等，训练奖励好选择。', '567', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:38:47');
INSERT INTO `product` VALUES ('4', '纯肉风干牛肋骨', '2', '1', '38.00', '55.00', '450', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.KBHmldRHhPhYTjhar3vE4wHaE8?w=263&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '100%纯牛肋骨，低温风干工艺，耐嚼磨牙，清洁牙齿。', '234', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:39:21');
INSERT INTO `product` VALUES ('5', '体外驱虫滴剂（3支装）', '3', '1', '88.00', null, '300', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.3iiNTGZPfsm9dLt2ch6GNgHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '有效驱杀跳蚤、蜱虫、虱子，一支管一个月，安全高效。', '567', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:39:43');
INSERT INTO `product` VALUES ('6', '宠物专用除臭喷雾', '3', '1', '35.00', '49.00', '280', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.sc8NeJnmX2zuP8hjxGCQUAAAAA?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '生物酶分解异味，安全无毒，可直接喷在宠物身上或环境中。', '278', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:40:12');
INSERT INTO `product` VALUES ('7', '益生菌调理粉', '4', '1', '58.00', '78.00', '400', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.Ur-WF1Qhsnd93esus08fWAHaHa?w=199&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '200亿活性益生菌，改善肠道健康，缓解软便腹泻。', '456', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:40:39');
INSERT INTO `product` VALUES ('8', '卵磷脂美毛粉', '4', '1', '88.00', '129.00', '170', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.cfTFJxMpiXmWcBTKeEBMaAHaJ4?w=149&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '富含卵磷脂和OMEGA-3，改善毛质，减少掉毛，亮泽毛发。', '189', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:41:07');
INSERT INTO `product` VALUES ('9', '便携宠物背包', '5', '1', '159.00', null, '150', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.a44F0RyZeoPe4b19z_Tn0gHaHa?w=204&h=204&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '透气设计，可携带小型犬，符合航空标准，多色可选。', '89', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:55:46');
INSERT INTO `product` VALUES ('10', '宠物智能饮水机', '5', '1', '129.00', '199.00', '95', 'https://tse3-mm.cn.bing.net/th/id/OIP-C.4fJKtScoMhUuo3rGX9Vi9gHaHa?w=201&h=201&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '活水循环，三重过滤，鼓励宠物多喝水。', '78', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:56:21');
INSERT INTO `product` VALUES ('11', '宠物专用消炎药', '6', '1', '45.00', null, '200', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.v-U53_JJ5DI5AJaYrpAVRwAAAA?w=178&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '广谱抗菌，治疗皮肤感染、呼吸道感染，遵医嘱使用。', '67', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:44:24');
INSERT INTO `product` VALUES ('12', '宠物外伤喷剂', '6', '1', '38.00', '55.00', '180', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.PxBpRV9zqzROf3qFOGqoggHaHR?w=211&h=207&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '消毒杀菌，促进伤口愈合，舔舐无害。', '123', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:44:00');
INSERT INTO `product` VALUES ('13', '发声玩具球套装', '7', '1', '32.90', null, '600', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.r65kNAFt5vHwYna1OYvPaAAAAA?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '内含3个不同尺寸发声球，耐咬橡胶材质，互动好玩。', '432', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:43:25');
INSERT INTO `product` VALUES ('14', '磨牙绳结玩具', '7', '1', '18.00', '28.00', '520', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.7eHYb-QFuOBCU17bPv8D9AAAAA?w=189&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '纯棉材质，清洁牙齿，拉扯互动，消耗精力。', '378', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:42:36');
INSERT INTO `product` VALUES ('15', '宠物雨衣（S码）', '8', '1', '59.00', null, '120', 'https://tse4-mm.cn.bing.net/th/id/OIP-C._SGD6bLInrBgn_Rsr7liIAHaJ5?w=159&h=213&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '防水透气，带帽檐设计，多色可选，S-XL码齐全。', '78', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:42:09');
INSERT INTO `product` VALUES ('16', '宠物针织毛衣', '8', '1', '49.00', '79.00', '90', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.uQ9qyTOYsh3dfMBcMoaeQwHaHa?w=208&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '柔软保暖，秋冬必备，时尚百搭。', '146', '1', '0', '2026-04-03 14:46:26', '2026-04-15 10:54:34');
INSERT INTO `product` VALUES ('17', '全价成猫粮（室内猫）', '9', '2', '169.00', '199.00', '450', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.aVY0GP0liJvGmoda7Nru0wHaJ3?w=160&h=214&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '专为室内成猫设计，控制体重，添加膳食纤维帮助排毛球。', '267', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:56:42');
INSERT INTO `product` VALUES ('18', '幼猫成长粮', '9', '2', '139.00', '169.00', '320', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.PyM2-TsMZZZPj01VH9VJjQHaHa?w=178&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '高蛋白配方，添加DHA和牛磺酸，支持大脑和视力发育。', '198', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:56:59');
INSERT INTO `product` VALUES ('19', '猫条（12支装）', '10', '2', '29.90', '45.00', '650', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.o_HxHk16QJ9yn2TVeBbbNwHaHe?w=207&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '多种口味可选，流质鲜肉，补充水分，互动奖励神器。', '789', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:57:21');
INSERT INTO `product` VALUES ('20', '冻干鸡肉粒', '10', '2', '48.00', '68.00', '380', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.6UK12lnVgfjVXHO_c10O5QHaHa?w=208&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '100%纯鸡肉，-40℃冻干技术，高蛋白低脂肪。', '456', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:57:43');
INSERT INTO `product` VALUES ('21', '化毛膏', '11', '2', '55.00', '75.00', '290', 'https://tse3-mm.cn.bing.net/th/id/OIP-C.gQs1YTOrfLcK6O4rQyZ-gQAAAA?w=206&h=206&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '含麦芽提取物，帮助排出毛球，添加维生素增强免疫力。', '345', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:58:12');
INSERT INTO `product` VALUES ('22', '猫用益生菌', '11', '2', '62.00', '88.00', '210', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.HsOUxAtZ2NSCtvVKoGkeQAAAAA?w=193&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '缓解软便呕吐，改善肠道菌群，提高消化吸收率。', '234', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:58:28');
INSERT INTO `product` VALUES ('23', '猫砂盆（全封闭式）', '12', '2', '89.00', '129.00', '180', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.kEnGKn_wBatdTSkGLUj7_wHaHa?w=216&h=216&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '全封闭设计，防臭防带砂，带过滤踏板，猫咪更舒适。', '167', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:58:46');
INSERT INTO `product` VALUES ('24', '猫抓板（瓦楞纸）', '12', '2', '35.00', '49.00', '420', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.HAbcKB-X8HhZ87hHeVJThgHaLQ?w=202&h=308&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '高密度瓦楞纸，耐抓不掉屑，可悬挂小球增加趣味。', '523', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:59:11');
INSERT INTO `product` VALUES ('25', '猫用体外驱虫滴剂', '13', '2', '95.00', null, '250', 'https://tse3-mm.cn.bing.net/th/id/OIP-C.WXj9714TUc6ZY4cfF72JRgHaHa?w=198&h=198&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '专为猫咪设计，驱杀跳蚤、耳螨、蜱虫，温和不刺激。', '345', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:59:30');
INSERT INTO `product` VALUES ('26', '猫鼻支滴眼液', '13', '2', '42.00', '58.00', '160', 'https://tse3-mm.cn.bing.net/th/id/OIP-C.H0ggGj-tJEkImg1bzUq1HgHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '缓解眼部红肿流泪，抑制病毒，辅助治疗猫鼻支。', '178', '1', '0', '2026-04-03 14:46:26', '2026-04-15 09:59:56');
INSERT INTO `product` VALUES ('27', '逗猫棒（羽毛款）', '14', '2', '15.00', '25.00', '580', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.aMIaXlQj7hGroQSeVEFjPgHaGx?w=235&h=216&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '天然羽毛+弹性杆，激发猫咪狩猎本能，增进互动。', '678', '1', '0', '2026-04-03 14:46:26', '2026-04-15 10:00:29');
INSERT INTO `product` VALUES ('28', '电动蝴蝶玩具', '14', '2', '49.00', '79.00', '230', 'https://tse4-mm.cn.bing.net/th/id/OIP-C.IXHXI5CTUy7v39gfu0rEwQHaIC?w=179&h=195&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '仿真蝴蝶飞舞，自动感应，USB充电，让猫咪玩不停。', '289', '1', '0', '2026-04-03 14:46:26', '2026-04-15 10:03:09');
INSERT INTO `product` VALUES ('29', '猫咪伊丽莎白圈', '15', '2', '28.00', '45.00', '310', 'https://tse1-mm.cn.bing.net/th/id/OIP-C.p3JT8spjbyvgqpeClXJnPQHaIF?w=168&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '柔软面料，术后防护，防舔防抓，可调节大小。', '234', '1', '0', '2026-04-03 14:46:26', '2026-04-15 10:03:46');
INSERT INTO `product` VALUES ('30', '猫咪牵引绳（胸背式）', '15', '2', '42.00', '65.00', '150', 'https://tse3-mm.cn.bing.net/th/id/OIP-C.G2mdT-07a91fxXOpZ5HBZQAAAA?w=191&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', '轻盈透气，防挣脱设计，适合带猫外出散步。', '98', '1', '0', '2026-04-03 14:46:26', '2026-04-15 10:04:02');
INSERT INTO `product` VALUES ('31', '1', '1', '1', '1.00', '1.00', '1', null, null, null, '0', null, '2026-04-15 10:26:27', '2026-04-15 10:27:40');

-- ----------------------------
-- Table structure for `service`
-- ----------------------------
DROP TABLE IF EXISTS `service`;
CREATE TABLE `service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `name` varchar(200) NOT NULL COMMENT '服务名称',
  `description` text COMMENT '服务描述',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `image_url` varchar(500) DEFAULT NULL COMMENT '图片URL',
  `duration` int DEFAULT NULL COMMENT '服务时长(分钟)',
  `sales` int DEFAULT '0' COMMENT '销量',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='服务表';

-- ----------------------------
-- Records of service
-- ----------------------------
INSERT INTO `service` VALUES ('1', '1', '安心寄养套餐', '包含每日遛狗、喂食、清洁，赠送精美玩具', '129.00', '199.00', 'https://images.pexels.com/photos/4060147/pexels-photo-4060147.jpeg?w=400&h=400&fit=crop', '1440', '128', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('2', '1', '上门铲屎周卡', '7天上门服务，包含喂食、铲屎、陪玩', '89.00', '120.00', 'https://images.pexels.com/photos/5490106/pexels-photo-5490106.jpeg?w=400&h=400&fit=crop', '30', '256', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('3', '2', '基础护理5折', '洗澡、修剪指甲、耳道清洁套餐', '49.00', '98.00', 'https://images.pexels.com/photos/5511294/pexels-photo-5511294.jpeg?w=400&h=400&fit=crop', '60', '512', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('4', '2', '专车接送8折', '宠物专车上门接送服务', '32.00', '40.00', 'https://images.pexels.com/photos/13754167/pexels-photo-13754167.jpeg?w=400&h=400&fit=crop', '30', '189', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('5', '3', '洗澡美容', '专业宠物洗护+美容造型', '88.00', null, 'https://images.pexels.com/photos/5511294/pexels-photo-5511294.jpeg?w=400&h=400&fit=crop', '90', '356', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('6', '3', '修剪指甲', '专业宠物指甲修剪+打磨', '29.00', null, 'https://images.pexels.com/photos/17696017/pexels-photo-17696017.jpeg?w=400&h=400&fit=crop', '20', '623', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('7', '3', '牙齿清洁', '宠物专业口腔护理', '59.00', null, 'https://images.pexels.com/photos/7728408/pexels-photo-7728408.jpeg?w=400&h=400&fit=crop', '30', '234', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('8', '4', '单次上门铲屎', '单次上门服务，包含喂食、铲屎', '39.00', null, 'https://images.pexels.com/photos/5490106/pexels-photo-5490106.jpeg?w=400&h=400&fit=crop', '20', '456', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('9', '4', '周卡（7次）', '7天上门铲屎服务', '199.00', '273.00', 'https://images.pexels.com/photos/5490106/pexels-photo-5490106.jpeg?w=400&h=400&fit=crop', '30', '167', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('10', '5', '标准寄养', '标准宠物寄养服务', '99.00', null, 'https://images.pexels.com/photos/4060147/pexels-photo-4060147.jpeg?w=400&h=400&fit=crop', '1440', '289', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('11', '5', '豪华寄养', '豪华宠物寄养服务，包含美容', '199.00', null, 'https://images.pexels.com/photos/4060147/pexels-photo-4060147.jpeg?w=400&h=400&fit=crop', '1440', '98', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('12', '6', '市内接送', '市内宠物专车接送', '29.00', null, 'https://images.pexels.com/photos/13754167/pexels-photo-13754167.jpeg?w=400&h=400&fit=crop', '30', '567', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('13', '6', '跨城运送', '跨城宠物专车运送', '299.00', null, 'https://images.pexels.com/photos/13754167/pexels-photo-13754167.jpeg?w=400&h=400&fit=crop', '240', '45', '1', '2026-03-20 23:04:10', '2026-04-15 00:57:15');
INSERT INTO `service` VALUES ('14', '1', '洗浴', null, '12.00', '12.00', 'https://images.pexels.com/photos/5511294/pexels-photo-5511294.jpeg?w=400&h=400&fit=crop', null, '0', '0', '2026-04-03 22:24:52', '2026-04-15 00:57:15');

-- ----------------------------
-- Table structure for `store`
-- ----------------------------
DROP TABLE IF EXISTS `store`;
CREATE TABLE `store` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(200) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `business_hours` varchar(100) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='门店表';

-- ----------------------------
-- Records of store
-- ----------------------------
INSERT INTO `store` VALUES ('1', '萌宠诊所（望京店）', '望京街10号', '010-12345678', '116.483000', '40.000000', null, '09:00-21:00', '1', '2026-03-20 23:04:10');
INSERT INTO `store` VALUES ('2', '宠物家（朝悦店）', '朝阳大悦城B1', '010-87654321', '116.520000', '39.920000', null, '10:00-22:00', '1', '2026-03-20 23:04:10');

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '寰俊openid',
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '鏄电О',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `role` enum('admin','user') DEFAULT 'user' COMMENT '鐘舵€?',
  `account` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_time` datetime DEFAULT NULL,
  `avatar_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'https://gd-hbimg.huaban.com/3d08684c78c6bef02339f8be1ba7e1d64f6dcfd828ba-nTzqqR_fw658',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  CONSTRAINT `chk_openid_rule` CHECK ((((`role` = _utf8mb4'user') and (`openid` is not null)) or (`role` = _utf8mb4'admin')))
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', null, 'admin', '13800000001', 'admin', 'admin', '123456', '杭州', '2026-04-03 23:21:28', '2026-04-15 10:09:26', '2026-04-15 10:09:26', 'https://tse2-mm.cn.bing.net/th/id/OIP-C.rANtIRPohsqz7aaFBN66fgHaHa?w=176&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3');
INSERT INTO `user` VALUES ('2', 'o123456789', '张三', '13800000002', 'user', '123', '456', '杭州', '2026-04-03 23:21:28', '2026-04-15 10:07:24', null, 'https://tse2-mm.cn.bing.net/th/id/OIP-C.orUmH_cKk9_vYiFVgGD7FwHaHa?w=198&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3');
INSERT INTO `user` VALUES ('3', 'o987654321', '李四', '13800000003', 'user', '456', '789', '杭州', '2026-04-03 23:21:28', '2026-04-15 10:07:49', null, 'https://tse1-mm.cn.bing.net/th/id/OIP-C.CH3QV5Y-cUCX6Zx4nf_ncwHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3');
INSERT INTO `user` VALUES ('4', 'o112233445', '王五', '13800000004', 'user', '789', '456', '杭州', '2026-04-03 23:21:28', '2026-04-14 23:48:45', null, 'https://tse1-mm.cn.bing.net/th/id/OIP-C.d3VvC2L9L2klroDjIb3xwgHaHJ?w=204&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3');
