// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement using structured prompts
// Fixed JSON parsing and language detection issues

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

// Enhanced language detection function
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // Clean text for analysis
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // More comprehensive Malay words and patterns
  const malayWords = [
    // Common words
    'dan', 'atau', 'dengan', 'untuk', 'dalam', 'pada', 'dari', 'ke', 'yang', 'adalah',
    'akan', 'telah', 'sudah', 'belum', 'tidak', 'bukan', 'juga', 'hanya', 'dapat',
    'ini', 'itu', 'mereka', 'kami', 'kita', 'saya', 'anda', 'dia', 'ia',
    // Business/tender specific
    'syarikat', 'projek', 'cadangan', 'kepada', 'daripada', 'keperluan', 'pengalaman',
    'perkhidmatan', 'penyelenggaraan', 'pembinaan', 'kerajaan', 'tender', 'kontrak',
    'latar', 'belakang', 'sijil', 'pensijilan', 'ringkasan', 'eksekutif',
    'bahagian', 'diperkukuhkan', 'disusun', 'semula', 'maklumat', 'tambahan',
    'mengenai', 'meningkatkan', 'kredibiliti', 'menunjukkan', 'kesesuaian',
    'menggunakan', 'bahasa', 'perniagaan', 'formal', 'persepsi', 'positif',
    'terhadap', 'komitmen', 'standard', 'tinggi'
  ];
  
  // More comprehensive English words
  const englishWords = [
    // Common words
    'the', 'and', 'or', 'with', 'for', 'in', 'on', 'from', 'to', 'that', 'is',
    'will', 'has', 'have', 'not', 'also', 'only', 'can', 'this', 'they', 'we',
    'our', 'you', 'your', 'his', 'her', 'its', 'their',
    // Business/tender specific
    'company', 'project', 'proposal', 'requirements', 'experience', 'services',
    'maintenance', 'construction', 'government', 'tender', 'contract',
    'background', 'certifications', 'executive', 'summary', 'enhanced',
    'strengthened', 'reorganized', 'additional', 'information', 'about',
    'increase', 'credibility', 'demonstrate', 'suitability', 'using',
    'language', 'business', 'formal', 'perception', 'positive', 'towards',
    'commitment', 'standards', 'high'
  ];
  
  // Count word matches with higher weight for longer words
  let malayScore = 0;
  let englishScore = 0;
  
  malayWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = cleanText.match(regex);
    if (matches) {
      // Give higher weight to longer, more specific words
      const weight = word.length > 5 ? 2 : 1;
      malayScore += matches.length * weight;
    }
  });
  
  englishWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = cleanText.match(regex);
    if (matches) {
      // Give higher weight to longer, more specific words
      const weight = word.length > 5 ? 2 : 1;
      englishScore += matches.length * weight;
    }
  });
  
  // Additional checks for language patterns
  
  // Check for Malay-specific patterns
  if (cleanText.includes('sdn bhd') || cleanText.includes('berhad')) malayScore += 3;
  if (cleanText.includes('yang') && cleanText.includes('adalah')) malayScore += 2;
  if (cleanText.includes('kepada') || cleanText.includes('daripada')) malayScore += 2;
  
  // Check for English-specific patterns
  if (cleanText.includes('ltd') || cleanText.includes('limited') || cleanText.includes('inc')) englishScore += 3;
  if (cleanText.includes('the') && cleanText.includes('and')) englishScore += 2;
  if (cleanText.includes('we are') || cleanText.includes('our company')) englishScore += 2;
  
  console.log(`[Language Detection] Malay score: ${malayScore}, English score: ${englishScore}`);
  
  // Return detected language with a minimum threshold
  if (malayScore > englishScore && malayScore > 2) {
    return 'ms';
  } else if (englishScore > malayScore && englishScore > 2) {
    return 'en';
  } else {
    // Default to English if scores are too close or too low
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
    console.log(`[Improve Proposal] Detected language: ${detectedLanguage} for content: "${proposalContent.substring(0, 100)}..."`);

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