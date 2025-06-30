// pages/api/translate.js
// API endpoint for Malay-English translation using Lingo.dev SDK
// Enhanced with realistic mock translations for better testing experience

import { LingoDotDevEngine } from "lingo.dev/sdk";

// Initialize Lingo.dev engine globally to reuse across requests
let lingoEngine;

if (process.env.LINGODEV_API_KEY) {
  lingoEngine = new LingoDotDevEngine({
    apiKey: process.env.LINGODEV_API_KEY,
  });
} else {
  console.warn("LINGODEV_API_KEY is not set. Lingo.dev translation will use enhanced mock data.");
}

// Enhanced mock translation function with realistic examples
function generateMockTranslation(text, targetLang) {
  const textLower = text.toLowerCase();
  
  if (targetLang === 'ms') {
    // English to Malay mock translations with common business/tender terms
    let mockTranslation = text;
    
    // Common tender/business term replacements
    const englishToMalay = {
      'tender': 'tender',
      'proposal': 'cadangan',
      'company': 'syarikat',
      'project': 'projek',
      'construction': 'pembinaan',
      'maintenance': 'penyelenggaraan',
      'road': 'jalan',
      'repair': 'pembaikan',
      'services': 'perkhidmatan',
      'government': 'kerajaan',
      'requirements': 'keperluan',
      'experience': 'pengalaman',
      'certification': 'pensijilan',
      'budget': 'bajet',
      'deadline': 'tarikh akhir',
      'submission': 'penyerahan',
      'contractor': 'kontraktor',
      'infrastructure': 'infrastruktur',
      'development': 'pembangunan',
      'management': 'pengurusan',
      'quality': 'kualiti',
      'safety': 'keselamatan',
      'equipment': 'peralatan',
      'technology': 'teknologi',
      'system': 'sistem',
      'implementation': 'pelaksanaan',
      'upgrade': 'naik taraf',
      'modernization': 'pemodenan',
      'network': 'rangkaian',
      'security': 'keselamatan',
      'building': 'bangunan',
      'facility': 'kemudahan',
      'environmental': 'alam sekitar',
      'waste': 'sisa',
      'smart city': 'bandar pintar',
      'healthcare': 'penjagaan kesihatan',
      'medical': 'perubatan',
      'equipment': 'peralatan',
      'hospital': 'hospital',
      'ministry': 'kementerian',
      'department': 'jabatan',
      'city hall': 'dewan bandaraya',
      'state government': 'kerajaan negeri',
      'kuala lumpur': 'kuala lumpur',
      'selangor': 'selangor',
      'putrajaya': 'putrajaya',
      'malaysia': 'malaysia'
    };
    
    // Apply word-by-word translation for common terms
    Object.entries(englishToMalay).forEach(([english, malay]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      mockTranslation = mockTranslation.replace(regex, malay);
    });
    
    // Common phrase patterns
    mockTranslation = mockTranslation
      .replace(/this tender/gi, 'tender ini')
      .replace(/the project/gi, 'projek ini')
      .replace(/our company/gi, 'syarikat kami')
      .replace(/we are/gi, 'kami adalah')
      .replace(/with experience/gi, 'dengan pengalaman')
      .replace(/years of/gi, 'tahun')
      .replace(/minimum/gi, 'minimum')
      .replace(/maximum/gi, 'maksimum')
      .replace(/including/gi, 'termasuk')
      .replace(/such as/gi, 'seperti')
      .replace(/and/gi, 'dan')
      .replace(/or/gi, 'atau')
      .replace(/with/gi, 'dengan')
      .replace(/for/gi, 'untuk')
      .replace(/from/gi, 'daripada')
      .replace(/to/gi, 'kepada')
      .replace(/in/gi, 'dalam')
      .replace(/on/gi, 'pada')
      .replace(/at/gi, 'di')
      .replace(/by/gi, 'oleh')
      .replace(/will be/gi, 'akan')
      .replace(/must be/gi, 'mestilah')
      .replace(/should be/gi, 'sepatutnya')
      .replace(/can be/gi, 'boleh')
      .replace(/may be/gi, 'mungkin');
    
    return `[Terjemahan Bahasa Malaysia] ${mockTranslation}`;
    
  } else {
    // Malay to English mock translations
    let mockTranslation = text;
    
    const malayToEnglish = {
      'tender': 'tender',
      'cadangan': 'proposal',
      'syarikat': 'company',
      'projek': 'project',
      'pembinaan': 'construction',
      'penyelenggaraan': 'maintenance',
      'jalan': 'road',
      'pembaikan': 'repair',
      'perkhidmatan': 'services',
      'kerajaan': 'government',
      'keperluan': 'requirements',
      'pengalaman': 'experience',
      'pensijilan': 'certification',
      'bajet': 'budget',
      'tarikh akhir': 'deadline',
      'penyerahan': 'submission',
      'kontraktor': 'contractor',
      'infrastruktur': 'infrastructure',
      'pembangunan': 'development',
      'pengurusan': 'management',
      'kualiti': 'quality',
      'keselamatan': 'safety',
      'peralatan': 'equipment',
      'teknologi': 'technology',
      'sistem': 'system',
      'pelaksanaan': 'implementation',
      'naik taraf': 'upgrade',
      'pemodenan': 'modernization',
      'rangkaian': 'network',
      'bangunan': 'building',
      'kemudahan': 'facility',
      'alam sekitar': 'environmental',
      'sisa': 'waste',
      'bandar pintar': 'smart city',
      'penjagaan kesihatan': 'healthcare',
      'perubatan': 'medical',
      'hospital': 'hospital',
      'kementerian': 'ministry',
      'jabatan': 'department',
      'dewan bandaraya': 'city hall',
      'kerajaan negeri': 'state government'
    };
    
    // Apply word-by-word translation for common terms
    Object.entries(malayToEnglish).forEach(([malay, english]) => {
      const regex = new RegExp(`\\b${malay}\\b`, 'gi');
      mockTranslation = mockTranslation.replace(regex, english);
    });
    
    // Common phrase patterns
    mockTranslation = mockTranslation
      .replace(/tender ini/gi, 'this tender')
      .replace(/projek ini/gi, 'the project')
      .replace(/syarikat kami/gi, 'our company')
      .replace(/kami adalah/gi, 'we are')
      .replace(/dengan pengalaman/gi, 'with experience')
      .replace(/tahun/gi, 'years of')
      .replace(/termasuk/gi, 'including')
      .replace(/seperti/gi, 'such as')
      .replace(/dan/gi, 'and')
      .replace(/atau/gi, 'or')
      .replace(/dengan/gi, 'with')
      .replace(/untuk/gi, 'for')
      .replace(/daripada/gi, 'from')
      .replace(/kepada/gi, 'to')
      .replace(/dalam/gi, 'in')
      .replace(/pada/gi, 'on')
      .replace(/di/gi, 'at')
      .replace(/oleh/gi, 'by')
      .replace(/akan/gi, 'will be')
      .replace(/mestilah/gi, 'must be')
      .replace(/sepatutnya/gi, 'should be')
      .replace(/boleh/gi, 'can be')
      .replace(/mungkin/gi, 'may be');
    
    return `[English Translation] ${mockTranslation}`;
  }
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
      // Enhanced mock translation with realistic examples
      const mockTranslation = generateMockTranslation(text, targetLang);
      
      return res.status(200).json({
        translatedText: mockTranslation,
        sourceLanguage: inferredSourceLang,
        targetLanguage: targetLang,
        originalLength: text.length,
        translatedLength: mockTranslation.length,
        note: "This is an enhanced mock translation because LINGODEV_API_KEY is not set. The translation includes realistic term substitutions for demonstration purposes."
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