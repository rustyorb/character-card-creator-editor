
import React, { useState, useMemo } from 'react';
import * as Cards from 'character-card-utils';
import { parseJsonToV2Card, stringify, V2ValidationResult } from '../utils/cardParser';
import TextBox from '../components/TextBox';
import InvalidJson from '../components/InvalidJson';
import InvalidCard from '../components/InvalidCard';
import CodeBlock from '../components/CodeBlock';
import RelevantLibExports from '../components/RelevantLibExports';

interface BackfillerPageProps {
  withObsolescenceNotice: boolean;
}

const BackfillerPage: React.FC<BackfillerPageProps> = ({ withObsolescenceNotice }) => {
  const [input, setInput] = useState('');
  const result = useMemo<V2ValidationResult>(() => parseJsonToV2Card(input), [input]);

  const title = `Backfill V1 Fields in V2 Card ${withObsolescenceNotice ? 'with Obsolescence Notice' : ''}`;
  
  const renderResult = () => {
    switch (result.type) {
      case 'Empty':
        return <div className="p-4 text-gray-500 text-center">Enter a V2 card JSON to backfill.</div>;
      case 'BackfilledV2': {
        if (result.inSync && !withObsolescenceNotice) {
          return (
            <div className="p-4 rounded-lg bg-blue-900/50 border-blue-700 text-blue-300 border">
                <h4 className="font-bold">Already Backfilled</h4>
                This V2 card already has V1 fields backfilled in a backward-compatible way.
            </div>
          );
        }
        const backfilledCard = withObsolescenceNotice
          ? Cards.backfillV2WithObsolescenceNotice(result.data)
          : Cards.backfillV2(result.data);
        return (
          <div>
            <p className="text-gray-300">
              {withObsolescenceNotice
                ? 'This V2 card had V1 fields properly backfilled. Here is the version with an obsolescence notice:'
                : 'Here is the V2 card you supplied, with V1 fields re-backfilled to ensure sync:'
              }
            </p>
            <CodeBlock content={stringify(backfilledCard)} />
          </div>
        );
      }
      case 'V2': {
        const backfilledCard = withObsolescenceNotice
          ? Cards.backfillV2WithObsolescenceNotice(result.data)
          : Cards.backfillV2(result.data);
        return (
          <div>
            <p className="text-gray-300">
              Here is the card you provided with V1 fields backfilled {withObsolescenceNotice ? 'with an obsolescence notice' : 'with their equivalent V2 fields'}:
            </p>
            <CodeBlock content={stringify(backfilledCard)} />
          </div>
        );
      }
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
        {title}
      </h2>
      <RelevantLibExports
        items={[
          withObsolescenceNotice
            ? ['Cards.backfillV2WithObsolescenceNotice', 'https://malfoyslastname.github.io/chara-card-utils-docs/functions/backfillV2WithObsolescenceNotice.html']
            : ['Cards.backfillV2', 'https://malfoyslastname.github.io/chara-card-utils-docs/functions/backfillV2.html'],
        ]}
      />
      <TextBox value={input} onChange={setInput} placeholder="Your V2 card JSON here..." />
      <h3 className="text-xl font-semibold mt-6 mb-3 text-cyan-400">Result</h3>
      {renderResult()}
    </div>
  );
};

export default BackfillerPage;
