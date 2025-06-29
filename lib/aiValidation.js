// lib/aiValidation.js
// Additional validation utilities for AI responses
// Provides content filtering and quality checks

/**
 * Content filters to detect potentially problematic AI responses
 */
export const CONTENT_FILTERS = {
  // Phrases that indicate the AI is hallucinating or being too generic
  HALLUCINATION_INDICATORS: [
    'as an ai language model',
    'i cannot provide',
    'i apologize',
    'it is likely that',
    'probably',
    'might be',
    'could potentially',
    'generally speaking',
    'typically',
    'usually',
    'in most cases',
    'it is common',
    'often',
    'sometimes'
  ],

  // Phrases that indicate the AI is going off-topic
  OFF_TOPIC_INDICATORS: [
    'legal advice',
    'financial advice',
    'investment recommendation',
    'guarantee',
    'promise',
    'ensure success',
    'definitely win',
    'certain to succeed'
  ],

  // Required elements for different response types
  REQUIRED_ELEMENTS: {
    SUMMARIZE: ['tender', 'requirement', 'agency'],
    ELIGIBILITY_CHECK: ['requirement', 'company', 'certification'],
    PROPOSAL_GENERATION: ['executive summary', 'company', 'approach'],
    PROPOSAL_IMPROVEMENT: ['enhanced', 'improved', 'better']
  }
};

/**
 * Validates AI response content for quality and appropriateness
 * @param {string} content - AI response content
 * @param {string} task - Task type
 * @param {Object} context - Original context data
 * @returns {Object} Validation result
 */
export function validateAIContent(content, task, context = {}) {
  const issues = [];
  const warnings = [];
  const lowerContent = content.toLowerCase();

  // Check for hallucination indicators
  CONTENT_FILTERS.HALLUCINATION_INDICATORS.forEach(phrase => {
    if (lowerContent.includes(phrase)) {
      issues.push(`Contains hallucination indicator: "${phrase}"`);
    }
  });

  // Check for off-topic indicators
  CONTENT_FILTERS.OFF_TOPIC_INDICATORS.forEach(phrase => {
    if (lowerContent.includes(phrase)) {
      issues.push(`Contains off-topic content: "${phrase}"`);
    }
  });

  // Check for required elements based on task type
  const requiredElements = CONTENT_FILTERS.REQUIRED_ELEMENTS[task] || [];
  requiredElements.forEach(element => {
    if (!lowerContent.includes(element.toLowerCase())) {
      warnings.push(`Missing expected element: "${element}"`);
    }
  });

  // Check content length
  if (content.trim().length < 100) {
    warnings.push('Response is quite short');
  }

  // Check if response uses context data
  if (context.tender?.title && !lowerContent.includes(context.tender.title.toLowerCase())) {
    warnings.push('Response may not be using tender title from context');
  }

  if (context.company?.name && !lowerContent.includes(context.company.name.toLowerCase())) {
    warnings.push('Response may not be using company name from context');
  }

  // Task-specific validation
  switch (task) {
    case 'ELIGIBILITY_CHECK':
      if (!content.includes('eligible') && !content.includes('requirement')) {
        issues.push('Eligibility check response missing key terms');
      }
      break;
    
    case 'PROPOSAL_GENERATION':
      if (!content.includes('#') && !content.includes('##')) {
        warnings.push('Proposal missing markdown headers');
      }
      break;
  }

  return {
    isValid: issues.length === 0,
    hasWarnings: warnings.length > 0,
    issues,
    warnings,
    score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5))
  };
}

/**
 * Sanitizes AI response content
 * @param {string} content - Raw AI response
 * @returns {string} Sanitized content
 */
export function sanitizeAIResponse(content) {
  // Remove common AI disclaimers
  let sanitized = content
    .replace(/^(As an AI language model,?|I'm an AI assistant,?|As an AI,?)\s*/gi, '')
    .replace(/\*\*?Disclaimer\*\*?:.*$/gim, '')
    .replace(/\*\*?Note\*\*?:.*$/gim, '')
    .replace(/Please note that.*$/gim, '')
    .replace(/It's important to note that.*$/gim, '');

  // Clean up extra whitespace
  sanitized = sanitized
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return sanitized;
}

/**
 * Logs AI response quality metrics for monitoring
 * @param {string} task - Task type
 * @param {Object} validation - Validation result
 * @param {Object} context - Request context
 */
export function logAIMetrics(task, validation, context = {}) {
  const metrics = {
    timestamp: new Date().toISOString(),
    task,
    isValid: validation.isValid,
    score: validation.score,
    issueCount: validation.issues?.length || 0,
    warningCount: validation.warnings?.length || 0,
    tenderId: context.tender?.id,
    userId: context.user?.id
  };

  // In production, you might want to send this to a monitoring service
  console.log('[AI Metrics]', metrics);

  // Log issues for debugging
  if (validation.issues?.length > 0) {
    console.warn('[AI Issues]', validation.issues);
  }

  if (validation.warnings?.length > 0) {
    console.info('[AI Warnings]', validation.warnings);
  }
}