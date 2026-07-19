import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import md5 from 'md5';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import 'katex/dist/katex.min.css';

interface MarkdownViewProps {
  content: string;
  enableMath?: boolean;
}

export default function MarkdownView({
  content,
  enableMath = false,
}: MarkdownViewProps) {
  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <ReactMarkdown
      key={md5(content ?? 'empty')}
      className="markdown"
      remarkPlugins={[remarkGfm, ...(enableMath ? [remarkMath] : [])]}
      rehypePlugins={[rehypeRaw, ...(enableMath ? [rehypeKatex] : [])]}
      components={{
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children);

          return match ? (
            <div className="relative">
              <button
                onClick={() => handleCopy(code)}
                className="neu-up absolute right-1 top-1 rounded-lg p-2"
              >
                <ClipboardDocumentIcon className={`size-4`} />
              </button>
              <SyntaxHighlighter language={match[1]} style={vscDarkPlus}>
                {code}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
