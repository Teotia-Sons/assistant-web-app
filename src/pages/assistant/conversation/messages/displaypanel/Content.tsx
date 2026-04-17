import React, { useEffect, useMemo, useState } from 'react';

import MarkdownView from './MarkdownView';
import RawTextView from './RawTextView';
import { GroundingMetadata } from '../../../../../services/genaiService';

interface ContentProps {
  content: string;
  isDisplayRaw: boolean;
  enableMath?: boolean;
  groundingMetadata?: GroundingMetadata;
}

function processContentWithGrounding(
  content: string,
  groundingMetadata: GroundingMetadata,
): string {
  let processedContent = content;

  for (const support of groundingMetadata.grounding_supports) {
    const concatenatedLinks = support.chunk_indices
      .map(idx => {
        const chunk = groundingMetadata.grounding_chunks[idx];
        return `<a href="${chunk.uri}">${idx + 1}</a>`;
      })
      .join(', ');

    processedContent = processedContent.replace(
      support.segment_text,
      `${support.segment_text} <sup>[${concatenatedLinks}]</sup>`,
    );
  }

  if (groundingMetadata.web_search_queries?.length > 0) {
    processedContent += '\n\n---\n\n###### Search Queries\n';
    groundingMetadata.web_search_queries.forEach(query => {
      processedContent += `- *${query}*\n`;
    });
  }

  if (groundingMetadata.grounding_chunks?.length > 0) {
    processedContent += '\n###### Sources\n\n';
    groundingMetadata.grounding_chunks.forEach((chunk, index) => {
      processedContent += `${index + 1}. [${chunk.title}](${chunk.uri})\n`;
    });
  }

  return processedContent;
}

export default function Content({
  content,
  isDisplayRaw,
  enableMath,
  groundingMetadata,
}: ContentProps) {
  const [showReferences, setShowReferences] = useState(false);

  useEffect(() => {
    if (groundingMetadata) setShowReferences(true);
  }, [groundingMetadata]);

  const processedContent = useMemo(
    () =>
      showReferences
        ? processContentWithGrounding(content, groundingMetadata!)
        : content,
    [content, groundingMetadata, showReferences],
  );

  return (
    <div className={'flex flex-col gap-1'}>
      {groundingMetadata && (
        <div className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            id="show-references"
            checked={showReferences}
            onChange={e => setShowReferences(e.target.checked)}
          />
          <label htmlFor="show-references">Show references</label>
        </div>
      )}
      {isDisplayRaw ? (
        <RawTextView content={processedContent} />
      ) : (
        <MarkdownView content={processedContent} enableMath={enableMath} />
      )}
    </div>
  );
}
