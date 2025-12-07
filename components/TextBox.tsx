
import React from 'react';

interface TextBoxProps {
  value: string;
  placeholder?: string;
  onChange: (s: string) => void;
  heightClass?: string;
}

const TextBox: React.FC<TextBoxProps> = ({
  value,
  placeholder,
  onChange,
  heightClass = 'min-h-[300px]',
}) => (
  <textarea
    className={`w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 resize-y ${heightClass} font-mono text-sm`}
    value={value}
    placeholder={placeholder}
    onChange={(ev) => onChange(ev.target.value)}
    spellCheck="false"
  />
);

export default TextBox;
