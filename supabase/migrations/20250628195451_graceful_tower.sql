/*
  # Seed tenders table with sample data

  1. Sample Data
    - Insert the existing mock tender data into the tenders table
    - This ensures the application has data to work with immediately
*/

INSERT INTO tenders (id, title, agency, description, category, closing_date, is_new) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Construction of New Government Office Building',
  'Ministry of Public Works',
  'The Ministry of Public Works invites qualified contractors to submit proposals for the construction of a new 5-story government office building. The project includes:

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

The successful contractor must demonstrate expertise in sustainable construction practices and have a proven track record of delivering projects on time and within budget.',
  'Construction',
  '2024-03-15',
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'IT Infrastructure Modernization Project',
  'Department of Digital Services',
  'The Department of Digital Services seeks a qualified IT service provider to modernize the government''s IT infrastructure. This comprehensive project includes:

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

The project timeline is 12 months for implementation with ongoing support. Proposals must include detailed technical specifications, project timeline, and cost breakdown.',
  'IT Services',
  '2024-02-28',
  false
),
(
  '00000000-0000-0000-0000-000000000003',
  'Healthcare Equipment Supply and Maintenance',
  'Ministry of Health',
  'The Ministry of Health requires a comprehensive healthcare equipment supply and maintenance contract for regional hospitals. The scope includes:

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

The contract period is 5 years with annual performance reviews.',
  'Healthcare',
  '2024-04-10',
  true
);