
import React from 'react';
import { stringify } from '../utils/cardParser';
import CodeBlock from './CodeBlock';

interface InvalidCardProps {
  zodErr: any;
}

const InvalidCard: React.FC<InvalidCardProps> = ({ zodErr }) => (
  <div className="p-4 bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-lg">
    <h4 className="font-bold mb-2">Valid JSON, but Invalid Card Schema</h4>
    <p className="mb-2 text-sm">The provided JSON does not match the required character card format. See errors below:</p>
    <CodeBlock content={stringify(zodErr)} />
  </div>
);

export default InvalidCard;
