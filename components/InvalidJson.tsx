
import React from 'react';
import CodeBlock from './CodeBlock';

interface InvalidJsonProps {
  err: any;
}

const InvalidJson: React.FC<InvalidJsonProps> = ({ err }) => (
  <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
    <h4 className="font-bold mb-2">Invalid JSON Provided</h4>
    <CodeBlock content={err.toString()} />
  </div>
);

export default InvalidJson;
