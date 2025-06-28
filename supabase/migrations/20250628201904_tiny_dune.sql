/*
  # Seed Data for Tenderly Application

  1. Sample Tenders
    - Add realistic tender opportunities for testing
    - Include various categories and locations

  2. Sample Data
    - Government and private sector tenders
    - Different budget ranges and requirements
*/

-- Insert sample tenders
INSERT INTO tenders (
  title,
  description,
  agency,
  category,
  location,
  budget,
  closing_date,
  tender_id,
  requirements,
  status,
  tags,
  is_featured
) VALUES
(
  'Road Maintenance and Repair Services - Kuala Lumpur District',
  'Comprehensive road maintenance including pothole repairs, resurfacing, and drainage improvements across major roads in KL district. The project involves maintaining arterial roads, improving traffic flow, and ensuring road safety standards.',
  'Kuala Lumpur City Hall (DBKL)',
  'Construction',
  'Kuala Lumpur',
  'RM 2,500,000',
  (now() + interval '30 days'),
  'DBKL/2025/ROAD/001',
  ARRAY['CIDB Grade G4 or above', 'Minimum 5 years experience', 'Valid contractor license', 'Safety certification'],
  'active',
  ARRAY['Road Works', 'Maintenance', 'Urban'],
  true
),
(
  'IT Infrastructure Upgrade for Government Buildings',
  'Network infrastructure modernization including server upgrades, security systems, and cloud migration services for government facilities in Putrajaya.',
  'Ministry of Digital Development',
  'Information Technology',
  'Putrajaya',
  'RM 1,800,000',
  (now() + interval '25 days'),
  'MDD/2025/IT/002',
  ARRAY['MSC Status preferred', 'ISO 27001 certification', 'Minimum 3 years experience', 'Cloud expertise'],
  'active',
  ARRAY['IT', 'Cloud', 'Security'],
  false
),
(
  'School Building Construction - Selangor',
  'Construction of new primary school building with modern facilities, including classrooms, library, sports facilities, and administrative areas.',
  'Ministry of Education',
  'Construction',
  'Selangor',
  'RM 8,500,000',
  (now() + interval '45 days'),
  'MOE/2025/BUILD/003',
  ARRAY['CIDB Grade G6 or above', 'Minimum 10 years experience', 'Previous school construction experience', 'Green building certification'],
  'active',
  ARRAY['Construction', 'Education', 'New Build'],
  true
),
(
  'Waste Management System Implementation',
  'Implementation of smart waste management system including IoT sensors, collection optimization, recycling programs, and data analytics platform.',
  'Selangor State Government',
  'Environmental',
  'Shah Alam',
  'RM 3,200,000',
  (now() + interval '20 days'),
  'SSG/2025/ENV/004',
  ARRAY['Environmental certification', 'IoT experience', 'Waste management expertise', 'Data analytics capability'],
  'active',
  ARRAY['Environment', 'IoT', 'Smart City'],
  false
),
(
  'Healthcare Equipment Supply and Maintenance',
  'Supply and maintenance of medical equipment for regional hospitals including diagnostic equipment, patient monitoring systems, and emergency medical devices.',
  'Ministry of Health',
  'Healthcare',
  'Kuala Lumpur',
  'RM 5,800,000',
  (now() + interval '35 days'),
  'MOH/2025/MED/005',
  ARRAY['Medical device certification', 'ISO 13485 certification', 'Minimum 7 years healthcare experience', '24/7 support capability'],
  'active',
  ARRAY['Healthcare', 'Medical Equipment', 'Maintenance'],
  true
);