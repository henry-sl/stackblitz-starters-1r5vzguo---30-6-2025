// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement using structured prompts
// Enhanced language detection with ultra-conservative Malay detection

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';
import { buildPrompt, validateResponse, TASK_CONFIGS } from '../../lib/aiPrompts';

// Helper function to sanitize JSON strings and handle control characters
function sanitizeJsonString(str) {
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\f/g, '\\f')   // Escape form feeds
    .replace(/\b/g, '\\b');  // Escape backspaces
}

// Ultra-conservative language detection function
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // Clean text for analysis - remove markdown, punctuation, but keep structure
  const cleanText = text.toLowerCase()
    .replace(/[#*\-_`]/g, ' ')  // Remove markdown
    .replace(/[^\w\s]/g, ' ')   // Remove punctuation but keep words and spaces
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
  
  // Split into words for analysis
  const words = cleanText.split(' ').filter(word => word.length > 2); // Only consider words longer than 2 chars
  
  if (words.length === 0) return 'en';
  
  console.log(`[Language Detection] Analyzing ${words.length} words from: "${text.substring(0, 150)}..."`);
  
  // ULTRA-SPECIFIC Malay indicators (words that are NEVER used in English business contexts)
  const strongMalayIndicators = {
    // Malay-only words with very high confidence
    'adalah': 10, 'dengan': 10, 'untuk': 10, 'dalam': 10, 'pada': 10, 'dari': 10, 'yang': 10,
    'akan': 10, 'telah': 10, 'sudah': 10, 'belum': 10, 'tidak': 10, 'bukan': 10,
    'kami': 10, 'kita': 10, 'mereka': 10, 'anda': 10, 'saya': 10,
    'syarikat': 10, 'projek': 8, 'cadangan': 10, 'kepada': 10, 'daripada': 10,
    'keperluan': 10, 'pengalaman': 8, 'perkhidmatan': 10, 'penyelenggaraan': 10,
    'pembinaan': 8, 'kerajaan': 10, 'kontrak': 6, 'latar': 10, 'belakang': 8,
    'sijil': 10, 'pensijilan': 10, 'ringkasan': 10, 'eksekutif': 6,
    'bahagian': 10, 'diperkukuhkan': 15, 'disusun': 10, 'semula': 10,
    'maklumat': 10, 'tambahan': 10, 'mengenai': 10, 'meningkatkan': 10,
    'kredibiliti': 10, 'menunjukkan': 10, 'kesesuaian': 10, 'menggunakan': 10,
    'bahasa': 10, 'perniagaan': 10, 'formal': 6, 'persepsi': 10, 'positif': 6,
    'terhadap': 10, 'komitmen': 8, 'standard': 6, 'tinggi': 8,
    'diperbaiki': 10, 'ditambah': 10, 'dipertingkatkan': 10, 'diperkemas': 10,
    'menyeluruh': 10, 'berkesan': 10, 'berkualiti': 10, 'profesional': 6,
    'memastikan': 10, 'menyediakan': 10, 'melaksanakan': 10, 'mencapai': 10
  };
  
  // ULTRA-SPECIFIC English indicators (words that are NEVER used in Malay business contexts)
  const strongEnglishIndicators = {
    // English-only words with very high confidence
    'the': 10, 'and': 10, 'with': 10, 'for': 10, 'from': 10, 'that': 10, 'this': 10,
    'will': 10, 'has': 10, 'have': 10, 'not': 10, 'also': 10, 'only': 10, 'can': 10,
    'they': 10, 'our': 10, 'you': 10, 'your': 10, 'his': 10, 'her': 10, 'its': 10, 'their': 10,
    'company': 8, 'project': 6, 'proposal': 8, 'requirements': 10, 'experience': 6,
    'services': 8, 'maintenance': 8, 'construction': 6, 'government': 8, 'contract': 6,
    'background': 8, 'certifications': 10, 'executive': 6, 'summary': 8,
    'enhanced': 10, 'strengthened': 10, 'reorganized': 10, 'additional': 10,
    'information': 8, 'about': 10, 'increase': 8, 'credibility': 8,
    'demonstrate': 10, 'suitability': 10, 'using': 10, 'language': 6,
    'business': 6, 'formal': 6, 'perception': 10, 'positive': 6,
    'towards': 10, 'commitment': 6, 'standards': 6, 'high': 8,
    'we': 10, 'are': 10, 'is': 10, 'to': 10, 'of': 10, 'in': 10, 'on': 10,
    'as': 10, 'be': 10, 'by': 10, 'at': 10, 'an': 10, 'or': 10, 'if': 10,
    'improved': 10, 'better': 10, 'comprehensive': 10, 'ensure': 10,
    'provide': 10, 'implement': 10, 'achieve': 10, 'deliver': 10
  };
  
  // Count weighted word matches
  let malayScore = 0;
  let englishScore = 0;
  let malayWordCount = 0;
  let englishWordCount = 0;
  
  words.forEach(word => {
    if (strongMalayIndicators[word]) {
      malayScore += strongMalayIndicators[word];
      malayWordCount++;
    }
    if (strongEnglishIndicators[word]) {
      englishScore += strongEnglishIndicators[word];
      englishWordCount++;
    }
  });
  
  // Ultra-specific pattern matching for Malay
  const textLower = cleanText;
  
  // VERY STRONG Malay patterns (almost impossible to appear in English)
  if (textLower.includes('telah diperkukuhkan') || textLower.includes('telah ditambah')) malayScore += 25;
  if (textLower.includes('yang telah') || textLower.includes('yang akan')) malayScore += 20;
  if (textLower.includes('kami adalah') || textLower.includes('syarikat kami')) malayScore += 20;
  if (textLower.includes('dengan pengalaman') || textLower.includes('dalam bidang')) malayScore += 15;
  if (textLower.includes('kepada panel') || textLower.includes('panel penilai')) malayScore += 20;
  if (textLower.includes('bahasa malaysia') || textLower.includes('bahasa melayu')) malayScore += 25;
  
  // VERY STRONG English patterns (almost impossible to appear in Malay)
  if (textLower.includes('we are pleased') || textLower.includes('our company')) englishScore += 20;
  if (textLower.includes('the company') || textLower.includes('the project')) englishScore += 15;
  if (textLower.includes('has been') || textLower.includes('have been')) englishScore += 15;
  if (textLower.includes('will be') || textLower.includes('can be')) englishScore += 12;
  if (textLower.includes('is a leading') || textLower.includes('are a leading')) englishScore += 15;
  if (textLower.includes('look forward') || textLower.includes('thank you')) englishScore += 15;
  
  // Business entity indicators (very low weight to avoid false positives)
  if (textLower.includes('sdn bhd') || textLower.includes('berhad')) malayScore += 2;
  if (textLower.includes('ltd') || textLower.includes('limited') || textLower.includes('inc')) englishScore += 2;
  
  // Calculate percentages and word density
  const totalScore = malayScore + englishScore;
  const totalWords = words.length;
  const malayDensity = malayWordCount / totalWords * 100;
  const englishDensity = englishWordCount / totalWords * 100;
  
  console.log(`[Language Detection] Analysis Results:`);
  console.log(`  - Total words: ${totalWords}`);
  console.log(`  - Malay indicators: ${malayWordCount} words, score: ${malayScore}, density: ${malayDensity.toFixed(1)}%`);
  console.log(`  - English indicators: ${englishWordCount} words, score: ${englishScore}, density: ${englishDensity.toFixed(1)}%`);
  
  // ULTRA-CONSERVATIVE decision logic
  // Require VERY strong evidence for Malay classification
  
  // If very few total indicators, default to English
  if (totalScore < 10) {
    console.log(`[Language Detection] Very low confidence (score: ${totalScore}), defaulting to English`);
    return 'en';
  }
  
  // Require at least 3 strong Malay indicators AND significant score dominance
  if (malayWordCount >= 3 && malayScore > englishScore * 2 && malayScore >= 30) {
    console.log(`[Language Detection] Strong Malay evidence: ${malayWordCount} indicators, score ${malayScore} vs ${englishScore}`);
    return 'ms';
  }
  
  // For all other cases, default to English
  console.log(`[Language Detection] Insufficient Malay evidence, defaulting to English`);
  console.log(`  - Malay word count: ${malayWordCount} (need ≥3)`);
  console.log(`  - Malay score: ${malayScore} (need ≥30 and >2x English)`);
  console.log(`  - English score: ${englishScore}`);
  
  return 'en';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenderId, proposalContent } = req.body;
  
  if (!tenderId || !proposalContent) {
    return res.status(400).json({ error: 'tenderId and proposalContent are required' });
  }

  try {
    // Get the authorization token from the request headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get tender details and company profile for context
    const tender = await tenderOperations.getById(supabase, tenderId);
    const profile = await companyOperations.getProfile(supabase, user.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Detect the language of the input content
    const detectedLanguage = detectLanguage(proposalContent);
    console.log(`[Improve Proposal] Final detected language: ${detectedLanguage}`);

    // Mock AI improvement (preserves input language)
    if (!process.env.OPENAI_API_KEY) {
      let improvedContent;
      let insights;
      
      if (detectedLanguage === 'ms') {
        // Input is in Malay, improve in Malay
        improvedContent = proposalContent
          .replace(/\*\*Latar Belakang Syarikat:\*\*/g, '**Latar Belakang Syarikat:**')
          .replace(/\*\*Sijil:\*\*/g, '**Pensijilan dan Kelayakan:**')
          .replace(/\*\*Pengalaman Syarikat:\*\*/g, '**Pengalaman dan Kepakaran Syarikat:**')
          + `

## Pendekatan Teknikal

Kami mencadangkan pendekatan menyeluruh yang menangani semua keperluan teknikal sambil memastikan kualiti, pematuhan jadual masa, dan keberkesanan kos. Metodologi kami merangkumi:

- Perancangan projek terperinci dan penilaian risiko
- Jaminan kualiti dan pematuhan kepada semua standard
- Pelaporan kemajuan berkala dan komunikasi pihak berkepentingan
- Sokongan dan penyelenggaraan selepas pelaksanaan

## Kesimpulan

Kami berharap dapat peluang untuk membincangkan cadangan kami secara terperinci dan menunjukkan bagaimana ${profile?.name || 'syarikat kami'} dapat menyampaikan nilai luar biasa untuk projek penting ini.

Yang benar,
Pasukan ${profile?.name || 'Syarikat Kami'}`;

        insights = [
          {
            change: "Diperkukuhkan bahagian latar belakang syarikat",
            explanation: "Bahagian latar belakang syarikat telah diperkukuhkan dengan maklumat yang lebih terperinci tentang pengalaman dan keupayaan syarikat. Ini memberikan keyakinan kepada panel penilai tentang kredibiliti dan kesesuaian syarikat untuk projek ini."
          },
          {
            change: "Ditambah bahagian pendekatan teknikal",
            explanation: "Bahagian pendekatan teknikal yang baru ditambah menunjukkan metodologi yang jelas dan terstruktur. Ini membantu panel penilai memahami bagaimana syarikat akan melaksanakan projek dengan jayanya."
          },
          {
            change: "Diperbaiki struktur dan format dokumen",
            explanation: "Struktur dokumen telah diperbaiki dengan penggunaan tajuk yang lebih jelas dan format yang konsisten. Ini meningkatkan kebolehbacaan dan profesionalisme cadangan."
          }
        ];
      } else {
        // Input is in English, improve in English
        improvedContent = proposalContent
          .replace(/\*\*Company Background:\*\*/g, '**Company Background and Expertise:**')
          .replace(/\*\*Certifications:\*\*/g, '**Certifications and Qualifications:**')
          .replace(/\*\*Company Experience:\*\*/g, '**Company Experience and Capabilities:**')
          + `

## Technical Approach

We propose a comprehensive approach that addresses all technical requirements while ensuring quality, timeline adherence, and cost-effectiveness. Our methodology includes:

- Detailed project planning and risk assessment
- Quality assurance and compliance with all standards
- Regular progress reporting and stakeholder communication
- Post-implementation support and maintenance

## Project Management

Our proven project management framework ensures successful delivery:
- Dedicated project manager with relevant experience
- Clear communication channels and regular updates
- Proactive risk management and mitigation strategies
- Adherence to agreed timelines and budget constraints

## Conclusion

We look forward to the opportunity to discuss our proposal in detail and demonstrate how ${profile?.name || 'our company'} can deliver exceptional value for this important project.

Sincerely,
${profile?.name || 'Our Company'} Team`;

        insights = [
          {
            change: "Enhanced company background section",
            explanation: "The company background section has been strengthened with more detailed information about experience and capabilities. This provides confidence to the evaluation panel about the company's credibility and suitability for this project."
          },
          {
            change: "Added technical approach section",
            explanation: "A new technical approach section has been added to demonstrate clear and structured methodology. This helps the evaluation panel understand how the company will successfully execute the project."
          },
          {
            change: "Improved document structure and formatting",
            explanation: "The document structure has been improved with clearer headings and consistent formatting. This enhances readability and professionalism of the proposal."
          }
        ];
      }

      return res.status(200).json({ 
        improvedContent,
        insights
      });
    }

    // Use structured prompt system for OpenAI
    try {
      const context = {
        tender: {
          title: tender.title,
          description: tender.description,
          agency: tender.agency,
          category: tender.category,
          budget: tender.budget,
          requirements: tender.requirements
        },
        company: {
          name: profile?.name,
          registrationNumber: profile?.registration_number,
          certifications: profile?.certifications,
          experience: profile?.experience,
          contactEmail: profile?.contact_email
        },
        proposalContent
      };

      const messages = buildPrompt('PROPOSAL_IMPROVEMENT', context);
      const config = TASK_CONFIGS.PROPOSAL_IMPROVEMENT;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          ...config,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content.trim();
      
      // Validate the response
      const validation = validateResponse(responseText, 'PROPOSAL_IMPROVEMENT');
      if (!validation.isValid) {
        console.warn('AI response validation failed:', validation.issues);
      }
      
      // Parse the JSON response with better error handling
      try {
        // First, try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }

        let jsonString = jsonMatch[0];
        
        // Try to parse the JSON directly first
        let parsedResult;
        try {
          parsedResult = JSON.parse(jsonString);
        } catch (firstParseError) {
          console.warn('First JSON parse failed, attempting to sanitize:', firstParseError.message);
          
          // If direct parsing fails, try to fix common JSON issues
          // Handle unescaped newlines and quotes in the improvedContent field
          jsonString = jsonString.replace(
            /"improvedContent":\s*"([^"]*(?:\\.[^"]*)*)"/, 
            (match, content) => {
              const sanitizedContent = sanitizeJsonString(content);
              return `"improvedContent": "${sanitizedContent}"`;
            }
          );
          
          // Try parsing again after sanitization
          parsedResult = JSON.parse(jsonString);
        }

        // Validate the parsed result structure
        if (!parsedResult.improvedContent) {
          throw new Error('Missing improvedContent in AI response');
        }

        return res.status(200).json({
          improvedContent: parsedResult.improvedContent,
          insights: parsedResult.insights || [],
          validation: validation.isValid ? 'passed' : 'warning'
        });
        
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw response:', responseText);
        
        // Fallback: treat the entire response as improved content
        return res.status(200).json({
          improvedContent: responseText,
          insights: [
            {
              change: "Content has been improved by AI",
              explanation: "AI has made general improvements to the proposal based on tender context and company profile. The AI response could not be fully processed but the content has been enhanced."
            }
          ],
          validation: 'fallback'
        });
      }
    } catch (aiError) {
      console.error('AI improvement error:', aiError);
      // Fall back to preserving original content with language detection
      const detectedLang = detectLanguage(proposalContent);
      const fallbackMessage = detectedLang === 'ms' 
        ? '\n\n*Perkhidmatan penambahbaikan AI tidak tersedia buat masa ini*'
        : '\n\n*AI improvement service temporarily unavailable*';
        
      return res.status(200).json({ 
        improvedContent: proposalContent + fallbackMessage,
        insights: [
          {
            change: detectedLang === 'ms' ? "Perkhidmatan AI tidak tersedia" : "AI service unavailable",
            explanation: detectedLang === 'ms' 
              ? `Sistem AI mengalami masalah teknikal. Kandungan asal dalam bahasa ${detectedLang === 'ms' ? 'Bahasa Malaysia' : 'Inggeris'} telah dikekalkan. Sila cuba lagi kemudian atau hubungi sokongan teknikal.`
              : `The AI system experienced technical issues. Original content in ${detectedLang === 'ms' ? 'Bahasa Malaysia' : 'English'} has been preserved. Please try again later or contact technical support.`
          }
        ]
      });
    }
  } catch (error) {
    console.error('Proposal improvement error:', error);
    return res.status(500).json({ error: 'Failed to improve proposal' });
  }
}