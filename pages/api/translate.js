// pages/api/translate.js
// API endpoint for Malay-English translation using Lingo.dev
// Handles bidirectional translation between English and Bahasa Malaysia

import { LingoDotDevEngine } from 'lingo.dev/sdk';

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

  // Validate API key
  if (!process.env.LINGO_API_KEY) {
    console.error('[Translation API] Missing LINGO_API_KEY environment variable');
    return res.status(500).json({ error: 'Translation service not configured' });
  }

  try {
    console.log(`[Translation API] Translating to ${targetLang}:`, text.substring(0, 100) + '...');
    
    // Initialize Lingo.dev engine
    const lingo = new LingoDotDevEngine({ 
      apiKey: process.env.LINGO_API_KEY 
    });

    // Determine source language if not provided
    // For our use case: if targetLang is 'ms' (Malay), assume source is 'en', and vice versa
    const sourceLanguage = sourceLang || (targetLang === 'ms' ? 'en' : 'ms');
    
    console.log(`[Translation API] Source: ${sourceLanguage}, Target: ${targetLang}`);

    // Perform translation using Lingo.dev SDK
    const result = await lingo.localizeString(text, {
      sourceLocale: sourceLanguage,
      targetLocale: targetLang
    });

    console.log(`[Translation API] Translation successful, length: ${result.length}`);

    return res.status(200).json({
      translatedText: result,
      sourceLanguage,
      targetLanguage: targetLang,
      originalLength: text.length,
      translatedLength: result.length
    });

  } catch (error) {
    console.error('[Translation API] Translation error:', error);
    
    // Handle specific error types
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return res.status(429).json({ 
        error: 'Translation quota exceeded. Please try again later.',
        details: 'Monthly translation limit reached'
      });
    }
    
    if (error.message?.includes('unauthorized') || error.message?.includes('invalid key')) {
      return res.status(401).json({ 
        error: 'Translation service authentication failed',
        details: 'Invalid API key'
      });
    }
    
    // Generic error response
    return res.status(500).json({ 
      error: 'Translation failed',
      details: error.message || 'Unknown error occurred'
    });
  }
}