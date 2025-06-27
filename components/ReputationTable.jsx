// components/ReputationTable.jsx
// This component displays a table of blockchain attestations (proofs) for submitted proposals
// It shows the tender details, submission date, and blockchain transaction ID

import { ExternalLinkIcon } from '@heroicons/react/24/outline';

export default function ReputationTable({ attestations }) {
  // Show a message if there are no attestations yet
  if (!attestations || attestations.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No blockchain proofs yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Submit your first proposal to start building your reputation.
        </p>
      </div>
    );
  }

  // Render the table of attestations
  return (
    <div className="card overflow-hidden">
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    On-chain
                  </span>
                </td>
                {/* Blockchain transaction link */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={`https://testnet.algoexplorer.io/tx/${attestation.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:text-blue-700"
                  >
                    <span className="font-mono text-xs">
                      {attestation.txId.substring(0, 8)}...{attestation.txId.substring(-8)}
                    </span>
                    <ExternalLinkIcon className="h-3 w-3 ml-1" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}