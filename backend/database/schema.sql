-- QuickShop SaaS Database Schema
-- Created for multi-tenant e-commerce platform

-- Users table (SaaS customers)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    plan_type ENUM('basic', 'pro') DEFAULT 'basic',
    subscription_status ENUM('active', 'inactive', 'trial', 'cancelled') DEFAULT 'trial',
    trial_ends_at DATETIME,
    subscription_ends_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

-- Stores table (each user can have one store)
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    description TEXT,
    template_name VARCHAR(50) DEFAULT 'jupiter',
    settings JSON, -- Store-specific settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_slug (slug),
    INDEX idx_domain (domain)
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    parent_id INT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    UNIQUE KEY unique_store_slug (store_id, slug),
    INDEX idx_store_id (store_id),
    INDEX idx_parent_id (parent_id)
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100),
    type ENUM('simple', 'variable') DEFAULT 'simple',
    status ENUM('active', 'inactive', 'draft') DEFAULT 'draft',
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    track_inventory BOOLEAN DEFAULT true,
    inventory_quantity INT DEFAULT 0,
    allow_backorder BOOLEAN DEFAULT false,
    weight DECIMAL(8,2),
    dimensions JSON, -- {length, width, height}
    requires_shipping BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    seo_title VARCHAR(255),
    seo_description TEXT,
    tags JSON, -- Array of tags
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    UNIQUE KEY unique_store_slug (store_id, slug),
    INDEX idx_store_id (store_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_sku (sku)
);

-- Product options (size, color, etc.)
CREATE TABLE product_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- 'Size', 'Color', etc.
    type ENUM('text', 'color', 'image', 'button') DEFAULT 'text',
    display_type ENUM('dropdown', 'radio', 'swatch') DEFAULT 'dropdown',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_store_name (store_id, name)
);

-- Product option values
CREATE TABLE product_option_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    option_id INT NOT NULL,
    value VARCHAR(255) NOT NULL,
    color_code VARCHAR(7), -- For color options
    image_url VARCHAR(500), -- For image options
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE,
    INDEX idx_option_id (option_id)
);

-- Product variants (for variable products)
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    inventory_quantity INT DEFAULT 0,
    weight DECIMAL(8,2),
    option_values JSON, -- {option_id: value_id}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_sku (sku)
);

-- Media files
CREATE TABLE media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    width INT,
    height INT,
    s3_key VARCHAR(500) NOT NULL,
    s3_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_store_id (store_id)
);

-- Product media relationship
CREATE TABLE product_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    media_id INT NOT NULL,
    variant_id INT NULL, -- For variant-specific images
    type ENUM('image', 'video') DEFAULT 'image',
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    color_option_value_id INT NULL, -- For color-specific galleries
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (color_option_value_id) REFERENCES product_option_values(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_media_id (media_id),
    INDEX idx_variant_id (variant_id)
);

-- Coupons table
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    usage_limit_per_customer INT DEFAULT 1,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    starts_at DATETIME,
    expires_at DATETIME,
    applies_to ENUM('all', 'specific_products', 'specific_categories') DEFAULT 'all',
    product_ids JSON, -- Array of product IDs
    category_ids JSON, -- Array of category IDs
    can_combine_with_other_coupons BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_store_code (store_id, code),
    INDEX idx_store_id (store_id),
    INDEX idx_code (code),
    INDEX idx_active_dates (is_active, starts_at, expires_at)
);

-- Automatic discounts
CREATE TABLE automatic_discounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed_amount', 'bogo', 'buy_x_get_y') NOT NULL,
    value DECIMAL(10,2),
    minimum_amount DECIMAL(10,2),
    minimum_quantity INT,
    buy_quantity INT, -- For BOGO and buy_x_get_y
    get_quantity INT, -- For buy_x_get_y
    is_active BOOLEAN DEFAULT true,
    starts_at DATETIME,
    expires_at DATETIME,
    applies_to ENUM('all', 'specific_products', 'specific_categories') DEFAULT 'all',
    product_ids JSON,
    category_ids JSON,
    can_combine_with_coupons BOOLEAN DEFAULT true,
    priority INT DEFAULT 0, -- Higher priority applies first
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_store_id (store_id),
    INDEX idx_active_dates (is_active, starts_at, expires_at),
    INDEX idx_priority (priority)
);

-- Store customers
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    accepts_marketing BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_store_email (store_id, email),
    INDEX idx_store_id (store_id),
    INDEX idx_email (email)
);

-- Customer addresses
CREATE TABLE customer_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    type ENUM('billing', 'shipping') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL, -- ISO country code
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
);

-- Orders
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    customer_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    fulfillment_status ENUM('unfulfilled', 'partial', 'fulfilled') DEFAULT 'unfulfilled',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    billing_address JSON,
    shipping_address JSON,
    notes TEXT,
    coupon_codes JSON, -- Array of applied coupon codes
    applied_discounts JSON, -- Array of applied automatic discounts
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    tracking_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_store_id (store_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Order items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Price at time of order
    total DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- Snapshot at time of order
    product_sku VARCHAR(100),
    variant_options JSON, -- Snapshot of selected options
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Cart sessions (for guest users)
CREATE TABLE cart_sessions (
    id VARCHAR(255) PRIMARY KEY, -- Session ID
    store_id INT NOT NULL,
    customer_id INT NULL,
    items JSON NOT NULL, -- Cart items data
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_store_id (store_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_expires_at (expires_at)
);

-- Page builder content
CREATE TABLE pages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    type ENUM('home', 'content', 'category', 'product') NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content JSON, -- Page builder content
    seo_title VARCHAR(255),
    seo_description TEXT,
    is_published BOOLEAN DEFAULT false,
    template_override VARCHAR(100), -- Override default template
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_store_slug (store_id, slug),
    INDEX idx_store_id (store_id),
    INDEX idx_type (type)
);

-- Analytics and tracking
CREATE TABLE analytics_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', etc.
    event_data JSON,
    session_id VARCHAR(255),
    customer_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_store_id (store_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_session_id (session_id)
);

-- Subscription billing
CREATE TABLE billing_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    billing_period_start DATE,
    billing_period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- System settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (key_name, value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('default_currency', 'ILS', 'Default currency for new stores'),
('max_products_basic', '100', 'Maximum products for basic plan'),
('max_products_pro', '-1', 'Maximum products for pro plan (-1 = unlimited)'),
('trial_period_days', '14', 'Trial period in days'),
('basic_plan_price', '299', 'Basic plan monthly price'),
('pro_plan_price', '399', 'Pro plan monthly price'),
('transaction_fee_rate', '0.005', 'Transaction fee rate (0.5%)');
