import { InformationCircleIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';

import {
  AIMessageMetadata,
  Message,
} from '../../../../../services/assistantService';

interface AIMessageInfoProps {
  message: Message;
}

export default function AIMessageInfo({ message }: AIMessageInfoProps) {
  const usageMetadata = message.usage_metadata;
  const { cost, invocation_time, creation_time, latency } =
    message.additional_kwargs as AIMessageMetadata;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <InformationCircleIcon
        className="h-4 w-4 cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="absolute bottom-full left-2 whitespace-nowrap border bg-[var(--bg-color)] p-2 text-xs">
          <div className="flex gap-4">
            {usageMetadata && (
              <div>
                <div className="font-semibold">Usage</div>
                {usageMetadata.input_token_details?.cache_read ? (
                  <div>
                    Cache R: {usageMetadata.input_token_details.cache_read}
                  </div>
                ) : null}
                {usageMetadata.input_token_details?.cache_creation ? (
                  <div>
                    Cache W: {usageMetadata.input_token_details.cache_creation}
                  </div>
                ) : null}
                <div>In: {usageMetadata.input_tokens}</div>
                <div>Out: {usageMetadata.output_tokens}</div>
                {usageMetadata.output_token_details?.reasoning ? (
                  <div>
                    Reasoning: {usageMetadata.output_token_details.reasoning}
                  </div>
                ) : null}
              </div>
            )}
            {cost && (
              <div>
                <div className="font-semibold">Cost (¢)</div>
                {cost.cache_read > 0 && (
                  <div>Cache R: {(cost.cache_read * 100).toFixed(2)}</div>
                )}
                {cost.cache_write > 0 && (
                  <div>Cache W: {(cost.cache_write * 100).toFixed(2)}</div>
                )}
                <div>In: {(cost.input * 100).toFixed(2)}</div>
                <div>Out: {(cost.output * 100).toFixed(2)}</div>
                <div>Total: {(cost.total * 100).toFixed(2)}</div>
              </div>
            )}
            <div>
              <div className="font-semibold">Perf</div>
              <div>Inv: {new Date(invocation_time).toLocaleTimeString()}</div>
              <div>Created: {new Date(creation_time).toLocaleTimeString()}</div>
              <div>Latency: {latency.toFixed(2)}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
