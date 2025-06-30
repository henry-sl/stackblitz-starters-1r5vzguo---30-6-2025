# Tenderly - AI-Powered Tender Management Platform

Tenderly is a comprehensive platform that helps businesses discover, analyze, and win government and private sector tenders using artificial intelligence. The platform is designed to level the playing field for public procurement, making the tendering process more accessible and transparent.

## Features

### 🔍 Intelligent Opportunity Discovery
- AI-curated tender feeds from official portals
- Personalized matching based on your company profile
- Real-time notifications for new opportunities

### 📄 Document Analysis & Summary
- Instant extraction of deadlines, eligibility criteria, and key requirements
- AI-generated summaries of lengthy tender documents
- Translation between English and Bahasa Malaysia

### ✅ Compliance Assistant
- Automatic eligibility checking against tender requirements
- Company profile matching with tender criteria
- Compliance verification before submission

### ✨ Smart Proposal Generator
- AI-powered proposal drafting based on tender requirements
- Customizable templates and sections
- Version history and collaborative editing

### 🔒 Blockchain Attestation
- Immutable proof of submission on Algorand blockchain
- Transparent reputation building
- Verifiable track record for clients

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Supabase account for database and authentication
- Algorand wallet for blockchain attestations (optional)

### Environment Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in the required values:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI API Key (optional)
OPENAI_API_KEY=your-openai-api-key

# Lingo.dev API Key (optional, for translation)
LINGODEV_API_KEY=your-lingodev-api-key

# Algorand Configuration
ALGOLAND_API_TOKEN=""
ALGOLAND_ALGOD_URL=https://testnet-api.algonode.cloud
ALGOLAND_INDEXER_URL=https://testnet-idx.algonode.cloud

# Admin Wallet for Blockchain Attestations
# Generate using: node scripts/generate-admin-wallet.js
ADMIN_WALLET_MNEMONIC=your-admin-wallet-mnemonic
```

3. Install dependencies:

```bash
npm install
```

4. Set up the database:
   - Connect to your Supabase project
   - The migrations in `supabase/migrations` will be applied automatically

5. Start the development server:

```bash
npm run dev
```

### Blockchain Setup (Optional)

For blockchain attestation functionality:

1. Generate an admin wallet:

```bash
node scripts/generate-admin-wallet.js
```

2. Add the generated mnemonic to your `.env.local` file
3. Fund the wallet with Algorand testnet tokens from [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)
4. Verify the wallet address:

```bash
node scripts/get-admin-address.js
```

## Project Structure

- `/components` - React components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and API clients
- `/pages` - Next.js pages and API routes
- `/public` - Static assets
- `/styles` - Global CSS and Tailwind configuration
- `/supabase` - Supabase migrations and configuration

## Key Components

### Company Profile
The company profile is central to Tenderly's functionality. It stores your:
- Basic company information
- Certifications and licenses
- Experience and past projects
- Team composition and key personnel
- Preferences for tender categories and locations

Complete your profile to improve tender matching and eligibility scoring.

### Tender Discovery
Browse available tenders with AI-powered eligibility scoring based on your company profile. Filter by category, location, and other criteria.

### Proposal Editor
Create and edit proposals with:
- AI-assisted content generation
- Version history
- Translation tools
- Collaborative editing
- Export to multiple formats

### Blockchain Attestation
Submit proposals with blockchain attestation to build a verifiable reputation:
- Each submission is recorded on the Algorand blockchain
- Creates an immutable proof of your tender participation
- Builds a transparent track record for potential clients

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **AI**: OpenAI API
- **Translation**: Lingo.dev API
- **Blockchain**: Algorand

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Deployment

```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built during the Bolt Hackathon 2025
- Powered by Claude Sonnet 4 from Anthropic