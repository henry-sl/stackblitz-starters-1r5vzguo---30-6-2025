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

// ULTRA-CONSERVATIVE language detection function
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
  
  // EXTREMELY SPECIFIC Malay indicators - words that NEVER appear in English business contexts
  const ultraSpecificMalayWords = {
    // Core Malay function words that are impossible in English
    'adalah': 15, 'dengan': 15, 'untuk': 15, 'dalam': 15, 'pada': 15, 'dari': 15, 'yang': 15,
    'akan': 15, 'telah': 15, 'sudah': 15, 'belum': 15, 'tidak': 15, 'bukan': 15,
    'kami': 15, 'kita': 15, 'mereka': 15, 'anda': 15, 'saya': 15,
    'kepada': 15, 'daripada': 15, 'mengenai': 15, 'terhadap': 15,
    
    // Malay-specific business terms
    'syarikat': 20, 'cadangan': 20, 'keperluan': 20, 'perkhidmatan': 20, 'penyelenggaraan': 20,
    'pembinaan': 15, 'kerajaan': 20, 'latar': 15, 'belakang': 10, 'sijil': 20, 'pensijilan': 20,
    'ringkasan': 20, 'eksekutif': 10, 'bahagian': 20, 'maklumat': 20, 'tambahan': 15,
    'meningkatkan': 20, 'kredibiliti': 20, 'menunjukkan': 20, 'kesesuaian': 20,
    'menggunakan': 20, 'bahasa': 15, 'perniagaan': 20, 'persepsi': 20, 'positif': 8,
    'komitmen': 12, 'standard': 8, 'tinggi': 12, 'memastikan': 20, 'menyediakan': 20,
    'melaksanakan': 20, 'mencapai': 20, 'berkesan': 20, 'berkualiti': 20, 'profesional': 8,
    
    // Malay improvement-specific terms
    'diperkukuhkan': 25, 'diperbaiki': 25, 'ditambah': 25, 'dipertingkatkan': 25, 
    'diperkemas': 25, 'menyeluruh': 20, 'panel': 8, 'penilai': 15
  };
  
  // EXTREMELY SPECIFIC English indicators - words that NEVER appear in Malay business contexts
  const ultraSpecificEnglishWords = {
    // Core English function words that are impossible in Malay
    'the': 15, 'and': 15, 'with': 15, 'for': 15, 'from': 15, 'that': 15, 'this': 15,
    'will': 15, 'has': 15, 'have': 15, 'not': 15, 'also': 15, 'only': 15, 'can': 15,
    'they': 15, 'our': 15, 'you': 15, 'your': 15, 'his': 15, 'her': 15, 'its': 15, 'their': 15,
    'we': 15, 'are': 15, 'is': 15, 'to': 15, 'of': 15, 'in': 15, 'on': 15,
    'as': 15, 'be': 15, 'by': 15, 'at': 15, 'an': 15, 'or': 15, 'if': 15,
    'about': 15, 'towards': 15, 'using': 15, 'ensure': 15, 'provide': 15, 
    'implement': 15, 'achieve': 15, 'deliver': 15,
    
    // English-specific business terms
    'company': 12, 'proposal': 15, 'requirements': 20, 'services': 15, 'maintenance': 15,
    'construction': 12, 'government': 15, 'background': 12, 'certifications': 20,
    'executive': 10, 'summary': 15, 'enhanced': 20, 'strengthened': 20, 'reorganized': 20,
    'additional': 15, 'information': 12, 'increase': 15, 'credibility': 15,
    'demonstrate': 20, 'suitability': 20, 'language': 10, 'business': 10,
    'perception': 20, 'commitment': 12, 'standards': 12, 'improved': 20, 'better': 15,
    'comprehensive': 20
  };
  
  // Count weighted word matches with stricter thresholds
  let malayScore = 0;
  let englishScore = 0;
  let malayWordCount = 0;
  let englishWordCount = 0;
  
  words.forEach(word => {
    if (ultraSpecificMalayWords[word]) {
      malayScore += ultraSpecificMalayWords[word];
      malayWordCount++;
    }
    if (ultraSpecificEnglishWords[word]) {
      englishScore += ultraSpecificEnglishWords[word];
      englishWordCount++;
    }
  });
  
  // ULTRA-SPECIFIC pattern matching for Malay (only the most distinctive patterns)
  const textLower = cleanText;
  
  // EXTREMELY STRONG Malay patterns (virtually impossible in English)
  if (textLower.includes('telah diperkukuhkan') || textLower.includes('telah ditambah')) malayScore += 30;
  if (textLower.includes('yang telah') || textLower.includes('yang akan')) malayScore += 25;
  if (textLower.includes('kami adalah') || textLower.includes('syarikat kami')) malayScore += 25;
  if (textLower.includes('dengan pengalaman') || textLower.includes('dalam bidang')) malayScore += 20;
  if (textLower.includes('kepada panel') || textLower.includes('panel penilai')) malayScore += 25;
  if (textLower.includes('bahasa malaysia') || textLower.includes('bahasa melayu')) malayScore += 30;
  if (textLower.includes('diperkukuhkan dengan') || textLower.includes('ditambah bahagian')) malayScore += 30;
  
  // EXTREMELY STRONG English patterns (virtually impossible in Malay)
  if (textLower.includes('we are pleased') || textLower.includes('our company')) englishScore += 25;
  if (textLower.includes('the company') || textLower.includes('the project')) englishScore += 20;
  if (textLower.includes('has been') || textLower.includes('have been')) englishScore += 20;
  if (textLower.includes('will be') || textLower.includes('can be')) englishScore += 18;
  if (textLower.includes('is a leading') || textLower.includes('are a leading')) englishScore += 20;
  if (textLower.includes('look forward') || textLower.includes('thank you')) englishScore += 20;
  if (textLower.includes('enhanced with') || textLower.includes('strengthened with')) englishScore += 25;
  
  // Business entity indicators (minimal weight)
  if (textLower.includes('sdn bhd') || textLower.includes('berhad')) malayScore += 1;
  if (textLower.includes('ltd') || textLower.includes('limited') || textLower.includes('inc')) englishScore += 1;
  
  // Calculate percentages and word density
  const totalScore = malayScore + englishScore;
  const totalWords = words.length;
  const malayDensity = malayWordCount / totalWords * 100;
  const englishDensity = englishWordCount / totalWords * 100;
  
  console.log(`[Language Detection] Analysis Results:`);
  console.log(`  - Total words: ${totalWords}`);
  console.log(`  - Malay indicators: ${malayWordCount} words, score: ${malayScore}, density: ${malayDensity.toFixed(1)}%`);
  console.log(`  - English indicators: ${englishWordCount} words, score: ${englishScore}, density: ${englishDensity.toFixed(1)}%`);
  
  // EXTREMELY CONSERVATIVE decision logic
  // Require OVERWHELMING evidence for Malay classification
  
  // If very few total indicators, default to English
  if (totalScore < 15) {
    console.log(`[Language Detection] Very low confidence (score: ${totalScore}), defaulting to English`);
    return 'en';
  }
  
  // Require at least 4 strong Malay indicators AND massive score dominance AND high density
  if (malayWordCount >= 4 && 
      malayScore > englishScore * 3 && 
      malayScore >= 50 && 
      malayDensity >= 8) {
    console.log(`[Language Detection] OVERWHELMING Malay evidence: ${malayWordCount} indicators, score ${malayScore} vs ${englishScore}, density ${malayDensity.toFixed(1)}%`);
    return 'ms';
  }
  
  // For all other cases, default to English
  console.log(`[Language Detection] Insufficient Malay evidence, defaulting to English`);
  console.log(`  - Malay word count: ${malayWordCount} (need ≥4)`);
  console.log(`  - Malay score: ${malayScore} (need ≥50 and >3x English)`);
  console.log(`  - English score: ${englishScore}`);
  console.log(`  - Malay density: ${malayDensity.toFixed(1)}% (need ≥8%)`);
  
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