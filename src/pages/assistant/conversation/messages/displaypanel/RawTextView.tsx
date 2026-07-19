import React from 'react';

interface RawDisplayPanelProps {
  content: string;
}

export default function RawTextView({ content }: RawDisplayPanelProps) {
  return <pre className="w-full text-wrap">{content}</pre>;
}
