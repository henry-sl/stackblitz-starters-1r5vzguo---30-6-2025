// pages/api/translate.js
// API endpoint for Malay-English translation using Lingo.dev SDK
// Handles bidirectional translation between English and Bahasa Malaysia

import { LingoDotDevEngine } from "lingo.dev/sdk";

// Initialize Lingo.dev engine globally to reuse across requests
let lingoEngine;

if (process.env.LINGODEV_API_KEY) {
  lingoEngine = new LingoDotDevEngine({
    apiKey: process.env.LINGODEV_API_KEY,
  });
} else {
  console.warn("LINGODEV_API_KEY is not set. Lingo.dev translation will use mock data.");
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, targetLang } = req.body;
  
  // Validate required fields
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' });
  }

  try {
    // Improved source language inference logic
    // If target is Malay (ms), assume source is English (en)
    // If target is English (en), assume source is Malay (ms)
    const inferredSourceLang = targetLang === 'ms' ? 'en' : 'ms';

    console.log(`[Translation API] Translating from ${inferredSourceLang} to ${targetLang}:`, text.substring(0, 100) + '...');

    if (!lingoEngine) {
      // Fallback to mock translation if API key is not set
      let mockTranslation;
      if (targetLang === 'ms') {
        mockTranslation = `[Terjemahan Bahasa Malaysia] ${text}`;
      } else {
        mockTranslation = `[English Translation] ${text}`;
      }
      return res.status(200).json({
        translatedText: mockTranslation,
        sourceLanguage: inferredSourceLang,
        targetLanguage: targetLang,
        originalLength: text.length,
        translatedLength: mockTranslation.length,
        note: "This is a mock translation because LINGODEV_API_KEY is not set."
      });
    }
    
    // Use the correct Lingo.dev SDK method: localizeText
    const translationResult = await lingoEngine.localizeText(text, {
      sourceLocale: inferredSourceLang,
      targetLocale: targetLang,
    });

    console.log(`[Translation API] Lingo.dev translation successful, length: ${translationResult.length}`);

    return res.status(200).json({
      translatedText: translationResult,
      sourceLanguage: inferredSourceLang,
      targetLanguage: targetLang,
      originalLength: text.length,
      translatedLength: translationResult.length,
      note: "Translation powered by Lingo.dev SDK."
    });

  } catch (error) {
    console.error('[Translation API] Translation error:', error);
    
    return res.status(500).json({ 
      error: 'Translation failed',
      details: error.message || 'Unknown error occurred'
    });
  }
}