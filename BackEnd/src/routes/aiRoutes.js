// src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

const { invokeLLM } = require('../services/llmService');
const contextService = require('../services/contextService'); // helper to gather live C-Jack data

/**
 * POST /api/ai/chat
 * Body: { message: string, language?: string }
 * Returns: JSON in the schema defined by llmPrompt.js
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    // Gather live context – currently a stub returning empty object.
    const context = await contextService.getLiveContext();
    const llmResponse = await invokeLLM(message, context, language);
    return res.status(200).json({ success: true, data: llmResponse });
  } catch (err) {
    console.error('[AI Route] error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
