// pages/api/translate.js
// API endpoint for Malay-English translation using Lingo.dev SDK
// Handles bidirectional translation between English and Bahasa Malaysia

import { LingoDotDevEngine } from "lingo.dev/sdk";

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

  // Check if API key is configured and initialize engine inside handler
  if (!process.env.LINGODEV_API_KEY) {
    console.error("LINGODEV_API_KEY is not set. Translation service cannot function without API key.");
    return res.status(500).json({ 
      error: 'Translation service unavailable',
      details: 'LINGODEV_API_KEY is not configured. Please set up your Lingo.dev API key.'
    });
  }

  try {
    // Initialize Lingo.dev engine inside the handler to ensure env vars are loaded
    const lingoEngine = new LingoDotDevEngine({
      apiKey: process.env.LINGODEV_API_KEY,
    });

    // Improved source language inference logic
    // If target is Malay (ms), assume source is English (en)
    // If target is English (en), assume source is Malay (ms)
    const inferredSourceLang = targetLang === 'ms' ? 'en' : 'ms';

    console.log(`[Translation API] Translating from ${inferredSourceLang} to ${targetLang}:`, text.substring(0, 100) + '...');
    
    // Use the Lingo.dev SDK method: localizeText
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