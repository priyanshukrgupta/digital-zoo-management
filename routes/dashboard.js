const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// GET dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [[animalCount]] = await db.query('SELECT COUNT(*) as total FROM animals');
    const [[healthStats]] = await db.query(`SELECT 
      SUM(health_status='healthy') as healthy, SUM(health_status='sick') as sick, 
      SUM(health_status='recovering') as recovering, SUM(health_status='critical') as critical FROM animals`);
    const [[adoptionStats]] = await db.query(`SELECT COUNT(*) as total, SUM(status='active') as active, SUM(adoption_fee) as revenue FROM adoptions`);
    const [[staffCount]] = await db.query('SELECT COUNT(*) as total FROM staff WHERE is_active=1');
    const [[cageStats]] = await db.query('SELECT COUNT(*) as total, SUM(current_occupancy) as occupied FROM cages');
    const [[medCount]] = await db.query(`SELECT SUM(status='ongoing') as ongoing FROM medications`);
    const [recentAnimals] = await db.query('SELECT id, name, species, category, health_status, image_url, created_at FROM animals ORDER BY created_at DESC LIMIT 6');
    const [categoryStats] = await db.query('SELECT category, COUNT(*) as count FROM animals GROUP BY category');
    const [recentActivity] = await db.query(`
      (SELECT 'visit' as type, v.visit_date as date, CONCAT('Visit: ', a.name, ' (', v.visit_type, ')') as description 
       FROM visits v JOIN animals a ON v.animal_id=a.id ORDER BY v.visit_date DESC LIMIT 5)
      UNION
      (SELECT 'medication' as type, m.created_at as date, CONCAT('Med: ', a.name, ' - ', m.medication_name) as description 
       FROM medications m JOIN animals a ON m.animal_id=a.id ORDER BY m.created_at DESC LIMIT 5)
      ORDER BY date DESC LIMIT 10`);

    res.json({
      success: true, data: {
        animals: { total: animalCount.total, ...healthStats },
        adoptions: adoptionStats,
        staff: staffCount,
        cages: cageStats,
        medications: medCount,
        recentAnimals, categoryStats, recentActivity
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET staff list
router.get('/staff', auth, async (req, res) => {
  try {
    const [staff] = await db.query('SELECT id, name, email, role, phone, is_active, created_at FROM staff ORDER BY name');
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET cages
router.get('/cages', auth, async (req, res) => {
  try {
    const [cages] = await db.query(`SELECT c.*, COUNT(a.id) as animal_count FROM cages c LEFT JOIN animals a ON c.id=a.cage_id GROUP BY c.id ORDER BY c.cage_number`);
    res.json({ success: true, data: cages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create cage
router.post('/cages', auth, async (req, res) => {
  try {
    const { cage_number, name, location, zone, capacity, size_sqm, habitat_type } = req.body;
    const [result] = await db.query(
      'INSERT INTO cages (cage_number, name, location, zone, capacity, size_sqm, habitat_type) VALUES (?,?,?,?,?,?,?)',
      [cage_number, name, location, zone, capacity, size_sqm, habitat_type]
    );
    res.status(201).json({ success: true, message: 'Cage created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// GET reports
router.get('/reports', auth, async (req, res) => {
  try {
    const [monthlyAdoptions] = await db.query(`SELECT MONTH(adoption_date) as month, YEAR(adoption_date) as year, COUNT(*) as count, SUM(adoption_fee) as revenue FROM adoptions WHERE adoption_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY YEAR(adoption_date), MONTH(adoption_date) ORDER BY year, month`);
    const [healthByCategory] = await db.query(`SELECT category, health_status, COUNT(*) as count FROM animals GROUP BY category, health_status ORDER BY category`);
    const [topAdopted] = await db.query(`SELECT a.name, a.species, a.image_url, COUNT(ad.id) as adoption_count FROM animals a LEFT JOIN adoptions ad ON a.id=ad.animal_id GROUP BY a.id ORDER BY adoption_count DESC LIMIT 5`);
    const [endangeredList] = await db.query(`SELECT name, species, conservation_status, health_status FROM animals WHERE is_endangered=1 ORDER BY conservation_status`);
    res.json({ success: true, data: { monthlyAdoptions, healthByCategory, topAdopted, endangeredList } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

// GET birthdays - animals with real birth_date
router.get('/birthdays', auth, async (req, res) => {
  try {
    const [animals] = await db.query(`
      SELECT id, name, species, category, age, age_unit, birth_date, health_status, image_url,
        MONTH(birth_date) as birth_month,
        DAY(birth_date)   as birth_day,
        DATEDIFF(
          IF(
            CONCAT(YEAR(CURDATE()),'-',LPAD(MONTH(birth_date),2,'0'),'-',LPAD(DAY(birth_date),2,'0')) >= CURDATE(),
            CONCAT(YEAR(CURDATE()),'-',LPAD(MONTH(birth_date),2,'0'),'-',LPAD(DAY(birth_date),2,'0')),
            CONCAT(YEAR(CURDATE())+1,'-',LPAD(MONTH(birth_date),2,'0'),'-',LPAD(DAY(birth_date),2,'0'))
          ), CURDATE()
        ) as days_until_birthday,
        TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as current_age
      FROM animals
      WHERE birth_date IS NOT NULL
      ORDER BY days_until_birthday ASC
    `);
    res.json({ success: true, data: animals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update animal zone assignment
router.put('/zone/:id', auth, async (req, res) => {
  try {
    const { zone } = req.body;
    const validZones = ['safari','aquatic','aviary','reptile','nocturnal','unassigned'];
    if (!validZones.includes(zone)) {
      return res.status(400).json({ success: false, message: 'Invalid zone' });
    }
    await db.query('UPDATE animals SET zone_assignment = ? WHERE id = ?', [zone, req.params.id]);
    res.json({ success: true, message: 'Zone updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all animal zone assignments
router.get('/zones', auth, async (req, res) => {
  try {
    const [animals] = await db.query(
      'SELECT id, name, species, category, health_status, image_url, zone_assignment FROM animals ORDER BY name'
    );
    res.json({ success: true, data: animals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET real activity feed from visits table
router.get('/activity-feed', auth, async (req, res) => {
  try {
    const [visits] = await db.query(`
      SELECT 
        v.id, v.visit_type, v.visit_date, v.observations, v.duration_minutes, v.feeding_amount,
        a.name AS animal_name, a.species, a.category, a.health_status,
        s.name AS keeper_name
      FROM visits v
      JOIN animals a ON v.animal_id = a.id
      LEFT JOIN staff s ON v.keeper_id = s.id
      ORDER BY v.visit_date DESC
      LIMIT 30
    `);

    const [meds] = await db.query(`
      SELECT 
        m.id, m.medication_name, m.created_at as visit_date, m.status,
        a.name AS animal_name, a.species, a.category,
        s.name AS vet_name
      FROM medications m
      JOIN animals a ON m.animal_id = a.id
      LEFT JOIN staff s ON m.vet_id = s.id
      ORDER BY m.created_at DESC
      LIMIT 15
    `);

    // Merge and sort
    const feed = [
      ...visits.map(v => ({ ...v, feed_type: 'visit' })),
      ...meds.map(m => ({ ...m, feed_type: 'medication' }))
    ].sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date)).slice(0, 30);

    res.json({ success: true, data: feed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});