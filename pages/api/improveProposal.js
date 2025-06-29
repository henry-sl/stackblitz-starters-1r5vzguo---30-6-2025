// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement using structured prompts
// Enhanced language detection with better accuracy

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

// Significantly enhanced language detection function
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // Clean text for analysis - remove markdown, punctuation, but keep structure
  const cleanText = text.toLowerCase()
    .replace(/[#*\-_`]/g, ' ')  // Remove markdown
    .replace(/[^\w\s]/g, ' ')   // Remove punctuation but keep words and spaces
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
  
  // Split into words for analysis
  const words = cleanText.split(' ').filter(word => word.length > 1);
  
  if (words.length === 0) return 'en';
  
  // Comprehensive Malay word list with weights
  const malayWords = {
    // High-weight Malay-specific words (very unlikely to appear in English)
    'adalah': 5, 'dengan': 5, 'untuk': 5, 'dalam': 5, 'pada': 5, 'dari': 5, 'yang': 5,
    'akan': 5, 'telah': 5, 'sudah': 5, 'belum': 5, 'tidak': 5, 'bukan': 5,
    'kami': 5, 'kita': 5, 'mereka': 5, 'anda': 5, 'saya': 5,
    'syarikat': 5, 'projek': 5, 'cadangan': 5, 'kepada': 5, 'daripada': 5,
    'keperluan': 5, 'pengalaman': 5, 'perkhidmatan': 5, 'penyelenggaraan': 5,
    'pembinaan': 5, 'kerajaan': 5, 'kontrak': 5, 'latar': 5, 'belakang': 5,
    'sijil': 5, 'pensijilan': 5, 'ringkasan': 5, 'eksekutif': 5,
    'bahagian': 5, 'diperkukuhkan': 5, 'disusun': 5, 'semula': 5,
    'maklumat': 5, 'tambahan': 5, 'mengenai': 5, 'meningkatkan': 5,
    'kredibiliti': 5, 'menunjukkan': 5, 'kesesuaian': 5, 'menggunakan': 5,
    'bahasa': 5, 'perniagaan': 5, 'formal': 5, 'persepsi': 5, 'positif': 5,
    'terhadap': 5, 'komitmen': 5, 'standard': 5, 'tinggi': 5,
    
    // Medium-weight words (common Malay words)
    'dan': 3, 'atau': 3, 'juga': 3, 'hanya': 3, 'dapat': 3,
    'ini': 3, 'itu': 3, 'dia': 3, 'ia': 3, 'tender': 2,
    
    // Lower-weight words (could appear in both languages but more common in Malay)
    'berhad': 2, 'sdn': 2
  };
  
  // Comprehensive English word list with weights
  const englishWords = {
    // High-weight English-specific words
    'the': 5, 'and': 5, 'with': 5, 'for': 5, 'from': 5, 'that': 5, 'this': 5,
    'will': 5, 'has': 5, 'have': 5, 'not': 5, 'also': 5, 'only': 5, 'can': 5,
    'they': 5, 'our': 5, 'you': 5, 'your': 5, 'his': 5, 'her': 5, 'its': 5, 'their': 5,
    'company': 5, 'project': 5, 'proposal': 5, 'requirements': 5, 'experience': 5,
    'services': 5, 'maintenance': 5, 'construction': 5, 'government': 5, 'contract': 5,
    'background': 5, 'certifications': 5, 'executive': 5, 'summary': 5,
    'enhanced': 5, 'strengthened': 5, 'reorganized': 5, 'additional': 5,
    'information': 5, 'about': 5, 'increase': 5, 'credibility': 5,
    'demonstrate': 5, 'suitability': 5, 'using': 5, 'language': 5,
    'business': 5, 'formal': 5, 'perception': 5, 'positive': 5,
    'towards': 5, 'commitment': 5, 'standards': 5, 'high': 5,
    'we': 5, 'are': 5, 'is': 5, 'to': 5, 'of': 5, 'in': 5, 'on': 5,
    'as': 5, 'be': 5, 'by': 5, 'at': 5, 'an': 5, 'or': 5, 'if': 5,
    
    // Medium-weight words
    'tender': 2, 'limited': 3, 'ltd': 3, 'inc': 3, 'corporation': 3,
    
    // Common English business terms
    'solutions': 4, 'professional': 4, 'quality': 4, 'management': 4,
    'technical': 4, 'approach': 4, 'methodology': 4, 'implementation': 4
  };
  
  // Count weighted word matches
  let malayScore = 0;
  let englishScore = 0;
  let totalWords = words.length;
  
  words.forEach(word => {
    if (malayWords[word]) {
      malayScore += malayWords[word];
    }
    if (englishWords[word]) {
      englishScore += englishWords[word];
    }
  });
  
  // Additional pattern-based scoring
  const textLower = cleanText;
  
  // English patterns (strong indicators)
  if (textLower.includes('we are') || textLower.includes('our company')) englishScore += 10;
  if (textLower.includes('the company') || textLower.includes('the project')) englishScore += 8;
  if (textLower.includes('has been') || textLower.includes('have been')) englishScore += 8;
  if (textLower.includes('will be') || textLower.includes('can be')) englishScore += 6;
  if (textLower.includes('is a') || textLower.includes('are a')) englishScore += 6;
  
  // Malay patterns (strong indicators)
  if (textLower.includes('telah diperkukuhkan') || textLower.includes('telah ditambah')) malayScore += 15;
  if (textLower.includes('yang telah') || textLower.includes('yang akan')) malayScore += 10;
  if (textLower.includes('kami adalah') || textLower.includes('syarikat kami')) malayScore += 10;
  if (textLower.includes('dengan pengalaman') || textLower.includes('dalam bidang')) malayScore += 8;
  
  // Business entity indicators (lower weight to avoid false positives)
  if (textLower.includes('sdn bhd') || textLower.includes('berhad')) malayScore += 3;
  if (textLower.includes('ltd') || textLower.includes('limited') || textLower.includes('inc')) englishScore += 3;
  
  // Calculate percentages for better decision making
  const totalScore = malayScore + englishScore;
  const malayPercentage = totalScore > 0 ? (malayScore / totalScore) * 100 : 0;
  const englishPercentage = totalScore > 0 ? (englishScore / totalScore) * 100 : 0;
  
  console.log(`[Language Detection] Text: "${text.substring(0, 100)}..."`);
  console.log(`[Language Detection] Words analyzed: ${totalWords}`);
  console.log(`[Language Detection] Malay score: ${malayScore} (${malayPercentage.toFixed(1)}%)`);
  console.log(`[Language Detection] English score: ${englishScore} (${englishPercentage.toFixed(1)}%)`);
  
  // Decision logic with higher threshold for confidence
  if (totalScore < 5) {
    // Very low scores - default to English for business contexts
    console.log(`[Language Detection] Low confidence scores, defaulting to English`);
    return 'en';
  }
  
  // Require significant dominance (at least 60% vs 40%) to classify as Malay
  if (malayScore > englishScore && malayPercentage >= 60) {
    console.log(`[Language Detection] Detected as Malay with ${malayPercentage.toFixed(1)}% confidence`);
    return 'ms';
  } else {
    console.log(`[Language Detection] Detected as English with ${englishPercentage.toFixed(1)}% confidence`);
    return 'en';
  }
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