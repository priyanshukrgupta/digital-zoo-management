-- =============================================
-- DIGITAL ZOO DATABASE INITIALIZATION SCRIPT
-- Run this in MySQL Workbench first!
-- =============================================

CREATE DATABASE IF NOT EXISTS digital_zoo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_zoo;

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'zookeeper', 'vet', 'staff') DEFAULT 'staff',
  phone VARCHAR(20),
  avatar VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Animals Table
CREATE TABLE IF NOT EXISTS animals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(150),
  category ENUM('mammal','bird','reptile','fish','amphibian','invertebrate') NOT NULL,
  age INT,
  age_unit ENUM('days','months','years') DEFAULT 'years',
  gender ENUM('male','female','unknown') DEFAULT 'unknown',
  weight DECIMAL(8,2),
  weight_unit ENUM('kg','lbs') DEFAULT 'kg',
  height DECIMAL(6,2),
  health_status ENUM('healthy','sick','recovering','critical','deceased') DEFAULT 'healthy',
  diet_type ENUM('carnivore','herbivore','omnivore') DEFAULT 'omnivore',
  diet_notes TEXT,
  origin_country VARCHAR(100),
  acquisition_date DATE,
  acquisition_type ENUM('born','donated','rescued','purchased','transferred') DEFAULT 'born',
  description TEXT,
  fun_facts TEXT,
  image_url VARCHAR(255),
  video_url VARCHAR(255),
  sound_url VARCHAR(255),
  is_endangered BOOLEAN DEFAULT FALSE,
  conservation_status ENUM('LC','NT','VU','EN','CR','EW','EX') DEFAULT 'LC',
  cage_id INT,
  assigned_keeper INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cages / Enclosures Table
CREATE TABLE IF NOT EXISTS cages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cage_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  zone ENUM('safari','aquatic','aviary','reptile','nocturnal','petting') DEFAULT 'safari',
  capacity INT DEFAULT 1,
  current_occupancy INT DEFAULT 0,
  size_sqm DECIMAL(8,2),
  temperature_min DECIMAL(5,2),
  temperature_max DECIMAL(5,2),
  humidity_level INT,
  habitat_type VARCHAR(100),
  last_cleaned TIMESTAMP,
  next_cleaning TIMESTAMP,
  maintenance_status ENUM('good','needs_repair','under_maintenance') DEFAULT 'good',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adoptions Table
CREATE TABLE IF NOT EXISTS adoptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  adopter_name VARCHAR(100) NOT NULL,
  adopter_email VARCHAR(100) NOT NULL,
  adopter_phone VARCHAR(20),
  adopter_address TEXT,
  adoption_date DATE NOT NULL,
  adoption_fee DECIMAL(10,2) DEFAULT 0,
  duration_months INT DEFAULT 12,
  status ENUM('pending','active','completed','cancelled') DEFAULT 'pending',
  certificate_number VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  vet_id INT,
  medication_name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  frequency VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  diagnosis TEXT,
  prescription_notes TEXT,
  side_effects TEXT,
  status ENUM('scheduled','ongoing','completed','cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Visits Table
CREATE TABLE IF NOT EXISTS visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  keeper_id INT,
  visit_type ENUM('feeding','health_check','training','grooming','observation','emergency') DEFAULT 'observation',
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INT,
  observations TEXT,
  behavior_notes TEXT,
  feeding_amount VARCHAR(50),
  next_visit TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
  FOREIGN KEY (keeper_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Add Foreign Keys to animals
ALTER TABLE animals 
  ADD CONSTRAINT fk_animal_cage FOREIGN KEY (cage_id) REFERENCES cages(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_animal_keeper FOREIGN KEY (assigned_keeper) REFERENCES staff(id) ON DELETE SET NULL;

-- =============================================
-- SEED DATA
-- =============================================

-- Default Admin User (password: Admin@123)
INSERT INTO staff (name, email, password, role, phone) VALUES
('Zoo Administrator', 'admin@digitalzoo.com', '$2a$10$rBnNORBE6r8GFSmKxv1j5uEjjn8Vv2nqfZ8fJqj9FGTTVpVZnECuS', 'admin', '+91-9876543210'),
('Dr. Sarah Vet', 'vet@digitalzoo.com', '$2a$10$rBnNORBE6r8GFSmKxv1j5uEjjn8Vv2nqfZ8fJqj9FGTTVpVZnECuS', 'vet', '+91-9876543211'),
('John Keeper', 'keeper@digitalzoo.com', '$2a$10$rBnNORBE6r8GFSmKxv1j5uEjjn8Vv2nqfZ8fJqj9FGTTVpVZnECuS', 'zookeeper', '+91-9876543212');

-- Sample Cages
INSERT INTO cages (cage_number, name, location, zone, capacity, size_sqm, habitat_type) VALUES
('Z-001', 'Lion Pride Enclosure', 'East Wing', 'safari', 5, 500.00, 'Savanna'),
('Z-002', 'Elephant Sanctuary', 'North Zone', 'safari', 3, 2000.00, 'Grassland'),
('Z-003', 'Tiger Territory', 'East Wing', 'safari', 2, 800.00, 'Jungle'),
('A-001', 'Shark Tank', 'Aquatic Center', 'aquatic', 10, 1000.00, 'Ocean'),
('A-002', 'Penguin Paradise', 'Aquatic Center', 'aquatic', 20, 300.00, 'Arctic'),
('B-001', 'Tropical Bird Aviary', 'West Wing', 'aviary', 50, 600.00, 'Rainforest'),
('R-001', 'Reptile House', 'South Zone', 'reptile', 15, 200.00, 'Desert');

-- Sample Animals
INSERT INTO animals (name, species, scientific_name, category, age, gender, weight, health_status, diet_type, origin_country, cage_id, is_endangered, conservation_status, description, fun_facts) VALUES
('Simba', 'African Lion', 'Panthera leo', 'mammal', 5, 'male', 190.00, 'healthy', 'carnivore', 'Kenya', 1, FALSE, 'VU', 'Majestic male lion, leader of the pride', 'Can roar loud enough to be heard 8km away!'),
('Nala', 'African Lion', 'Panthera leo', 'mammal', 4, 'female', 130.00, 'healthy', 'carnivore', 'Tanzania', 1, FALSE, 'VU', 'Graceful lioness, excellent hunter', 'Female lions do 90% of the hunting'),
('Raja', 'Bengal Tiger', 'Panthera tigris tigris', 'mammal', 6, 'male', 220.00, 'healthy', 'carnivore', 'India', 3, TRUE, 'EN', 'Powerful Bengal tiger from India', 'No two tigers have the same stripe pattern'),
('Jumbo', 'African Elephant', 'Loxodonta africana', 'mammal', 15, 'male', 6000.00, 'healthy', 'herbivore', 'South Africa', 2, TRUE, 'VU', 'Gentle giant, loves water play', 'Elephants can recognize themselves in mirrors'),
('Polly', 'Scarlet Macaw', 'Ara macao', 'bird', 8, 'female', 1.00, 'healthy', 'herbivore', 'Brazil', 6, FALSE, 'LC', 'Vibrant macaw with amazing vocal abilities', 'Can live up to 75 years in captivity'),
('Spike', 'Komodo Dragon', 'Varanus komodoensis', 'reptile', 10, 'male', 70.00, 'healthy', 'carnivore', 'Indonesia', 7, TRUE, 'EN', 'Worlds largest lizard species', 'Can smell prey from up to 9.5km away');

-- Sample Adoptions
INSERT INTO adoptions (animal_id, adopter_name, adopter_email, adopter_phone, adoption_date, adoption_fee, status, certificate_number) VALUES
(1, 'Arjun Sharma', 'arjun@email.com', '+91-9876500001', '2024-01-15', 5000.00, 'active', 'ADOPT-2024-001'),
(4, 'Priya Patel', 'priya@email.com', '+91-9876500002', '2024-02-20', 8000.00, 'active', 'ADOPT-2024-002');

-- Sample Medications
INSERT INTO medications (animal_id, vet_id, medication_name, dosage, frequency, start_date, reason, status) VALUES
(3, 2, 'Vitamin D3 Supplement', '500mg', 'Daily', '2024-01-01', 'Routine supplement', 'ongoing'),
(4, 2, 'Anti-parasite treatment', '200ml', 'Monthly', '2024-03-01', 'Preventive care', 'completed');