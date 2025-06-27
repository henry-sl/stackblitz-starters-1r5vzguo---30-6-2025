// pages/help.js
// Help and FAQ page with search and filtering capabilities
// Provides comprehensive support documentation for users

import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SearchBox from '../components/Help/SearchBox';
import CategoryFilter from '../components/Help/CategoryFilter';
import FAQAccordion from '../components/Help/FAQAccordion';
import { 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

export default function HelpPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // FAQ categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'tenders', name: 'Tenders & Bidding' },
    { id: 'proposals', name: 'Proposals' },
    { id: 'account', name: 'Account Management' },
    { id: 'billing', name: 'Billing & Payments' },
    { id: 'technical', name: 'Technical Support' }
  ];

  // FAQ data
  const allFaqs = [
    {
      id: 1,
      question: 'How do I create my first proposal?',
      answer: 'To create your first proposal, navigate to a tender that interests you, click on "Draft Proposal", and our AI will generate a starting template based on your company profile and the tender requirements. You can then edit and customize the proposal using our rich text editor.',
      category: 'getting-started',
      tags: ['proposals', 'ai', 'getting-started'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      question: 'What is the AI eligibility check?',
      answer: 'The AI eligibility check analyzes tender requirements against your company profile to determine if you meet the basic qualifications. It checks factors like certifications, experience, financial capacity, and technical capabilities to give you a quick assessment before you invest time in preparing a proposal.',
      category: 'tenders',
      tags: ['ai', 'eligibility', 'tenders'],
      lastUpdated: '2024-01-20'
    },
    {
      id: 3,
      question: 'How does the blockchain reputation system work?',
      answer: 'Every proposal you submit is recorded on the Algorand blockchain, creating an immutable proof of your tender participation. This builds a verifiable reputation that potential clients can trust. The blockchain records include submission timestamps, tender details, and proposal hashes.',
      category: 'proposals',
      tags: ['blockchain', 'reputation', 'algorand'],
      lastUpdated: '2024-01-18'
    },
    {
      id: 4,
      question: 'Can I edit my company profile after registration?',
      answer: 'Yes, you can edit your company profile at any time by going to the Profile section. We recommend keeping your profile up-to-date with current certifications, experience, and contact information to improve your eligibility for tenders.',
      category: 'account',
      tags: ['profile', 'editing', 'account'],
      lastUpdated: '2024-01-12'
    },
    {
      id: 5,
      question: 'What file formats are supported for document uploads?',
      answer: 'We support PDF, DOC, DOCX, JPG, and PNG files up to 10MB each. For compliance documents, we recommend using PDF format for the best compatibility and professional appearance.',
      category: 'technical',
      tags: ['files', 'upload', 'formats'],
      lastUpdated: '2024-01-22'
    },
    {
      id: 6,
      question: 'How do I export my proposals?',
      answer: 'You can export your proposals in multiple formats including PDF, Word document, and plain text. Use the export controls in the proposal editor to choose your preferred format and customize export settings like headers, footers, and page numbers.',
      category: 'proposals',
      tags: ['export', 'pdf', 'word'],
      lastUpdated: '2024-01-25'
    },
    {
      id: 7,
      question: 'Is there a mobile app available?',
      answer: 'Currently, Tenderly is available as a web application that works on all devices including mobile browsers. We are working on dedicated mobile apps for iOS and Android which will be available in Q2 2024.',
      category: 'technical',
      tags: ['mobile', 'app', 'browser'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 8,
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on "Forgot Password" on the login page and enter your email address. You will receive a password reset link via email. Follow the instructions in the email to set a new password.',
      category: 'account',
      tags: ['password', 'reset', 'login'],
      lastUpdated: '2024-01-08'
    },
    {
      id: 9,
      question: 'What happens to my data if I cancel my subscription?',
      answer: 'If you cancel your subscription, your account will remain active until the end of your billing period. After that, your account will be downgraded to a free tier with limited features. Your data will be preserved for 90 days, giving you time to export important information.',
      category: 'billing',
      tags: ['subscription', 'cancellation', 'data'],
      lastUpdated: '2024-01-14'
    },
    {
      id: 10,
      question: 'How accurate is the AI proposal generation?',
      answer: 'Our AI proposal generation uses advanced language models trained on successful tender proposals. While it provides an excellent starting point, we recommend reviewing and customizing the generated content to match your specific approach and company voice. The AI accuracy improves as you provide more detailed company information.',
      category: 'proposals',
      tags: ['ai', 'accuracy', 'generation'],
      lastUpdated: '2024-01-28'
    }
  ];

  // Filter FAQs based on search term and category
  const filteredFaqs = useMemo(() => {
    let filtered = allFaqs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // Calculate item counts for categories
  const itemCounts = useMemo(() => {
    const counts = {};
    categories.forEach(category => {
      if (category.id === 'all') {
        counts[category.id] = allFaqs.length;
      } else {
        counts[category.id] = allFaqs.filter(faq => faq.category === category.id).length;
      }
    });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <QuestionMarkCircleIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        </div>
        <p className="text-gray-600">
          Find answers to common questions and get help with using Tenderly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Search</h3>
              <SearchBox 
                onSearch={setSearchTerm}
                placeholder="Search help articles..."
              />
            </div>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              itemCounts={itemCounts}
            />

            {/* Contact Support */}
            <div className="card">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Need More Help?</h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@tenderly.com"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>support@tenderly.com</span>
                </a>
                <a
                  href="tel:+1-555-0123"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>+1 (555) 012-3456</span>
                </a>
                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary">
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>Live Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'article' : 'articles'} found
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          </div>

          {/* FAQ Accordion */}
          <FAQAccordion faqs={filteredFaqs} searchTerm={searchTerm} />

          {/* Additional Resources */}
          {filteredFaqs.length > 0 && (
            <div className="mt-12 card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/getting-started"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Getting Started Guide</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete walkthrough for new users
                  </p>
                </a>
                <a
                  href="/video-tutorials"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Video Tutorials</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Step-by-step video guides
                  </p>
                </a>
                <a
                  href="/api-docs"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <h4 className="font-medium text-gray-900">API Documentation</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    For developers and integrations
                  </p>
                </a>
                <a
                  href="/community"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Community Forum</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Connect with other users
                  </p>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}