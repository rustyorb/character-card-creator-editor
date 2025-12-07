
import React from 'react';

interface RelevantLibExportsProps {
  items: [string, string][];
}

const RelevantLibExports: React.FC<RelevantLibExportsProps> = ({ items }) => (
  <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
    <h4 className="font-semibold text-gray-300 mb-2">Relevant library exports:</h4>
    <ul className="list-disc list-inside space-y-1">
      {items.map(([label, link], i) => (
        <li key={i}>
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">
            {label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default RelevantLibExports;
