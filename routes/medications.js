const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, vetOrAdmin } = require('../middleware/auth');

// GET all medications
router.get('/', auth, async (req, res) => {
  try {
    const { animal_id, status, page = 1, limit = 20 } = req.query;
    let query = `SELECT m.*, a.name AS animal_name, a.species, s.name AS vet_name FROM medications m 
                 JOIN animals a ON m.animal_id = a.id LEFT JOIN staff s ON m.vet_id = s.id WHERE 1=1`;
    const params = [];
    if (animal_id) { query += ' AND m.animal_id = ?'; params.push(animal_id); }
    if (status) { query += ' AND m.status = ?'; params.push(status); }
    query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const [meds] = await db.query(query, params);
    res.json({ success: true, data: meds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create medication record
router.post('/', auth, vetOrAdmin, async (req, res) => {
  try {
    const { animal_id, medication_name, dosage, frequency, start_date, end_date, reason, diagnosis, prescription_notes, side_effects } = req.body;
    if (!animal_id || !medication_name || !start_date) {
      return res.status(400).json({ success: false, message: 'Animal, medication name and start date required' });
    }
    const [result] = await db.query(
      `INSERT INTO medications (animal_id, vet_id, medication_name, dosage, frequency, start_date, end_date, reason, diagnosis, prescription_notes, side_effects, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'ongoing')`,
      [animal_id, req.user.id, medication_name, dosage, frequency, start_date, end_date, reason, diagnosis, prescription_notes, side_effects]
    );
    // Update animal health if in treatment
    await db.query('UPDATE animals SET health_status = "sick" WHERE id = ? AND health_status = "healthy"', [animal_id]);
    res.status(201).json({ success: true, message: 'Medication record created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update medication
router.put('/:id', auth, vetOrAdmin, async (req, res) => {
  try {
    const { status, end_date, prescription_notes } = req.body;
    await db.query('UPDATE medications SET status = ?, end_date = ?, prescription_notes = ? WHERE id = ?', [status, end_date, prescription_notes, req.params.id]);
    res.json({ success: true, message: 'Medication updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Log a visit
router.post('/visits', auth, async (req, res) => {
  try {
    const { animal_id, visit_type, duration_minutes, observations, behavior_notes, feeding_amount, next_visit } = req.body;
    const [result] = await db.query(
      `INSERT INTO visits (animal_id, keeper_id, visit_type, duration_minutes, observations, behavior_notes, feeding_amount, next_visit)
       VALUES (?,?,?,?,?,?,?,?)`,
      [animal_id, req.user.id, visit_type, duration_minutes, observations, behavior_notes, feeding_amount, next_visit]
    );
    res.status(201).json({ success: true, message: 'Visit logged', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET visits
router.get('/visits/all', auth, async (req, res) => {
  try {
    const { animal_id, limit = 20 } = req.query;
    let query = `SELECT v.*, a.name AS animal_name, s.name AS keeper_name FROM visits v 
                 JOIN animals a ON v.animal_id = a.id LEFT JOIN staff s ON v.keeper_id = s.id WHERE 1=1`;
    const params = [];
    if (animal_id) { query += ' AND v.animal_id = ?'; params.push(animal_id); }
    query += ' ORDER BY v.visit_date DESC LIMIT ?';
    params.push(parseInt(limit));
    const [visits] = await db.query(query, params);
    res.json({ success: true, data: visits });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;