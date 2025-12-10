
import React from 'react';

interface CodeBlockProps {
  content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content }) => {
  return (
    <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-green-300 border border-gray-700 mt-2">
      <code>{content}</code>
    </pre>
  );
};

export default CodeBlock;
