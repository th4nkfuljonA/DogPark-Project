-- ============================================================
-- CERTIFIEDCITYWHIPS — MariaDB Schema & Seed Data
-- Run this on your MariaDB database server
-- ============================================================

CREATE DATABASE IF NOT EXISTS certifiedcitywhips
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE certifiedcitywhips;

-- ── LOCATIONS ────────────────────────────────────────────────

CREATE TABLE locations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(2)   NOT NULL,
    zip         VARCHAR(10)  NOT NULL,
    phone       VARCHAR(20),
    hours_open  VARCHAR(5),
    hours_close VARCHAR(5),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO locations (id, name, address, city, state, zip, phone, hours_open, hours_close, is_active) VALUES
(1, 'Downtown Hub',      '100 Main St',              'San Bernardino', 'CA', '92401', '909-555-0100', '07:00', '21:00', TRUE),
(2, 'Airport Terminal',  '295 N Leland Norton Way',   'San Bernardino', 'CA', '92408', '909-555-0200', '06:00', '23:00', TRUE),
(3, 'Riverside Branch',  '3500 Market St',            'Riverside',      'CA', '92501', '951-555-0300', '08:00', '20:00', TRUE);

-- ── VEHICLE CLASSES ──────────────────────────────────────────

CREATE TABLE vehicle_classes (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    description   VARCHAR(255),
    passengers    INT DEFAULT 5,
    bags          INT DEFAULT 2,
    transmission  VARCHAR(20) DEFAULT 'automatic'
);

INSERT INTO vehicle_classes (id, name, description, passengers, bags, transmission) VALUES
(1, 'Economy',          'Compact fuel-efficient cars',             5,  2, 'automatic'),
(2, 'Standard Sedan',   'Mid-size sedans for everyday use',        5,  3, 'automatic'),
(3, 'Standard Pickup',  'Toyota Tacoma or similar',                5,  3, 'automatic'),
(4, '1/2 Ton Pickup',   'Ford F150 or similar',                    5,  4, 'automatic'),
(5, '3/4 Ton Pickup',   'GMC Sierra 2500 Crew Cab or similar',     5,  4, 'automatic'),
(6, 'SUV',              'Mid-size sport utility vehicle',          7,  4, 'automatic'),
(7, 'Luxury Sedan',     'Premium full-size sedan',                 5,  3, 'automatic'),
(8, 'Van',              'Passenger or cargo van',                  12, 6, 'automatic');

-- ── VEHICLES ─────────────────────────────────────────────────

CREATE TABLE vehicles (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    vin               VARCHAR(17) UNIQUE NOT NULL,
    name              VARCHAR(100) NOT NULL,
    make              VARCHAR(50) NOT NULL,
    model             VARCHAR(50) NOT NULL,
    year              INT NOT NULL,
    color             VARCHAR(30),
    mileage           INT DEFAULT 0,
    fuel_type         VARCHAR(20),
    class_id          INT,
    class_name        VARCHAR(50),
    location_id       INT,
    location_name     VARCHAR(100),
    listing_type      ENUM('rental', 'sale') NOT NULL,
    price             DECIMAL(10,2),
    daily_rate        DECIMAL(10,2),
    sale_price        DECIMAL(10,2),
    mileage_type      VARCHAR(20),
    status            VARCHAR(20) DEFAULT 'available',
    category          VARCHAR(30),
    category_label    VARCHAR(50),
    seats             INT DEFAULT 5,
    bags              INT DEFAULT 2,
    transmission      VARCHAR(20) DEFAULT 'Auto',
    fuel              VARCHAR(20),
    description       TEXT,
    features          LONGTEXT,
    image_url         VARCHAR(500),
    fallback_gradient VARCHAR(255),
    c1                VARCHAR(10),
    c2                VARCHAR(10),
    tag               VARCHAR(30),
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES vehicle_classes(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    CHECK (JSON_VALID(features) OR features IS NULL)
);

-- Rental Vehicles
INSERT INTO vehicles (id, vin, name, make, model, year, color, mileage, fuel_type, class_id, class_name, location_id, location_name, listing_type, price, daily_rate, sale_price, mileage_type, status, category, category_label, seats, bags, transmission, fuel, description, features, image_url, fallback_gradient, c1, c2, tag) VALUES
(1,  '1HGCG5655WA041389', 'Toyota Corolla',        'Toyota',    'Corolla',      2025, 'White',  12000, 'gasoline', 1, 'Economy',         1, 'Downtown Hub',      'rental', 35.00,  35.00,  NULL,     'unlimited', 'available', 'economy',  'Economy',          5, 2, 'Auto', 'Gasoline',  'Compact and fuel-efficient, the Toyota Corolla is the perfect city commuter. Reliable, comfortable, and easy on the wallet.', '["Bluetooth","Backup Camera","Apple CarPlay","Lane Assist","Adaptive Cruise","USB Ports"]', '/images/vehicles/toyota-corolla-2025.png', 'linear-gradient(135deg, rgba(180,180,180,0.4), rgba(100,100,100,0.6))', '#aaa', '#666', 'economy'),
(2,  '2T1BU4EE8DC001122', 'Toyota Camry',          'Toyota',    'Camry',        2025, 'Silver', 8500,  'gasoline', 2, 'Standard Sedan',  1, 'Downtown Hub',      'rental', 45.00,  45.00,  NULL,     'unlimited', 'available', 'sedan',    'Standard Sedan',   5, 3, 'Auto', 'Gasoline',  'The gold standard of mid-size sedans. Spacious, refined, and loaded with tech — the Camry delivers comfort on every drive.', '["Touchscreen","Safety Sense","Wireless Charging","Dual Climate","Apple CarPlay","Blind Spot Monitor"]', '/images/vehicles/toyota-camry-2025.png', 'linear-gradient(135deg, rgba(160,170,180,0.4), rgba(80,85,90,0.6))', '#999', '#555', 'sedan'),
(3,  '1FTEW1EP5MFA11111', 'Toyota Tacoma',          'Toyota',    'Tacoma',       2024, 'Black',  18000, 'gasoline', 3, 'Standard Pickup', 2, 'Airport Terminal',  'rental', 61.00,  61.00,  NULL,     'unlimited', 'available', 'truck',    'Standard Pickup',  5, 3, 'Auto', 'Gasoline',  'Built for adventure. The Tacoma handles any terrain with ease while keeping you comfortable on the highway. The perfect work-and-play truck.', '["4WD Available","Tow Package","Bed Liner","Trail Camera","Touchscreen","USB-C Ports"]', '/images/vehicles/toyota-tacoma-2024.png', 'linear-gradient(135deg, rgba(20,20,20,0.5), rgba(50,50,50,0.7))', '#333', '#111', 'truck'),
(4,  '1FTFW1ET4MFA22222', 'Ford F-150',             'Ford',      'F150',         2025, 'White',  9500,  'gasoline', 4, '1/2 Ton Pickup',  2, 'Airport Terminal',  'rental', 65.00,  65.00,  NULL,     'unlimited', 'available', 'truck',    '1/2 Ton Pickup',   5, 4, 'Auto', 'Gasoline',  'America''s best-selling truck for a reason. The F-150 delivers serious capability with the comfort and tech of a modern vehicle.', '["Pro Power Onboard","Tow Package","Sync 4","360 Camera","Adaptive Cruise","Tailgate Step"]', '/images/vehicles/ford-f150-2025.png', 'linear-gradient(135deg, rgba(200,200,200,0.4), rgba(100,100,100,0.6))', '#ccc', '#777', 'truck'),
(5,  '3GTP9DED1MG333333', 'GMC Sierra 2500',        'GMC',       'Sierra 2500',  2024, 'Black',  22000, 'diesel',   5, '3/4 Ton Pickup',  1, 'Downtown Hub',      'rental', 80.00,  80.00,  NULL,     'limited',   'available', 'truck',    '3/4 Ton Pickup',   5, 4, 'Auto', 'Diesel',    'Heavy-duty capability meets refined comfort. The Sierra 2500 handles the toughest jobs while keeping you comfortable all day long.', '["Duramax Diesel","Tow Package","Crew Cab","Heated Seats","Bose Audio","Trailering Tech"]', '/images/vehicles/gmc-sierra-2500-2024.png', 'linear-gradient(135deg, rgba(30,30,30,0.5), rgba(60,60,60,0.7))', '#222', '#444', 'truck'),
(6,  '5TDZA23C16S444444', 'Toyota 4Runner',          'Toyota',    '4Runner',      2025, 'Red',    5000,  'gasoline', 6, 'SUV',             3, 'Riverside Branch',  'rental', 70.00,  70.00,  NULL,     'unlimited', 'available', 'suv',      'SUV',              7, 4, 'Auto', 'Gasoline',  'Go anywhere, do anything. The 4Runner is a legendary off-road SUV that''s equally at home on city streets and mountain trails.', '["4WD","Crawl Control","Roof Rack","Tow Hitch","Touchscreen","Safety Sense"]', '/images/vehicles/toyota-4runner-2025.png', 'linear-gradient(135deg, rgba(180,20,20,0.5), rgba(90,10,10,0.7))', '#c00', '#600', 'suv'),
(7,  '1FAHP3F27CL555555', 'Ford Explorer',           'Ford',      'Explorer',     2024, 'Blue',   15000, 'gasoline', 6, 'SUV',             1, 'Downtown Hub',      'rental', 72.00,  72.00,  NULL,     'unlimited', 'rented',    'suv',      'SUV',              7, 4, 'Auto', 'Gasoline',  'The ultimate family SUV. Three rows of comfort, a powerful engine, and all the tech you need for any adventure big or small.', '["3rd Row Seating","Sync 4","Co-Pilot360","Panoramic Roof","Hands-Free Liftgate","B&O Sound"]', '/images/vehicles/ford-explorer-2024.png', 'linear-gradient(135deg, rgba(20,40,100,0.5), rgba(10,20,50,0.7))', '#1a3a5f', '#0d1f35', 'suv'),
(8,  'WDDZF4JB7HA666666', 'Mercedes C-Class',        'Mercedes',  'C-Class',      2025, 'Black',  3000,  'gasoline', 7, 'Luxury Sedan',    2, 'Airport Terminal',  'rental', 95.00,  95.00,  NULL,     'unlimited', 'available', 'luxury',   'Luxury Sedan',     5, 3, 'Auto', 'Gasoline',  'Luxury meets performance. The Mercedes C-Class delivers a premium driving experience with cutting-edge technology and refined elegance.', '["MBUX","Burmester Sound","Heated Seats","Digital Cockpit","Ambient Lighting","Wireless CarPlay"]', '/images/vehicles/mercedes-cclass-2025.png', 'linear-gradient(135deg, rgba(15,15,25,0.5), rgba(30,30,50,0.7))', '#1a1a2e', '#0d0d1a', 'luxury'),
(9,  '1GCGG25KX71777777', 'Chevrolet Express 3500',  'Chevrolet', 'Express 3500', 2024, 'White',  30000, 'gasoline', 8, 'Van',             3, 'Riverside Branch',  'rental', 85.00,  85.00,  NULL,     'unlimited', 'available', 'van',      'Van',              12, 6, 'Auto', 'Gasoline', 'Maximum capacity for groups and cargo. The Express 3500 seats up to 12 passengers comfortably, making it perfect for group travel and events.', '["12 Passenger","Rear A/C","Tow Package","Backup Camera","Power Windows","Cruise Control"]', '/images/vehicles/chevy-express-3500-2024.png', 'linear-gradient(135deg, rgba(200,200,200,0.4), rgba(120,120,120,0.6))', '#bbb', '#888', 'van'),
(10, '5YJSA1E22MF888888', 'Tesla Model 3',           'Tesla',     'Model 3',      2025, 'White',  2000,  'electric', 2, 'Standard Sedan',  1, 'Downtown Hub',      'rental', 55.00,  55.00,  NULL,     'unlimited', 'available', 'electric', 'Electric Sedan',   5, 3, 'Auto', 'Electric',  'The future of driving is here. Zero emissions, instant torque, and cutting-edge autopilot technology — the Tesla Model 3 redefines what a sedan can be.', '["Autopilot","15\" Touchscreen","Over-the-Air Updates","Supercharging","Glass Roof","Sentry Mode"]', '/images/vehicles/tesla-model3-2025.png', 'linear-gradient(135deg, rgba(20,20,30,0.5), rgba(40,40,60,0.7))', '#222', '#444', 'electric');

-- Vehicles for Sale
INSERT INTO vehicles (id, vin, name, make, model, year, color, mileage, fuel_type, class_id, class_name, location_id, location_name, listing_type, price, daily_rate, sale_price, mileage_type, status, category, category_label, seats, bags, transmission, fuel, description, features, image_url, fallback_gradient, c1, c2, tag) VALUES
(11, 'JN1TBNT30Z0000001', 'Honda Civic',             'Honda',     'Civic',        2022, 'Blue',   35000, 'gasoline', 1, 'Economy',         1, 'Downtown Hub',      'sale', 18500.00, NULL, 18500.00, NULL, 'available', 'economy',  'Economy',          5, 2, 'Auto', 'Gasoline',  'Reliable and efficient. This well-maintained Honda Civic is a smart buy for anyone looking for a dependable daily driver with great fuel economy.', '["Honda Sensing","Apple CarPlay","Lane Keep Assist","Adaptive Cruise","LED Headlights","Backup Camera"]', '/images/vehicles/honda-civic-2022.png', 'linear-gradient(135deg, rgba(30,50,120,0.5), rgba(15,25,60,0.7))', '#1a3a7f', '#0d1d40', 'economy'),
(12, 'WVWZZZ3CZWE000002', 'Toyota RAV4 Hybrid',      'Toyota',    'RAV4',         2023, 'Green',  22000, 'hybrid',   6, 'SUV',             2, 'Airport Terminal',  'sale', 27900.00, NULL, 27900.00, NULL, 'available', 'suv',      'SUV — Hybrid',     5, 4, 'Auto', 'Hybrid',    'Efficiency meets adventure. This RAV4 Hybrid combines impressive fuel economy with rugged SUV capability. Perfect for eco-conscious drivers.', '["Hybrid Powertrain","AWD","Safety Sense","Touchscreen","Wireless Charging","Roof Rails"]', '/images/vehicles/toyota-rav4-2023.png', 'linear-gradient(135deg, rgba(30,80,30,0.5), rgba(15,40,15,0.7))', '#1a5a1a', '#0d2d0d', 'suv'),
(13, '1G1YY22G965000003', 'Chevrolet Malibu',         'Chevrolet', 'Malibu',       2021, 'Silver', 45000, 'gasoline', 2, 'Standard Sedan',  1, 'Downtown Hub',      'sale', 15200.00, NULL, 15200.00, NULL, 'available', 'sedan',    'Standard Sedan',   5, 3, 'Auto', 'Gasoline',  'A comfortable and affordable mid-size sedan. This Malibu is in great condition and ready for a new owner. Smooth ride, great value.', '["Infotainment System","Remote Start","Teen Driver Tech","Backup Camera","Wi-Fi Hotspot","LED Lights"]', '/images/vehicles/chevy-malibu-2021.png', 'linear-gradient(135deg, rgba(140,140,150,0.4), rgba(70,70,75,0.6))', '#888', '#555', 'sedan'),
(14, '5YJ3E1EA7MF000004', 'Tesla Model Y',            'Tesla',     'Model Y',      2024, 'White',  8000,  'electric', 6, 'SUV',             3, 'Riverside Branch',  'sale', 42000.00, NULL, 42000.00, NULL, 'available', 'electric', 'Electric SUV',     5, 4, 'Auto', 'Electric',  'The world''s best-selling electric SUV. Zero emissions, incredible performance, and room for the whole family. A smart buy for the future.', '["Autopilot","15\" Touchscreen","Glass Roof","Supercharging","Over-the-Air Updates","Sentry Mode"]', '/images/vehicles/tesla-modely-2024.png', 'linear-gradient(135deg, rgba(30,30,40,0.5), rgba(50,50,70,0.7))', '#2a2a3a', '#15152a', 'electric'),
(15, '1FTFW1ET5MK000005', 'Ford F-150 (Pre-Owned)',   'Ford',      'F150',         2023, 'Black',  28000, 'gasoline', 4, '1/2 Ton Pickup',  2, 'Airport Terminal',  'sale', 35500.00, NULL, 35500.00, NULL, 'available', 'truck',    '1/2 Ton Pickup',   5, 4, 'Auto', 'Gasoline',  'A lightly-used F-150 in excellent condition. All the power and capability you need at a pre-owned price. Don''t miss this deal.', '["EcoBoost","Tow Package","Bed Liner","360 Camera","Sync 4","Heated Seats"]', '/images/vehicles/ford-f150-2023-black.png', 'linear-gradient(135deg, rgba(20,20,20,0.5), rgba(40,40,40,0.7))', '#1a1a1a', '#333', 'truck');

-- ── PRODUCT CATEGORIES ───────────────────────────────────────

CREATE TABLE product_categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

INSERT INTO product_categories (id, name, description) VALUES
(1, 'Tires',              'Complete tire sets for all vehicle types'),
(2, 'Detailing Products', 'Car wash, wax, polish, and cleaning supplies'),
(3, 'Accessories',        'Interior and exterior car accessories');

-- ── PRODUCTS ─────────────────────────────────────────────────

CREATE TABLE products (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    category_id       INT NOT NULL,
    category_name     VARCHAR(50),
    name              VARCHAR(150) NOT NULL,
    description       TEXT,
    price             DECIMAL(10,2) NOT NULL,
    stock             INT DEFAULT 0,
    sku               VARCHAR(30) UNIQUE,
    image_url         VARCHAR(500),
    is_active         BOOLEAN DEFAULT TRUE,
    is_tire           BOOLEAN DEFAULT FALSE,
    tire_size         VARCHAR(30),
    set_quantity      INT,
    season_type       VARCHAR(20),
    brand             VARCHAR(50),
    fallback_gradient VARCHAR(255),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

INSERT INTO products (id, category_id, category_name, name, description, price, stock, sku, image_url, is_active, is_tire, tire_size, set_quantity, season_type, brand, fallback_gradient) VALUES
-- Tires
(1,  1, 'Tires', 'All-Season Touring Set (205/55R16)',   '4-tire set, ideal for sedans and compact cars',     320.00, 25, 'TIRE-AS-205',   NULL, TRUE, TRUE, '205/55R16', 4, 'all-season', 'Michelin',     'linear-gradient(135deg, rgba(40,40,40,0.6), rgba(20,20,20,0.8))'),
(2,  1, 'Tires', 'All-Terrain Truck Set (265/70R17)',     '4-tire set for trucks and SUVs, rugged terrain',    520.00, 15, 'TIRE-AT-265',   NULL, TRUE, TRUE, '265/70R17', 4, 'all-season', 'BFGoodrich',   'linear-gradient(135deg, rgba(60,50,30,0.6), rgba(30,25,15,0.8))'),
(3,  1, 'Tires', 'Winter Performance Set (225/45R18)',    '4-tire set, enhanced grip in snow and ice',         480.00, 10, 'TIRE-WP-225',   NULL, TRUE, TRUE, '225/45R18', 4, 'winter',     'Bridgestone',  'linear-gradient(135deg, rgba(40,60,100,0.6), rgba(20,30,50,0.8))'),
(4,  1, 'Tires', 'Highway Comfort Set (245/60R18)',       '4-tire set for SUVs, smooth highway ride',          440.00, 20, 'TIRE-HC-245',   NULL, TRUE, TRUE, '245/60R18', 4, 'all-season', 'Goodyear',     'linear-gradient(135deg, rgba(50,50,50,0.6), rgba(25,25,25,0.8))'),
(5,  1, 'Tires', 'Heavy Duty Truck Set (275/65R20)',      '4-tire set for 3/4 ton and up trucks',              620.00, 12, 'TIRE-HD-275',   NULL, TRUE, TRUE, '275/65R20', 4, 'all-season', 'Toyo',         'linear-gradient(135deg, rgba(70,50,20,0.6), rgba(35,25,10,0.8))'),
-- Detailing Products
(6,  2, 'Detailing Products', 'Premium Car Wash Kit',       'Shampoo, mitt, drying towel, and bucket',                   34.99, 50, 'DET-WASH-01',  NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(30,100,200,0.4), rgba(15,50,100,0.6))'),
(7,  2, 'Detailing Products', 'Ceramic Coating Spray',      'Long-lasting hydrophobic ceramic protection',                24.99, 40, 'DET-CERAM-01', NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(100,20,120,0.4), rgba(50,10,60,0.6))'),
(8,  2, 'Detailing Products', 'Interior Detail Kit',        'Dashboard cleaner, leather conditioner, protectant',         42.99, 35, 'DET-INT-01',   NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(120,80,40,0.4), rgba(60,40,20,0.6))'),
(9,  2, 'Detailing Products', 'Tire Shine & Wheel Cleaner Set', 'Professional-grade tire and rim cleaning kit',           19.99, 60, 'DET-TIRE-01',  NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(40,40,40,0.5), rgba(20,20,20,0.7))'),
(10, 2, 'Detailing Products', 'Scratch Repair Pen Kit',     '3-pen kit for minor paint scratch touch-ups',                14.99, 45, 'DET-SCRP-01',  NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(200,50,50,0.3), rgba(100,25,25,0.5))'),
-- Accessories
(11, 3, 'Accessories', 'Universal Phone Mount',       'Dashboard/vent mount with wireless charging',          29.99, 70, 'ACC-PHONE-01', NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(30,30,60,0.4), rgba(15,15,30,0.6))'),
(12, 3, 'Accessories', 'Trunk Organizer',             'Collapsible cargo organizer with multiple pockets',    22.99, 55, 'ACC-TRUNK-01', NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(60,40,20,0.4), rgba(30,20,10,0.6))'),
(13, 3, 'Accessories', 'LED Interior Light Kit',      'Multi-color ambient interior LED strip kit',            18.99, 40, 'ACC-LED-01',   NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(100,0,200,0.4), rgba(50,0,100,0.6))'),
(14, 3, 'Accessories', 'Seat Cover Set (Universal)',   'Waterproof neoprene seat covers, front pair',          64.99, 30, 'ACC-SEAT-01',  NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(40,40,60,0.4), rgba(20,20,30,0.6))'),
(15, 3, 'Accessories', 'All-Weather Floor Mat Set',    '4-piece heavy-duty rubber floor mat set',              49.99, 35, 'ACC-MAT-01',   NULL, TRUE, FALSE, NULL, NULL, NULL, NULL, 'linear-gradient(135deg, rgba(50,50,50,0.5), rgba(25,25,25,0.7))');

-- ── SERVICES ─────────────────────────────────────────────────

CREATE TABLE services (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    price_type      VARCHAR(20),
    is_rental_addon BOOLEAN DEFAULT FALSE,
    is_standalone   BOOLEAN DEFAULT TRUE
);

INSERT INTO services (id, name, description, price, price_type, is_rental_addon, is_standalone) VALUES
(1, 'Roadside Assistance - Monthly',     '24/7 towing, tire change, jump start, lockout service',       14.99, 'per_month', TRUE,  TRUE),
(2, 'Roadside Assistance - Per Rental',  'Roadside coverage for the duration of your rental',            5.99, 'per_day',   TRUE,  FALSE),
(3, 'Basic Car Insurance',               'Liability coverage for rental vehicles',                      12.99, 'per_day',   TRUE,  TRUE),
(4, 'Premium Car Insurance',             'Full coverage: collision, liability, and comprehensive',       24.99, 'per_day',   TRUE,  TRUE),
(5, 'Personal Car Insurance - Monthly',  'Monthly personal vehicle insurance policy',                   89.99, 'per_month', FALSE, TRUE),
(6, 'Rent a Car',                        'Standard vehicle rental service',                              0.00, 'per_day',   FALSE, TRUE);

-- ── APPLICATION USER (for remote access from Windows server) ─

-- Create a user that the Node.js API will use to connect remotely to MariaDB
-- Replace 'your_password_here' with a strong password
-- Replace '%' with the Windows server IP for tighter security (e.g., '192.168.1.100')
CREATE USER IF NOT EXISTS 'ccw_app'@'%' IDENTIFIED BY 'your_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON certifiedcitywhips.* TO 'ccw_app'@'%';
FLUSH PRIVILEGES;
