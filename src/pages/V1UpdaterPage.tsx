
import React, { useState, useMemo } from 'react';
import * as Cards from 'character-card-utils';
import { parseJsonToV1Card, stringify, V1ValidationResult } from '../utils/cardParser';
import TextBox from '../components/TextBox';
import InvalidJson from '../components/InvalidJson';
import InvalidCard from '../components/InvalidCard';
import CodeBlock from '../components/CodeBlock';
import RelevantLibExports from '../components/RelevantLibExports';

const V1UpdaterPage: React.FC = () => {
  const [input, setInput] = useState('');
  const result = useMemo<V1ValidationResult>(() => parseJsonToV1Card(input), [input]);

  const renderResult = () => {
    switch (result.type) {
      case 'Empty':
        return <div className="p-4 text-gray-500 text-center">Enter a V1 card JSON to update.</div>;
      case 'BackfilledV2':
      case 'V2':
        return (
          <div className="p-4 rounded-lg bg-blue-900/50 border-blue-700 text-blue-300 border">
            <h4 className="font-bold">Already V2</h4>
            The card you've provided is already a V2 card.
          </div>
        );
      case 'V1':
        return (
          <div>
            <p className="text-gray-300">
              Here's the V1 card you've provided, upgraded to V2 format with sensible defaults:
            </p>
            <CodeBlock content={stringify(Cards.v1ToV2(result.data))} />
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
        Update V1 Card to V2
      </h2>
      <RelevantLibExports
        items={[
          ['Cards.v1toV2', 'https://malfoyslastname.github.io/chara-card-utils-docs/functions/v1ToV2.html'],
        ]}
      />
      <TextBox value={input} onChange={setInput} placeholder="Your V1 card JSON here..." />
      <h3 className="text-xl font-semibold mt-6 mb-3 text-cyan-400">Result</h3>
      {renderResult()}
    </div>
  );
};

export default V1UpdaterPage;
