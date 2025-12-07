
import React from 'react';
import * as Cards from 'character-card-utils';
import { stringify } from '../utils/cardParser';
import CodeBlock from '../components/CodeBlock';

const v1Card: Cards.V1 = {
  name: 'Sui the card test',
  first_mes: "Hi! I'm Sui.",
  scenario: 'Sui tells a nice story',
  description: '{{char}} is very happy.',
  personality: '',
  mes_example: "{{user}}: You're cool.\\n{{char}}: Thanks!",
};

const v2CardNoCharacterBook: Cards.V2 = {
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: 'Sui the card test',
    first_mes: "Hi! I'm Sui.",
    scenario: 'Sui tells a nice story',
    description: '{{char}} is very happy.',
    personality: '',
    mes_example: "{{user}}: You're cool.\\n{{char}}: Thanks!",
    creator_notes: 'Sui is nice',
    system_prompt: "Enter roleplay mode. Write {{char}}'s next reply.",
    post_history_instructions: 'Your reply must end with "desu".',
    alternate_greetings: ["Hey, what's up?", 'Hey there.'],
    tags: ['female', 'nice'],
    creator: 'malfoy',
    character_version: '1',
    extensions: {},
  },
};

const v2Card: Cards.V2 = {
  ...v2CardNoCharacterBook,
  data: {
    ...v2CardNoCharacterBook.data,
    character_book: {
      name: 'the dummy book',
      description: 'dummy book',
      entries: [
        {
          keys: ['dummy'],
          content: 'this is a dummy entry',
          extensions: {},
          enabled: false,
          insertion_order: 0,
          name: 'dummy',
          priority: 0,
        },
      ],
      extensions: {},
    },
  },
};

const v2CardWithExtensions: Cards.V2 = {
  ...v2CardNoCharacterBook,
  data: {
    ...v2CardNoCharacterBook.data,
    extensions: {
      agnai: {
        authorNote: 'Your message must have a happy tone.',
      },
      someOtherExtension: {
        someKey: 123,
        anotherKey: true,
      }
    },
  },
};

const ExamplesPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2 text-cyan-300">
        Example Valid Cards
      </h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Valid V1 Card</h3>
          <CodeBlock content={stringify(v1Card)} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Valid V2 Card</h3>
          <CodeBlock content={stringify(v2Card)} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Valid V2 Card (No Character Book)</h3>
          <CodeBlock content={stringify(v2CardNoCharacterBook)} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Valid V2 Card (V1 Fields Backfilled)</h3>
          <CodeBlock content={stringify(Cards.backfillV2(v2CardNoCharacterBook))} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Valid V2 Card (Backfilled w/ Obsolescence Notice)</h3>
          <CodeBlock content={stringify(Cards.backfillV2WithObsolescenceNotice(v2CardNoCharacterBook))} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-2">Valid V2 Card (with Extensions)</h3>
          <CodeBlock content={stringify(v2CardWithExtensions)} />
        </div>
      </div>
    </div>
  );
};

export default ExamplesPage;
