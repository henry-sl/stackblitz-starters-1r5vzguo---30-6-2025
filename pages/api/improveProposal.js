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

// Helper function to detect language of content
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // Common Malay words and patterns
  const malayWords = [
    'dan', 'atau', 'dengan', 'untuk', 'dalam', 'pada', 'dari', 'ke', 'yang', 'adalah',
    'akan', 'telah', 'sudah', 'belum', 'tidak', 'bukan', 'juga', 'hanya', 'dapat',
    'syarikat', 'projek', 'cadangan', 'kepada', 'daripada', 'keperluan', 'pengalaman',
    'perkhidmatan', 'penyelenggaraan', 'pembinaan', 'kerajaan', 'tender', 'kontrak'
  ];
  
  // Common English words
  const englishWords = [
    'the', 'and', 'or', 'with', 'for', 'in', 'on', 'from', 'to', 'that', 'is',
    'will', 'has', 'have', 'not', 'also', 'only', 'can', 'company', 'project',
    'proposal', 'requirements', 'experience', 'services', 'maintenance', 'construction',
    'government', 'tender', 'contract'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Count matches for each language
  let malayCount = 0;
  let englishCount = 0;
  
  malayWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) malayCount += matches.length;
  });
  
  englishWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) englishCount += matches.length;
  });
  
  // Return detected language based on word count
  return malayCount > englishCount ? 'ms' : 'en';
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
    console.log(`[Improve Proposal] Detected language: ${detectedLanguage}`);

    // Mock AI improvement (preserves input language)
    if (!process.env.OPENAI_API_KEY) {
      // Create improved content in the same language as input
      let improvedContent;
      
      if (detectedLanguage === 'ms') {
        // Input is in Malay, improve in Malay
        improvedContent = `# Cadangan untuk ${tender.title}

## Ringkasan Eksekutif

Dengan hormatnya, ${profile?.name || 'syarikat kami'} ingin mengemukakan cadangan komprehensif untuk "${tender.title}" seperti yang diiklankan oleh ${tender.agency}. Dengan rekod prestasi yang terbukti dan kepakaran khusus dalam bidang ${tender.category?.toLowerCase()}, kami yakin dapat menyampaikan hasil yang cemerlang dan melebihi jangkaan sambil memastikan pematuhan penuh kepada semua keperluan yang ditetapkan.

Pendekatan kami menggabungkan amalan terbaik industri dengan penyelesaian inovatif, disokong oleh pasukan berpengalaman dan komitmen terhadap kecemerlangan kualiti. Kami memahami kepentingan kritikal projek ini dan bersedia untuk menumpukan sepenuh sumber kami bagi memastikan penyiapan yang berjaya dalam tempoh masa dan bajet yang ditetapkan.

## Latar Belakang Syarikat

${profile?.name || 'Syarikat kami'} membawa pengalaman luas dan keupayaan terbukti untuk projek ini. ${profile?.experience || 'Kami telah berjaya menyiapkan banyak projek serupa dengan hasil yang cemerlang.'} Pasukan profesional bertauliah kami komited untuk menyampaikan kerja berkualiti tinggi yang memenuhi standard industri tertinggi.

## Pendekatan Teknikal

Kami mencadangkan pendekatan menyeluruh yang menangani semua keperluan teknikal sambil memastikan kualiti, pematuhan jadual masa, dan keberkesanan kos.

## Kelayakan

Pensijilan kami termasuk: ${profile?.certifications?.join(', ') || 'Pelbagai pensijilan industri'}

## Kesimpulan

Kami berharap dapat peluang untuk membincangkan cadangan kami secara terperinci dan menunjukkan bagaimana ${profile?.name || 'syarikat kami'} dapat menyampaikan nilai luar biasa untuk projek penting ini.

Yang benar,
Pasukan ${profile?.name || 'Syarikat Kami'}`;
      } else {
        // Input is in English, improve in English
        improvedContent = `# Proposal for ${tender.title}

## Executive Summary

We are pleased to submit our comprehensive proposal for "${tender.title}" as advertised by ${tender.agency}. With our proven track record and specialized expertise in ${tender.category?.toLowerCase()}, we are confident in our ability to deliver exceptional results that exceed expectations while ensuring full compliance with all specified requirements.

Our approach combines industry best practices with innovative solutions, backed by our experienced team and commitment to quality excellence. We understand the critical importance of this project and are prepared to dedicate our full resources to ensure successful completion within the specified timeline and budget.

## Company Background

${profile?.name || 'Our company'} brings extensive experience and proven capabilities to this project. ${profile?.experience || 'We have successfully completed numerous similar projects with excellent results.'} Our team of certified professionals is committed to delivering high-quality work that meets the highest industry standards.

## Technical Approach

We propose a comprehensive approach that addresses all technical requirements while ensuring quality, timeline adherence, and cost-effectiveness.

## Qualifications

Our certifications include: ${profile?.certifications?.join(', ') || 'Various industry certifications'}

## Conclusion

We look forward to the opportunity to discuss our proposal in detail and demonstrate how ${profile?.name || 'our company'} can deliver exceptional value for this important project.

Sincerely,
${profile?.name || 'Our Company'} Team`;
      }

      const insights = [
        {
          change: "Diperkukuhkan bahagian ringkasan eksekutif",
          explanation: "Ringkasan eksekutif yang lebih kuat akan memberikan kesan pertama yang baik kepada panel penilai dan menunjukkan kefahaman mendalam terhadap keperluan projek. Penggunaan bahasa yang sesuai dengan konteks tender meningkatkan profesionalisme cadangan."
        },
        {
          change: "Ditambah baik bahagian latar belakang syarikat dengan butiran khusus",
          explanation: "Menyerlahkan kekuatan syarikat dengan lebih jelas akan membantu panel penilai memahami keupayaan dan pengalaman yang relevan. Penyenaraian kekuatan utama dalam format yang mudah dibaca meningkatkan kesan visual cadangan."
        },
        {
          change: "Diperhalusi pendekatan teknikal dengan metodologi yang jelas",
          explanation: "Pendekatan teknikal yang terstruktur menunjukkan profesionalisme dan perancangan yang teliti. Ini memberikan keyakinan kepada panel penilai bahawa syarikat mempunyai strategi yang jelas untuk melaksanakan projek dengan jayanya."
        },
        {
          change: `Digunakan bahasa ${detectedLanguage === 'ms' ? 'Bahasa Malaysia' : 'Inggeris'} yang konsisten`,
          explanation: `Mengekalkan bahasa asal kandungan (${detectedLanguage === 'ms' ? 'Bahasa Malaysia' : 'Inggeris'}) memastikan konsistensi dan mengelakkan kekeliruan. Penambahbaikan dibuat dalam bahasa yang sama untuk mengekalkan konteks dan nuansa yang betul.`
        }
      ];

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
              change: "Kandungan telah diperbaiki oleh AI",
              explanation: "AI telah membuat penambahbaikan umum kepada cadangan berdasarkan konteks tender dan profil syarikat. Respons AI tidak dapat diproses sepenuhnya tetapi kandungan telah diperbaiki."
            }
          ],
          validation: 'fallback'
        });
      }
    } catch (aiError) {
      console.error('AI improvement error:', aiError);
      // Fall back to preserving original content with language detection
      const detectedLang = detectLanguage(proposalContent);
      return res.status(200).json({ 
        improvedContent: proposalContent + `\n\n*Perkhidmatan penambahbaikan AI tidak tersedia buat masa ini*`,
        insights: [
          {
            change: "Perkhidmatan AI tidak tersedia",
            explanation: `Sistem AI mengalami masalah teknikal. Kandungan asal dalam bahasa ${detectedLang === 'ms' ? 'Bahasa Malaysia' : 'Inggeris'} telah dikekalkan. Sila cuba lagi kemudian atau hubungi sokongan teknikal.`
          }
        ]
      });
    }
  } catch (error) {
    console.error('Proposal improvement error:', error);
    return res.status(500).json({ error: 'Failed to improve proposal' });
  }
}