// pages/api/versions/[id].js
// This API endpoint provides version history for a proposal
// In a real app, this would fetch actual version history from a database

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Get proposal ID from the URL

  // Mock version data - in a real app this would come from database
  const mockVersions = [
    {
      id: 1,
      version: 1,
      content: "Initial proposal draft...",
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 2,
      version: 2,
      content: "Updated proposal with revised timeline...",
      createdAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
    }
  ];

  // Return mock version history
  res.status(200).json(mockVersions);
}