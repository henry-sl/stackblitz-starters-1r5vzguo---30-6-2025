// components/ReputationTable.jsx
// This component displays a table of blockchain attestations (proofs) for submitted proposals
// It shows the tender details, submission date, and blockchain transaction ID

import { ExternalLink } from 'lucide-react';
import { Shield } from 'lucide-react';

export default function ReputationTable({ attestations }) {
  // Show a message if there are no attestations yet
  if (!attestations || attestations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
        <p className="text-gray-600 mb-4">
          Start submitting proposals to build your blockchain-verified reputation.
        </p>
      </div>
    );
  }

  // Render the table of attestations
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tender
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attestations.map((attestation) => (
            <tr key={attestation.id} className="hover:bg-gray-50">
              {/* Tender information */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {attestation.tenderTitle}
                </div>
                <div className="text-sm text-gray-500">
                  {attestation.agency}
                </div>
              </td>
              {/* Submission date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(attestation.submittedAt).toLocaleDateString()}
              </td>
              {/* Status badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  attestation.status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : attestation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {attestation.status === 'verified' 
                    ? 'Verified On-chain' 
                    : attestation.status === 'pending'
                    ? 'Pending Verification'
                    : 'On-chain'}
                </span>
              </td>
              {/* Blockchain transaction link */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a
                  href={attestation.explorerUrl || `https://testnet.algoexplorer.io/tx/${attestation.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:text-blue-700"
                >
                  <span className="font-mono text-xs">
                    {attestation.txId.substring(0, 8)}...{attestation.txId.substring(attestation.txId.length - 8)}
                  </span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}