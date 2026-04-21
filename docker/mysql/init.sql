CREATE DATABASE IF NOT EXISTS inventory_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventory_management;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '商品名',
    sku VARCHAR(100) NOT NULL UNIQUE COMMENT 'SKU编码',
    category VARCHAR(100) NOT NULL COMMENT '分类',
    unit VARCHAR(50) NOT NULL COMMENT '单位',
    cost_price DECIMAL(10, 2) NOT NULL COMMENT '成本价',
    sale_price DECIMAL(10, 2) NOT NULL COMMENT '售价',
    stock INT NOT NULL DEFAULT 0 COMMENT '当前库存量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT '商品ID',
    type ENUM('in', 'out') NOT NULL COMMENT '类型：in入库，out出库',
    quantity INT NOT NULL COMMENT '数量',
    supplier VARCHAR(255) DEFAULT NULL COMMENT '供应商（入库时）',
    reason ENUM('销售', '损耗', '退货') DEFAULT NULL COMMENT '出库原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO products (name, sku, category, unit, cost_price, sale_price, stock) VALUES
('笔记本电脑', 'SKU001', '电子产品', '台', 3500.00, 4999.00, 50),
('无线鼠标', 'SKU002', '配件', '个', 50.00, 99.00, 120),
('机械键盘', 'SKU003', '配件', '个', 150.00, 299.00, 8),
('显示器', 'SKU004', '电子产品', '台', 800.00, 1299.00, 30),
('耳机', 'SKU005', '配件', '副', 80.00, 159.00, 5);
