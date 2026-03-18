const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// GET all adoptions
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    let query = `SELECT ad.*, an.name AS animal_name, an.species, an.image_url FROM adoptions ad JOIN animals an ON ad.animal_id = an.id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND ad.status = ?'; params.push(status); }
    if (search) { query += ' AND (ad.adopter_name LIKE ? OR an.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ` ORDER BY ad.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const [adoptions] = await db.query(query, params);
    const [total] = await db.query('SELECT COUNT(*) as count FROM adoptions');
    res.json({ success: true, data: adoptions, total: total[0].count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create adoption
router.post('/', auth, async (req, res) => {
  try {
    const { animal_id, adopter_name, adopter_email, adopter_phone, adopter_address, adoption_date, adoption_fee, duration_months, notes } = req.body;
    if (!animal_id || !adopter_name || !adopter_email || !adoption_date) {
      return res.status(400).json({ success: false, message: 'Animal, adopter name, email and date required' });
    }
    const certNumber = 'ADOPT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
    const [result] = await db.query(
      `INSERT INTO adoptions (animal_id, adopter_name, adopter_email, adopter_phone, adopter_address, adoption_date, adoption_fee, duration_months, notes, certificate_number, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,'active')`,
      [animal_id, adopter_name, adopter_email, adopter_phone, adopter_address, adoption_date, adoption_fee || 0, duration_months || 12, notes, certNumber]
    );
    res.status(201).json({ success: true, message: 'Adoption registered!', id: result.insertId, certificate: certNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update adoption status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    await db.query('UPDATE adoptions SET status = ?, notes = ? WHERE id = ?', [status, notes, req.params.id]);
    res.json({ success: true, message: 'Adoption updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE adoption
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM adoptions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Adoption record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;