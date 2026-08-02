import {
  CalculatorIcon,
  EyeIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import { CalculatorIcon as SolidCalculatorIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import AIMessageInfo from './AIMessageInfo';
import { Message } from '../../../../../services/assistantService';
import Content from '../displaypanel/Content';
import MessagePanel from '../displaypanel/MessagePanel';
import ReasoningContent from '../displaypanel/ReasoningContent';

interface AIMessageProps {
  message: Message;
}

export default function AIMessage({ message }: AIMessageProps) {
  const content = message.content;
  const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(true);
  const [isDisplayRaw, setIsDisplayRaw] = useState(false);
  const [enableMath, setEnableMath] = useState(false);

  return (
    <MessagePanel
      messageId={message.id}
      actions={
        // The usage metadata would be absent for forked conversations with text
        // selections of AI messages
        <>
          {message.usage_metadata ? <AIMessageInfo message={message} /> : null}
          {isDisplayRaw ? (
            <EyeIcon
              className="size-4 hover:cursor-pointer"
              onClick={() => setIsDisplayRaw(false)}
            />
          ) : (
            <HashtagIcon
              className="size-4 hover:cursor-pointer"
              onClick={() => setIsDisplayRaw(true)}
            />
          )}
          {enableMath ? (
            <SolidCalculatorIcon
              className="size-4 hover:cursor-pointer"
              onClick={() => setEnableMath(false)}
            />
          ) : (
            <CalculatorIcon
              className="size-4 hover:cursor-pointer"
              onClick={() => setEnableMath(true)}
            />
          )}
        </>
      }
    >
      {content.thinking && (
        <ReasoningContent
          reasoningContent={content.thinking}
          isCollapsed={isThinkingCollapsed}
          onToggle={() => setIsThinkingCollapsed(!isThinkingCollapsed)}
          isDisplayRaw={isDisplayRaw}
        />
      )}
      {content.text && (
        <Content
          content={content.text}
          isDisplayRaw={isDisplayRaw}
          enableMath={enableMath}
        />
      )}
    </MessagePanel>
  );
}
