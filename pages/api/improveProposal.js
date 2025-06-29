// pages/api/improveProposal.js
// API endpoint for AI-powered proposal improvement using structured prompts
// Now returns improved content in Bahasa Malaysia with detailed insights

import { createClient } from '@supabase/supabase-js';
import { tenderOperations, companyOperations } from '../../lib/database';
import { buildPrompt, validateResponse, TASK_CONFIGS } from '../../lib/aiPrompts';

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

    // Mock AI improvement (in real app, would use OpenAI API)
    if (!process.env.OPENAI_API_KEY) {
      // Enhanced mock response with Bahasa Malaysia content and insights
      const improvedContent = `# Cadangan untuk ${tender.title}

## Ringkasan Eksekutif

Dengan hormatnya, ${profile?.name || 'syarikat kami'} ingin mengemukakan cadangan komprehensif untuk "${tender.title}" seperti yang diiklankan oleh ${tender.agency}. Dengan rekod prestasi yang terbukti dan kepakaran khusus dalam bidang ${tender.category?.toLowerCase()}, kami yakin dapat menyampaikan hasil yang cemerlang dan melebihi jangkaan sambil memastikan pematuhan penuh kepada semua keperluan yang ditetapkan.

Pendekatan kami menggabungkan amalan terbaik industri dengan penyelesaian inovatif, disokong oleh pasukan berpengalaman dan komitmen terhadap kecemerlangan kualiti. Kami memahami kepentingan kritikal projek ini dan bersedia untuk menumpukan sepenuh sumber kami bagi memastikan penyiapan yang berjaya dalam tempoh masa dan bajet yang ditetapkan.

## Latar Belakang Syarikat

${profile?.name || 'Syarikat kami'} membawa pengalaman luas dan keupayaan terbukti untuk projek ini. ${profile?.experience || 'Kami telah berjaya menyiapkan banyak projek serupa dengan hasil yang cemerlang.'} Pasukan profesional bertauliah kami komited untuk menyampaikan kerja berkualiti tinggi yang memenuhi standard industri tertinggi.

Kekuatan utama kami termasuk:
- Rekod prestasi terbukti dalam projek serupa
- Ahli pasukan yang bertauliah dan berpengalaman
- Komitmen kukuh terhadap kualiti dan keselamatan
- Peralatan dan teknologi canggih
- Hubungan pelanggan yang cemerlang dan rujukan

## Pendekatan Teknikal

Kami mencadangkan pendekatan menyeluruh yang menangani semua keperluan teknikal sambil memastikan kualiti, pematuhan jadual masa, dan keberkesanan kos. Metodologi kami merangkumi:

- Perancangan projek terperinci dan penilaian risiko
- Jaminan kualiti dan pematuhan kepada semua standard
- Pelaporan kemajuan berkala dan komunikasi pihak berkepentingan
- Sokongan dan penyelenggaraan selepas pelaksanaan

## Kelayakan

Pensijilan kami termasuk: ${profile?.certifications?.join(', ') || 'Pelbagai pensijilan industri'}

## Kesimpulan

Kami berharap dapat peluang untuk membincangkan cadangan kami secara terperinci dan menunjukkan bagaimana ${profile?.name || 'syarikat kami'} dapat menyampaikan nilai luar biasa untuk projek penting ini.

Yang benar,
Pasukan ${profile?.name || 'Syarikat Kami'}`;

      const insights = [
        {
          change: "Diperkukuhkan bahagian ringkasan eksekutif",
          explanation: "Ringkasan eksekutif yang lebih kuat akan memberikan kesan pertama yang baik kepada panel penilai dan menunjukkan kefahaman mendalam terhadap keperluan projek. Penggunaan bahasa formal dan profesional dalam Bahasa Malaysia menunjukkan penghormatan terhadap keperluan rasmi tender."
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
          change: "Digunakan bahasa Bahasa Malaysia yang formal dan profesional",
          explanation: "Penggunaan Bahasa Malaysia yang betul dan formal adalah keperluan untuk tender kerajaan Malaysia. Ini menunjukkan penghormatan terhadap bahasa rasmi dan memenuhi keperluan penyerahan tender yang ditetapkan."
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
      
      // Parse the JSON response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          return res.status(200).json({
            improvedContent: parsedResult.improvedContent,
            insights: parsedResult.insights || [],
            validation: validation.isValid ? 'passed' : 'warning'
          });
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to treating the entire response as improved content
        return res.status(200).json({
          improvedContent: responseText,
          insights: [
            {
              change: "Kandungan telah diperbaiki oleh AI",
              explanation: "AI telah membuat penambahbaikan umum kepada cadangan berdasarkan konteks tender dan profil syarikat."
            }
          ],
          validation: 'fallback'
        });
      }
    } catch (aiError) {
      console.error('AI improvement error:', aiError);
      // Fall back to mock improvement
      return res.status(200).json({ 
        improvedContent: proposalContent + '\n\n*Perkhidmatan penambahbaikan AI tidak tersedia buat masa ini*',
        insights: [
          {
            change: "Perkhidmatan AI tidak tersedia",
            explanation: "Sistem AI mengalami masalah teknikal. Sila cuba lagi kemudian atau hubungi sokongan teknikal."
          }
        ]
      });
    }
  } catch (error) {
    console.error('Proposal improvement error:', error);
    return res.status(500).json({ error: 'Failed to improve proposal' });
  }
}