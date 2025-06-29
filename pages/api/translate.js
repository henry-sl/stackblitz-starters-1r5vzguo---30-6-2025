// pages/api/translate.js
// API endpoint for Malay-English translation using Google Translate API
// Handles bidirectional translation between English and Bahasa Malaysia

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, targetLang, sourceLang } = req.body;
  
  // Validate required fields
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' });
  }

  // For now, return a mock translation since we don't have a working translation service
  // In production, you would integrate with Google Translate API, Azure Translator, or similar
  try {
    console.log(`[Translation API] Mock translating to ${targetLang}:`, text.substring(0, 100) + '...');
    
    // Determine source language if not provided
    const sourceLanguage = sourceLang || (targetLang === 'ms' ? 'en' : 'ms');
    
    console.log(`[Translation API] Source: ${sourceLanguage}, Target: ${targetLang}`);

    // Mock translation - in production, replace with actual translation service
    let mockTranslation;
    if (targetLang === 'ms') {
      // English to Malay mock translation
      mockTranslation = `[Terjemahan Bahasa Malaysia] ${text}`;
    } else {
      // Malay to English mock translation
      mockTranslation = `[English Translation] ${text}`;
    }

    console.log(`[Translation API] Mock translation successful, length: ${mockTranslation.length}`);

    return res.status(200).json({
      translatedText: mockTranslation,
      sourceLanguage,
      targetLanguage: targetLang,
      originalLength: text.length,
      translatedLength: mockTranslation.length,
      note: "This is a mock translation. Please integrate with a real translation service for production use."
    });

  } catch (error) {
    console.error('[Translation API] Translation error:', error);
    
    // Generic error response
    return res.status(500).json({ 
      error: 'Translation failed',
      details: error.message || 'Unknown error occurred'
    });
  }
}