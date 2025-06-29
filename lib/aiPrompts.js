// lib/aiPrompts.js
// Centralized AI prompts and system instructions for Tenderly
// Implements structured prompts to prevent hallucination and ensure on-topic responses

/**
 * Core system prompt that defines the AI's role and behavior
 * This is used across all AI-powered features to ensure consistency
 */
export const TENDERLY_SYSTEM_PROMPT = `You are an AI assistant for Tenderly, a platform that helps SMEs and contractors in Malaysia and ASEAN access government and GLC tenders.

CRITICAL RULES:
1. NEVER invent facts. Only use information provided in the context.
2. If required data is missing, clearly state: "Not enough data to answer."
3. Never output boilerplate, apologies, or disclaimers.
4. Always follow the required output format exactly.
5. Be clear, concise, and businesslike.
6. Your outputs are used for legal and financial decisions - accuracy is critical.

CONTEXT FORMAT:
You will always receive:
- Tender Context: Full tender details, requirements, deadlines
- Company Profile: Company info, certifications, experience
- Task Instructions: Specific task to perform
- Output Format: Required structure for response

QUALITY TARGETS:
IDEAL: Accurate, comprehensive, uses only supplied context, follows exact format
ACCEPTABLE: Minor format errors but factually grounded
FORBIDDEN: Invents information, goes off-topic, uses generic phrases, fails to follow structure`;

/**
 * Task-specific prompts for different AI operations
 */
export const AI_TASKS = {
  SUMMARIZE: {
    instruction: `Summarize this tender in 3-4 sentences, focusing on key points and requirements. Use only the provided tender information.

OUTPUT FORMAT:
A concise paragraph covering:
- What the tender is for
- Key requirements
- Budget/timeline if specified
- Agency/location`,
    
    examples: {
      good: "This tender from DBKL seeks contractors for RM 2.5M road maintenance in KL, including pothole repairs and drainage improvements. Requires CIDB G4+ certification and 5+ years experience. Project duration is 24 months with regular quality inspections.",
      bad: "This is a great opportunity for construction companies. The project involves various road works and maintenance activities. Companies should apply if they have relevant experience."
    }
  },

  ELIGIBILITY_CHECK: {
    instruction: `Check company eligibility against tender requirements. Use ONLY the provided company profile data.

OUTPUT FORMAT:
{
  "matched_criteria": [
    "Requirement met: [specific requirement] - [evidence from profile]"
  ],
  "missing_criteria": [
    "Requirement not met: [specific requirement] - [what's missing]"
  ],
  "insufficient_data": [
    "Cannot verify: [requirement] - [what data is needed]"
  ]
}`,
    
    examples: {
      good: `{
  "matched_criteria": [
    "CIDB certification: Company has G5 (exceeds G4 requirement)",
    "Experience: 8 years in road construction (meets 5+ requirement)"
  ],
  "missing_criteria": [
    "ISO 9001: Not found in company certifications"
  ],
  "insufficient_data": [
    "Financial capacity: No financial information provided"
  ]
}`,
      bad: `{
  "matched_criteria": [
    "Company likely meets requirements",
    "Should be eligible based on profile"
  ]
}`
    }
  },

  PROPOSAL_GENERATION: {
    instruction: `Generate a professional proposal using ONLY the provided tender and company information.

OUTPUT FORMAT:
# Proposal for [Tender Title]

## Executive Summary
[2-3 sentences about company's suitability]

## Company Background
[Use only provided company info - name, experience, certifications]

## Technical Approach
[Address tender requirements using company capabilities]

## Compliance
[Map company qualifications to tender requirements]

## Conclusion
[Professional closing]`,
    
    examples: {
      good: "Uses specific company certifications, actual experience details, addresses exact tender requirements",
      bad: "Generic statements, invented experience, boilerplate content"
    }
  },

  PROPOSAL_IMPROVEMENT: {
    instruction: `Improve the provided proposal by enhancing clarity and alignment with tender requirements. Generate ALL content in official Bahasa Malaysia. Use ONLY the provided context.

IMPROVEMENTS TO MAKE:
1. Strengthen executive summary with better value proposition
2. Better align with tender requirements
3. Improve professional language and tone
4. Enhance technical approach section
5. Ensure compliance section is complete
6. Use formal Malaysian business language

OUTPUT FORMAT:
{
  "improvedContent": "[Full improved proposal text in Bahasa Malaysia]",
  "insights": [
    {
      "change": "[Brief description of what was changed - in Bahasa Malaysia]",
      "explanation": "[Detailed explanation of why this change improves the proposal - in Bahasa Malaysia]"
    }
  ]
}`,
    
    examples: {
      good: `{
  "improvedContent": "# Cadangan untuk Projek Penyelenggaraan Jalan\n\n## Ringkasan Eksekutif\nKami dengan hormatnya mengemukakan cadangan komprehensif untuk projek penyelenggaraan jalan...",
  "insights": [
    {
      "change": "Diperkukuhkan bahagian ringkasan eksekutif",
      "explanation": "Ringkasan eksekutif yang lebih kuat akan memberikan kesan pertama yang baik kepada panel penilai dan menunjukkan kefahaman mendalam terhadap keperluan projek"
    }
  ]
}`,
      bad: "Enhanced content that better highlights company strengths while staying factual"
    }
  }
};

/**
 * Constructs a complete prompt for OpenAI API calls
 * @param {string} task - Task type from AI_TASKS
 * @param {Object} context - Context data (tender, company, etc.)
 * @param {string} specificInstructions - Additional task-specific instructions
 * @returns {Array} Messages array for OpenAI API
 */
export function buildPrompt(task, context, specificInstructions = '') {
  const taskConfig = AI_TASKS[task];
  if (!taskConfig) {
    throw new Error(`Unknown task: ${task}`);
  }

  const systemMessage = {
    role: "system",
    content: TENDERLY_SYSTEM_PROMPT
  };

  const userMessage = {
    role: "user",
    content: `
TASK: ${taskConfig.instruction}

${specificInstructions ? `ADDITIONAL INSTRUCTIONS: ${specificInstructions}` : ''}

TENDER CONTEXT:
Title: ${context.tender?.title || 'Not provided'}
Description: ${context.tender?.description || 'Not provided'}
Agency: ${context.tender?.agency || 'Not provided'}
Category: ${context.tender?.category || 'Not provided'}
Budget: ${context.tender?.budget || 'Not specified'}
Requirements: ${context.tender?.requirements?.join(', ') || 'See description'}

COMPANY PROFILE:
Name: ${context.company?.name || 'Not provided'}
Registration: ${context.company?.registrationNumber || 'Not provided'}
Certifications: ${context.company?.certifications?.join(', ') || 'None listed'}
Experience: ${context.company?.experience || 'Not provided'}
Contact: ${context.company?.contactEmail || 'Not provided'}

${context.proposalContent ? `CURRENT PROPOSAL CONTENT:\n${context.proposalContent}` : ''}

EXAMPLES:
Good Response: ${taskConfig.examples.good}
Bad Response (AVOID): ${taskConfig.examples.bad}

Provide your response following the exact output format specified above.
    `.trim()
  };

  return [systemMessage, userMessage];
}

/**
 * Validates AI response to ensure it meets quality standards
 * @param {string} response - AI response to validate
 * @param {string} task - Task type
 * @returns {Object} Validation result with isValid and issues
 */
export function validateResponse(response, task) {
  const issues = [];
  
  // Check for forbidden phrases that indicate hallucination
  const forbiddenPhrases = [
    'as an ai',
    'i cannot',
    'i apologize',
    'it is likely',
    'probably',
    'might be',
    'could be',
    'generally speaking',
    'typically',
    'usually'
  ];
  
  const lowerResponse = response.toLowerCase();
  forbiddenPhrases.forEach(phrase => {
    if (lowerResponse.includes(phrase)) {
      issues.push(`Contains forbidden phrase: "${phrase}"`);
    }
  });
  
  // Check for minimum content length
  if (response.trim().length < 50) {
    issues.push('Response too short');
  }
  
  // Task-specific validation
  switch (task) {
    case 'ELIGIBILITY_CHECK':
      if (!response.includes('matched_criteria') && !response.includes('"matched_criteria"')) {
        issues.push('Missing required eligibility format');
      }
      break;
    case 'PROPOSAL_GENERATION':
      if (!response.includes('# Proposal for') && !response.includes('Executive Summary')) {
        issues.push('Missing required proposal structure');
      }
      break;
    case 'PROPOSAL_IMPROVEMENT':
      if (!response.includes('improvedContent') && !response.includes('"improvedContent"')) {
        issues.push('Missing required improvement format');
      }
      break;
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Default OpenAI API configuration
 */
export const OPENAI_CONFIG = {
  model: "o3-mini",
  temperature: 0.3, // Low temperature for factual, consistent responses
  max_tokens: 1500,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.1
};

/**
 * Task-specific OpenAI configurations
 */
export const TASK_CONFIGS = {
  SUMMARIZE: {
    ...OPENAI_CONFIG,
    max_tokens: 300,
    temperature: 0.2
  },
  ELIGIBILITY_CHECK: {
    ...OPENAI_CONFIG,
    max_tokens: 800,
    temperature: 0.1
  },
  PROPOSAL_GENERATION: {
    ...OPENAI_CONFIG,
    max_tokens: 2000,
    temperature: 0.4
  },
  PROPOSAL_IMPROVEMENT: {
    ...OPENAI_CONFIG,
    max_tokens: 3000,
    temperature: 0.3
  }
};