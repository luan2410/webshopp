-- Drop existing orders tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- Recreate orders table with correct schema
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_date DATETIME NOT NULL,
    code VARCHAR(10),
    status VARCHAR(50) NOT NULL,
    total_amount DOUBLE,
    shipping_address VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Recreate order_items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
