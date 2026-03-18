-- =============================================
-- RUN THIS IN MYSQL WORKBENCH
-- Adds real DB support for Birthday, Activity, Zoo Map
-- =============================================
USE digital_zoo;

-- 1. Add birth_date column to animals
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER age_unit;

-- 2. Add zone_assignment column to animals  
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS zone_assignment ENUM('safari','aquatic','aviary','reptile','nocturnal','unassigned') DEFAULT 'unassigned' AFTER cage_id;

-- 3. Update sample animals with real birth dates
UPDATE animals SET birth_date = DATE_SUB(CURDATE(), INTERVAL age YEAR) WHERE age IS NOT NULL AND birth_date IS NULL;

-- Special birthdays for demo (set some near today)
UPDATE animals SET birth_date = CURDATE() WHERE id = 1;
UPDATE animals SET birth_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY) WHERE id = 2;
UPDATE animals SET birth_date = DATE_ADD(CURDATE(), INTERVAL 5 DAY) WHERE id = 3;
UPDATE animals SET birth_date = DATE_ADD(CURDATE(), INTERVAL 14 DAY) WHERE id = 4;

-- 4. Update zone assignments based on category
UPDATE animals SET zone_assignment = 'safari'    WHERE category = 'mammal'      AND zone_assignment = 'unassigned';
UPDATE animals SET zone_assignment = 'aquatic'   WHERE category = 'fish'        AND zone_assignment = 'unassigned';
UPDATE animals SET zone_assignment = 'aviary'    WHERE category = 'bird'        AND zone_assignment = 'unassigned';
UPDATE animals SET zone_assignment = 'reptile'   WHERE category = 'reptile'     AND zone_assignment = 'unassigned';
UPDATE animals SET zone_assignment = 'nocturnal' WHERE category = 'amphibian'   AND zone_assignment = 'unassigned';

-- 5. Verify
SELECT id, name, birth_date, zone_assignment FROM animals;