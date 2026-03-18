const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET all animals with filters
router.get('/', auth, async (req, res) => {
  try {
    const { category, health_status, search, page = 1, limit = 20, cage_id } = req.query;
    let query = `SELECT a.*, c.name AS cage_name, c.zone, s.name AS keeper_name 
                 FROM animals a 
                 LEFT JOIN cages c ON a.cage_id = c.id 
                 LEFT JOIN staff s ON a.assigned_keeper = s.id WHERE 1=1`;
    const params = [];

    if (category) { query += ' AND a.category = ?'; params.push(category); }
    if (health_status) { query += ' AND a.health_status = ?'; params.push(health_status); }
    if (cage_id) { query += ' AND a.cage_id = ?'; params.push(cage_id); }
    if (search) { query += ' AND (a.name LIKE ? OR a.species LIKE ? OR a.scientific_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM animals a WHERE 1=1${category ? ' AND a.category=?' : ''}`, category ? [category] : []);
    
    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [animals] = await db.query(query, params);
    res.json({ success: true, data: animals, total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single animal
router.get('/:id', auth, async (req, res) => {
  try {
    const [animals] = await db.query(
      `SELECT a.*, c.name AS cage_name, c.zone, c.location AS cage_location, s.name AS keeper_name, s.email AS keeper_email
       FROM animals a LEFT JOIN cages c ON a.cage_id = c.id LEFT JOIN staff s ON a.assigned_keeper = s.id
       WHERE a.id = ?`, [req.params.id]
    );
    if (animals.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });

    const [meds] = await db.query('SELECT m.*, s.name AS vet_name FROM medications m LEFT JOIN staff s ON m.vet_id = s.id WHERE m.animal_id = ? ORDER BY m.created_at DESC LIMIT 5', [req.params.id]);
    const [visits] = await db.query('SELECT v.*, s.name AS keeper_name FROM visits v LEFT JOIN staff s ON v.keeper_id = s.id WHERE v.animal_id = ? ORDER BY v.visit_date DESC LIMIT 5', [req.params.id]);
    const [adoptions] = await db.query('SELECT * FROM adoptions WHERE animal_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({ success: true, data: { ...animals[0], recent_medications: meds, recent_visits: visits, adoptions } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create animal
router.post('/', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, species, scientific_name, category, age, age_unit, gender, weight, weight_unit, height,
            health_status, diet_type, diet_notes, origin_country, acquisition_date, acquisition_type,
            description, fun_facts, is_endangered, conservation_status, cage_id, assigned_keeper } = req.body;

    if (!name || !species || !category) {
      return res.status(400).json({ success: false, message: 'Name, species, and category are required' });
    }

    const image_url = req.files?.image ? `/uploads/images/${req.files.image[0].filename}` : null;
    const video_url = req.files?.video ? `/uploads/videos/${req.files.video[0].filename}` : null;

    const [result] = await db.query(
      `INSERT INTO animals (name, species, scientific_name, category, age, age_unit, gender, weight, weight_unit,
       height, health_status, diet_type, diet_notes, origin_country, acquisition_date, acquisition_type,
       description, fun_facts, image_url, video_url, is_endangered, conservation_status, cage_id, assigned_keeper)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, species, scientific_name, category, age, age_unit || 'years', gender, weight, weight_unit || 'kg',
       height, health_status || 'healthy', diet_type, diet_notes, origin_country, acquisition_date, acquisition_type,
       description, fun_facts, image_url, video_url, is_endangered === 'true' || is_endangered === true ? 1 : 0,
       conservation_status || 'LC', cage_id || null, assigned_keeper || null]
    );

    if (cage_id) {
      await db.query('UPDATE cages SET current_occupancy = current_occupancy + 1 WHERE id = ?', [cage_id]);
    }

    res.status(201).json({ success: true, message: 'Animal added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// PUT update animal
router.put('/:id', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, species, scientific_name, category, age, age_unit, gender, weight, weight_unit, height,
            health_status, diet_type, diet_notes, origin_country, description, fun_facts,
            is_endangered, conservation_status, cage_id, assigned_keeper, birth_date } = req.body;

    const [existing] = await db.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });

    const image_url = req.files?.image ? `/uploads/images/${req.files.image[0].filename}` : existing[0].image_url;
    const video_url = req.files?.video ? `/uploads/videos/${req.files.video[0].filename}` : existing[0].video_url;

    // Update cage occupancy if changed
    if (cage_id && cage_id != existing[0].cage_id) {
      if (existing[0].cage_id) await db.query('UPDATE cages SET current_occupancy = GREATEST(0, current_occupancy - 1) WHERE id = ?', [existing[0].cage_id]);
      await db.query('UPDATE cages SET current_occupancy = current_occupancy + 1 WHERE id = ?', [cage_id]);
    }

    await db.query(
      `UPDATE animals SET name=?, species=?, scientific_name=?, category=?, age=?, age_unit=?, gender=?, weight=?,
       weight_unit=?, height=?, health_status=?, diet_type=?, diet_notes=?, origin_country=?, description=?,
       fun_facts=?, image_url=?, video_url=?, is_endangered=?, conservation_status=?, cage_id=?, assigned_keeper=?,
       birth_date=?
       WHERE id=?`,
      [name || existing[0].name, species || existing[0].species, scientific_name, category || existing[0].category,
       age, age_unit, gender, weight, weight_unit, height, health_status, diet_type, diet_notes, origin_country,
       description, fun_facts, image_url, video_url, is_endangered === 'true' ? 1 : 0, conservation_status,
       cage_id || null, assigned_keeper || null, birth_date || existing[0].birth_date || null, req.params.id]
    );

    res.json({ success: true, message: 'Animal updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH - Update only birth_date (used by birthday tracker)
router.patch('/:id/birthday', auth, async (req, res) => {
  try {
    const { birth_date } = req.body;
    if (!birth_date) {
      return res.status(400).json({ success: false, message: 'birth_date is required' });
    }
    const [existing] = await db.query('SELECT id FROM animals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }
    await db.query('UPDATE animals SET birth_date = ? WHERE id = ?', [birth_date, req.params.id]);
    res.json({ success: true, message: 'Birthday updated successfully' });
  } catch (err) {
    console.error('Birthday update error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// DELETE animal
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT cage_id FROM animals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Animal not found' });
    if (existing[0].cage_id) {
      await db.query('UPDATE cages SET current_occupancy = GREATEST(0, current_occupancy - 1) WHERE id = ?', [existing[0].cage_id]);
    }
    await db.query('DELETE FROM animals WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Animal removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST upload zone video
router.post('/upload-zone-video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }
    const url = '/uploads/videos/' + req.file.filename;
    res.json({ success: true, url: url, path: url, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// GET cages list
router.get('/data/cages', auth, async (req, res) => {
  try {
    const [cages] = await db.query('SELECT * FROM cages ORDER BY cage_number');
    res.json({ success: true, data: cages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;