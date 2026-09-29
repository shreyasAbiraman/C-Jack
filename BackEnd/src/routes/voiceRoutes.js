const express = require('express');
const router = express.Router();
const voiceGuidanceService = require('../services/voiceGuidanceService');

// GET /api/voice/languages - Supported language options
router.get('/languages', (req, res) => {
  res.status(200).json(voiceGuidanceService.getLanguages());
});

// GET /api/voice/catalog - Full guidance state catalog with translations
router.get('/catalog', (req, res) => {
  const lang = req.query.lang;
  res.status(200).json(voiceGuidanceService.getGuidanceCatalog(lang));
});

// GET /api/voice/status - Current active guidance state & hardware status
router.get('/status', (req, res) => {
  res.status(200).json(voiceGuidanceService.getStatus());
});

// POST /api/voice/broadcast - Trigger guidance prompt broadcast
router.post('/broadcast', (req, res) => {
  try {
    const { state, language } = req.body;
    if (!state) {
      return res.status(400).json({ success: false, message: 'Guidance state is required' });
    }
    const result = voiceGuidanceService.broadcast(state, language);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/voice/language - Set active system voice language
router.post('/language', (req, res) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ success: false, message: 'Language code is required' });
    }
    const result = voiceGuidanceService.setLanguage(language);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
