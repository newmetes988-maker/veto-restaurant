-- ==========================================
-- Restaurant Reservation System Schema
-- Run this against your PostgreSQL database
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==========================================
-- 1. TENANTS
-- ==========================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    subscription_plan VARCHAR(20) NOT NULL DEFAULT 'free',
    billing_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. RESTAURANTS
-- ==========================================
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    opening_time TIME NOT NULL DEFAULT '09:00',
    closing_time TIME NOT NULL DEFAULT '23:00',
    slot_duration_minutes INT NOT NULL DEFAULT 60,
    advance_booking_days INT NOT NULL DEFAULT 30,
    logo_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- ==========================================
-- 3. ADMIN USERS
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('owner', 'manager', 'host', 'staff');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role admin_role NOT NULL DEFAULT 'staff',
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- ==========================================
-- 4. TABLES
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status') THEN
        CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    status table_status NOT NULL DEFAULT 'available',
    location VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(restaurant_id, name)
);

-- ==========================================
-- 5. CUSTOMERS
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    email VARCHAR(255),
    name VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    visit_count INT NOT NULL DEFAULT 0,
    notes TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_customer_contact CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- ==========================================
-- 6. RESERVATIONS (Core)
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    party_size INT NOT NULL CHECK (party_size > 0),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 120,
    status reservation_status NOT NULL DEFAULT 'pending',
    qr_code VARCHAR(255) UNIQUE,
    source VARCHAR(20) NOT NULL DEFAULT 'web',
    confirmed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    rejection_reason VARCHAR(255),
    reminder_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 7. RESERVATION LOGS (Audit)
-- ==========================================
CREATE TABLE IF NOT EXISTS reservation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    from_status reservation_status,
    to_status reservation_status NOT NULL,
    changed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 8. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_restaurants_tenant ON restaurants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_tenant ON admin_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tables_tenant ON tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_tenant ON reservation_logs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_scheduled ON reservations(restaurant_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_status_scheduled ON reservations(restaurant_id, status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_active ON reservations(restaurant_id, scheduled_at) WHERE status IN ('pending', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_qr ON reservations(qr_code);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id, status, capacity);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_reservation ON reservation_logs(reservation_id, created_at DESC);

-- ==========================================
-- 9. SEED DATA (For Development)
-- ==========================================
INSERT INTO tenants (id, name, slug, subscription_plan)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Restaurant Group', 'demo-group', 'pro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO restaurants (id, tenant_id, name, slug, timezone, opening_time, closing_time)
VALUES ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Veto Cafe & Restaurant', 'veto-cafe', 'Africa/Cairo', '10:00', '00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tables (id, tenant_id, restaurant_id, name, capacity, location)
VALUES 
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'T-01', 2, 'indoor'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'T-02', 4, 'indoor'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'T-03', 6, 'terrace')
ON CONFLICT (restaurant_id, name) DO NOTHING;

-- ==========================================
-- PRODUCTS (Dynamic Menu)
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    badge VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(tenant_id, is_active);

-- ==========================================
-- CATEGORIES (Dynamic Menu Sections)
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'utensils',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(tenant_id, sort_order);

-- Seed default categories
INSERT INTO categories (id, tenant_id, name, name_ar, slug, icon, sort_order) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Soups', 'شوربة', 'soups', 'soup', 1),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Noodles', 'نودلز', 'noodles', 'noodles', 2),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Appetizers', 'مقبلات', 'appetizers', 'appetizer', 3),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Gunkan', 'جونكان', 'gunkan', 'gunkan', 4),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Temaki', 'تيماكي', 'temaki', 'temaki', 5),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Oshi', 'أوشي', 'oshi', 'oshi', 6),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Nigiri', 'نيجيري', 'nigiri', 'nigiri', 7),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Sashimi', 'ساشيمي', 'sashimi', 'sashimi', 8),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Maki', 'ماكي', 'maki', 'maki', 9),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Special Rolls', 'رولز خاصة', 'special-rolls', 'special', 10),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Fried Rolls', 'رولز مقلية', 'fried-rolls', 'fried', 11),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dynamite', 'ديناميت', 'dynamite', 'dynamite', 12),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Fire Rolls', 'فاير رولز', 'fire-rolls', 'fire', 13),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Poké', 'بوكيه', 'poke', 'poke', 14),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Combos', 'كومبو', 'combos', 'combos', 15),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Coffee', 'قهوة', 'coffee', 'coffee', 16),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Juices', 'عصائر', 'juices', 'juices', 17),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Mocktails', 'موكتيل', 'mocktails', 'mocktails', 18),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Milkshake', 'ميلك شيك', 'milkshake', 'milkshake', 19),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dessert', 'حلويات', 'dessert', 'dessert', 20),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Waffle', 'وافل', 'waffle', 'waffle', 21)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ==========================================
-- SAMPLE PRODUCTS (Sushi Menu)
-- ==========================================
INSERT INTO products (id, tenant_id, name, name_ar, description, description_ar, price, category, badge, is_active) VALUES
-- SOUPS
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Miso Soup', 'شوربة ميسو', 'Tofu + miso paste + wakame + sesame + hondashi + green onion', 'توفو + معجون ميسو + واكامي + سمسم + هونداشي + بصل أخضر', 175, 'Soups', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Tom Yum', 'شوربة توم يوم', 'Shrimp + crab + wakame + hondashi + tom yum paste + ginger', 'جمبري + كابوريا + واكامي + هونداشي + معجون توم يوم + زنجبيل', 215, 'Soups', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Shifudo Soup', 'شوربة سيفود', 'Shrimp + calamari + mussels + cheddar cheese', 'جمبري + كالاماري + بلح البحر + جبنة شيدر حمراء', 223, 'Soups', null, true),

-- NOODLES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Shrimp Noodles', 'نودلز الجمبري', null, null, 259, 'Noodles', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Fried Shrimp Noodles', 'نودلز الجمبري المقلي', 'Served with cocktail sauce', 'تُقدم مع صوص الكوكتيل', 263, 'Noodles', 'New', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Chicken Noodles', 'نودلز الدجاج', null, null, 236, 'Noodles', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Fried Chicken Noodles', 'نودلز الدجاج المقلي', 'Served with cocktail sauce', 'تُقدم مع صوص الكوكتيل', 241, 'Noodles', 'New', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Crab Noodles', 'نودلز الكابوريا', null, null, 215, 'Noodles', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Seafood Noodles', 'نودلز سي فود', null, null, 281, 'Noodles', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Vegetable Noodles', 'نودلز الخضار', null, null, 149, 'Noodles', null, true),

-- APPETIZERS
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'All Stars Shrimp', 'أول ستارز جمبري', 'Fried seasoned shrimp with spicy mayo + sesame + green onion', 'جمبري مقلي متبل مع مايونيز حار + سمسم + بصل أخضر', 307, 'Appetizers', 'New', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Golden Shrimps (4 pcs)', 'جولدن جمبري (٤ قطع)', 'Golden fried seasoned shrimp with cocktail sauce', 'جمبري مقلي متبل ذهبي يُقدم مع صوص الكوكتيل', 193, 'Appetizers', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Shrimp Fingers (2 pcs)', 'أصابع جمبري (٢ قطعة)', 'Shrimp + smoked salmon + cheddar + sweet chili sauce', 'جمبري + سلمون مدخن + جبنة شيدر + صوص تشيلي حلو', 193, 'Appetizers', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Fried Calamari', 'كالاماري مقلي', 'Crispy seasoned calamari with cocktail + sweet chili sauce', 'كالاماري مقرمش متبل يُقدم مع صوص الكوكتيل + صوص تشيلي حلو', 175, 'Appetizers', null, true),

-- NIGIRI
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Salmon Nigiri', 'نيجيري سلمون', 'Per piece', 'بالقطعة', 48, 'Nigiri', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Tuna Nigiri', 'نيجيري تونا', 'Per piece', 'بالقطعة', 48, 'Nigiri', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Eel Nigiri', 'نيجيري ثعبان البحر', 'Per piece', 'بالقطعة', 52, 'Nigiri', null, true),

-- SASHIMI
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Salmon Sashimi (3 pcs)', 'ساشيمي سلمون (٣ قطع)', '3 pieces', '٣ قطع', 122, 'Sashimi', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Tuna Sashimi (3 pcs)', 'ساشيمي تونا (٣ قطع)', '3 pieces', '٣ قطع', 140, 'Sashimi', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Mixed Sashimi Platter', 'طبق ساشيمي مشكل', 'Assorted premium sashimi', 'تشكيلة ساشيمي ممتازة', 450, 'Sashimi', 'Popular', true),

-- SPECIAL ROLLS
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dragon Roll (4 pcs)', 'دراجون رول (٤ قطع)', 'Inside: eel + cucumber/avocado | Outside: avocado + sesame | Sauce: teriyaki', 'داخل: ثعبان البحر + خيار/أفوكادو | خارج: أفوكادو + سمسم | صوص: ترياكي', 197, 'Special Rolls', 'Popular', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dragon Roll (8 pcs)', 'دراجون رول (٨ قطع)', 'Inside: eel + cucumber/avocado | Outside: avocado + sesame | Sauce: teriyaki', 'داخل: ثعبان البحر + خيار/أفوكادو | خارج: أفوكادو + سمسم | صوص: ترياكي', 381, 'Special Rolls', 'Popular', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Volcano Roll (4 pcs)', 'فولكينو رول (٤ قطع)', 'Inside: crab + shrimp tempura + cream cheese | Outside: smoked salmon + cheddar | Sauce: spicy mayo + lemon mayo', 'داخل: كابوريا + جمبري تمبورا + جبنة كريمي | خارج: سلمون مدخن + جبنة شيدر', 228, 'Special Rolls', 'Hot', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Rainbow Roll (4 pcs)', 'رينبو رول (٤ قطع)', 'Inside: crab + cucumber/avocado | Outside: salmon + tuna + shrimp + avocado', 'داخل: كابوريا + خيار/أفوكادو | خارج: سلمون + تونا + جمبري + أفوكادو', 184, 'Special Rolls', null, true),

-- FRIED ROLLS
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Crunchy (6 pcs)', 'كرانشي (٦ قطع)', 'Inside: cream cheese | Outside: panko | Sauce: spicy mayo', 'داخل: جبنة كريمي | خارج: بانكو | صوص: مايونيز حار', 197, 'Fried Rolls', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Tiger (6 pcs)', 'تايجر (٦ قطع)', 'Inside: shrimp tempura + cream cheese | Outside: smoked salmon', 'داخل: جمبري تمبورا + جبنة كريمي | خارج: سلمون مدخن', 219, 'Fried Rolls', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Volcano (6 pcs)', 'فولكينو (٦ قطع)', 'Inside: crab + shrimp tempura + cream cheese | Outside: smoked salmon + cheddar', 'داخل: كابوريا + جمبري تمبورا + جبنة كريمي | خارج: سلمون مدخن + جبنة شيدر', 228, 'Fried Rolls', 'Hot', true),

-- COFFEE
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Espresso', 'إسبريسو', null, null, 57, 'Coffee', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Cappuccino', 'كابتشينو', null, null, 102, 'Coffee', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Spanish Latte', 'سبانيش لاتيه', null, null, 128, 'Coffee', 'Popular', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Pistachio Espresso', 'إسبريسو بستاشيو', null, null, 172, 'Coffee', 'New', true),

-- JUICES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Mango Juice', 'عصير مانجو', null, null, 109, 'Juices', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Strawberry Juice', 'عصير فراولة', null, null, 102, 'Juices', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Lemon Mint', 'ليمون ونعناع', null, null, 96, 'Juices', 'Popular', true),

-- MOCKTAILS
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Mojito Classic', 'موهيتو كلاسيك', null, null, 166, 'Mocktails', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dragon Kiss', 'دراجون كيس', null, null, 223, 'Mocktails', 'Popular', true),

-- MILKSHAKE
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Chocolate Milkshake', 'ميلك شيك شوكولاتة', null, null, 211, 'Milkshake', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Nutella Milkshake', 'ميلك شيك نوتيلا', null, null, 223, 'Milkshake', 'Popular', true),

-- DESSERTS
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Brownies', 'براونيز', null, null, 185, 'Dessert', null, true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Molten Cake', 'مولتن كيك', null, null, 211, 'Dessert', 'Popular', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'San Sebastian', 'سان سيباستيان', null, null, 160, 'Dessert', null, true),

-- WAFFLES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Waffle Nutella', 'وافل نوتيلا', null, null, 243, 'Waffle', 'Popular', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Waffle Pistachio', 'وافل بستاشيو', null, null, 281, 'Waffle', 'New', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Pancake Nutella', 'بان كيك نوتيلا', null, null, 198, 'Waffle', null, true)
ON CONFLICT DO NOTHING;

