import { KeyboardEvent, useCallback, useState } from 'react';

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

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey && event.key === 'r') {
      setIsDisplayRaw(prevIsDisplayRaw => !prevIsDisplayRaw);
    }
    if (event.ctrlKey && event.key === 'm') {
      setEnableMath(prev => !prev);
    }
  }, []);

  return (
    <MessagePanel
      messageId={message.id}
      onKeyDown={handleKeyDown}
      actions={
        // The usage metadata would be absent for forked conversations with text
        // selections of AI messages
        message.usage_metadata ? <AIMessageInfo message={message} /> : null
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
