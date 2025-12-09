
import React, { useState, useMemo } from 'react';
import { parseJsonToV2Card, V2ValidationResult } from '../utils/cardParser';
import TextBox from '../components/TextBox';
import InvalidJson from '../components/InvalidJson';
import InvalidCard from '../components/InvalidCard';
import RelevantLibExports from '../components/RelevantLibExports';

const ValidatorPage: React.FC = () => {
  const [input, setInput] = useState('');
  const result = useMemo<V2ValidationResult>(() => parseJsonToV2Card(input), [input]);

  const renderResult = () => {
    switch (result.type) {
      case 'Empty':
        return <div className="p-4 text-gray-500 text-center">Enter a V2 card JSON to validate.</div>;
      case 'BackfilledV2':
        return (
          <div className={`p-4 rounded-lg ${result.inSync ? 'bg-green-900/50 border-green-700 text-green-300' : 'bg-yellow-900/50 border-yellow-700 text-yellow-300'} border`}>
            <h4 className="font-bold">Valid V2 Card (with V1 Fields)</h4>
            <p>{result.inSync
              ? 'The V1 fields are properly backfilled and in-sync with their V2 counterparts.'
              : 'CAUTION: The backfilled V1 fields differ from the equivalent V2 fields.'}</p>
          </div>
        );
      case 'V2':
        return (
          <div className="p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
            <h4 className="font-bold">Valid V2 Card</h4>
            <p>The card adheres to the V2 specification.</p>
          </div>
        );
      case 'InvalidJson':
        return <InvalidJson err={result.error} />;
      case 'InvalidCard':
        return <InvalidCard zodErr={result.error} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2 text-cyan-300">
        V2 Validator
      </h2>
      <RelevantLibExports
        items={[
          ['Cards.v2 (to parse/validate V2 cards)', 'https://malfoyslastname.github.io/chara-card-utils-docs/variables/v2-1.html'],
          ['Cards.parseToV2 (parse V1/V2, auto-convert V1)', 'https://malfoyslastname.github.io/chara-card-utils-docs/functions/parseToV2.html'],
          ['Cards.safeParseToV2 (exception-free alternative)', 'https://malfoyslastname.github.io/chara-card-utils-docs/functions/safeParseToV2.html'],
        ]}
      />
      <TextBox value={input} onChange={setInput} placeholder="Your V2 card JSON here..." />
      <h3 className="text-xl font-semibold mt-6 mb-3 text-cyan-400">Result</h3>
      {renderResult()}
    </div>
  );
};

export default ValidatorPage;
