// lib/store.js
// This file serves as a simple in-memory data store for development purposes
// In a production environment, this would be replaced with a proper database like Supabase

// Sample tender data - these are mock government tenders used throughout the application
const tenders = [
  {
    id: '1',
    title: 'Construction of New Government Office Building',
    agency: 'Ministry of Public Works',
    description: `The Ministry of Public Works invites qualified contractors to submit proposals for the construction of a new 5-story government office building. The project includes:

- Total floor area: 15,000 square meters
- Modern office spaces with open floor plans
- Energy-efficient HVAC systems
- Sustainable building materials and green building certification
- Underground parking for 200 vehicles
- Advanced security systems and access controls
- Completion timeline: 18 months from contract award

Requirements:
- Minimum 10 years experience in commercial construction
- ISO 9001:2015 Quality Management certification
- Previous experience with government projects
- Financial capacity of at least $5 million
- Valid contractor license Grade A
- Safety certification (OHSAS 18001 or equivalent)

The successful contractor must demonstrate expertise in sustainable construction practices and have a proven track record of delivering projects on time and within budget.`,
    category: 'Construction',
    closingDate: '2024-03-15',
    isNew: true
  },
  {
    id: '2',
    title: 'IT Infrastructure Modernization Project',
    agency: 'Department of Digital Services',
    description: `The Department of Digital Services seeks a qualified IT service provider to modernize the government's IT infrastructure. This comprehensive project includes:

- Migration to cloud-based systems (AWS/Azure)
- Implementation of cybersecurity frameworks
- Network infrastructure upgrades
- Data center consolidation
- Staff training and knowledge transfer
- 24/7 technical support for 3 years

Technical Requirements:
- Cloud architecture certification (AWS/Azure)
- ISO 27001 Information Security certification
- Minimum 5 years experience in large-scale IT projects
- Proven expertise in government sector IT solutions
- Local presence with certified technical staff

The project timeline is 12 months for implementation with ongoing support. Proposals must include detailed technical specifications, project timeline, and cost breakdown.`,
    category: 'IT Services',
    closingDate: '2024-02-28',
    isNew: false
  },
  {
    id: '3',
    title: 'Healthcare Equipment Supply and Maintenance',
    agency: 'Ministry of Health',
    description: `The Ministry of Health requires a comprehensive healthcare equipment supply and maintenance contract for regional hospitals. The scope includes:

- Supply of medical diagnostic equipment
- Installation and commissioning
- Preventive maintenance programs
- Emergency repair services
- Staff training on equipment operation
- Spare parts supply for 5 years

Equipment Categories:
- X-ray and imaging systems
- Laboratory diagnostic equipment
- Patient monitoring systems
- Surgical instruments and tools
- Emergency medical equipment

Requirements:
- Medical device distributor license
- ISO 13485 Medical Device Quality certification
- Minimum 7 years experience in healthcare sector
- Local service center and certified technicians
- 24/7 emergency support capability
- Compliance with medical device regulations

The contract period is 5 years with annual performance reviews.`,
    category: 'Healthcare',
    closingDate: '2024-04-10',
    isNew: true
  }
];

// Sample company profile - represents the user's company information
let companyProfile = {
  name: 'TechBuild Solutions Sdn Bhd',
  registrationNumber: 'ROC-12345678',
  certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'OHSAS 18001'],
  experience: 'TechBuild Solutions is a leading construction and technology company with over 12 years of experience in delivering complex infrastructure projects. We have successfully completed more than 50 government and private sector projects, including office buildings, data centers, and smart city initiatives. Our expertise spans sustainable construction, IT infrastructure, and project management. We maintain a team of 150+ certified professionals and have established partnerships with leading technology providers.',
  contactEmail: 'info@techbuild.com.my',
  contactPhone: '+60-3-1234-5678',
  address: 'Level 15, Menara TechBuild, Jalan Ampang, 50450 Kuala Lumpur, Malaysia'
};

// In-memory proposals storage - stores proposal drafts created by users
let proposals = [];
let proposalIdCounter = 1; // Used to generate unique IDs for new proposals

// Tender functions - these functions allow access to the tender data
// Get a specific tender by its ID
export function getTenderById(id) {
  return tenders.find(tender => tender.id === String(id));
}

// Get all available tenders
export function getAllTenders() {
  return tenders;
}

// Company profile functions - these functions manage the user's company profile
// Get the current company profile
export function getCompanyProfile() {
  return companyProfile;
}

// Update the company profile with new information
export function updateCompanyProfile(updates) {
  companyProfile = { ...companyProfile, ...updates };
  return companyProfile;
}

// Proposal functions - these functions manage proposal drafts
// Create a new proposal for a specific tender
export function createProposal(tender, content) {
  const id = proposalIdCounter++;
  const proposal = {
    id,
    tenderId: tender.id,
    tenderTitle: tender.title,
    content,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };
  proposals.push(proposal);
  return id;
}

// Get a specific proposal by its ID
export function getProposalById(id) {
  return proposals.find(proposal => proposal.id === Number(id));
}

// Update an existing proposal with new content or status
export function updateProposal(id, updates) {
  const index = proposals.findIndex(proposal => proposal.id === Number(id));
  if (index !== -1) {
    proposals[index] = { 
      ...proposals[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return proposals[index];
  }
  return null;
}

// Get all proposals
export function getAllProposals() {
  return proposals;
}

// Mock attestations for reputation system - simulates blockchain records of submitted proposals
export function getAttestations() {
  return [
    {
      id: 1,
      tenderTitle: 'Smart City Infrastructure Project',
      agency: 'Kuala Lumpur City Council',
      submittedAt: '2024-01-15T10:30:00Z',
      txId: 'ALGO123456789ABCDEF', // Mock blockchain transaction ID
      status: 'submitted'
    },
    {
      id: 2,
      tenderTitle: 'Digital Government Services Platform',
      agency: 'Malaysia Digital Economy Corporation',
      submittedAt: '2024-01-08T14:20:00Z',
      txId: 'ALGO987654321FEDCBA', // Mock blockchain transaction ID
      status: 'submitted'
    }
  ];
}