import classNames from 'classnames';
import { KeyboardEvent, ReactNode, useCallback } from 'react';

import { useAssistantStore } from '../../../../../stores/assistantStore';
import MessageActions from '../actions/MessageActions';
import { useMessageActions } from '../hooks/useMessageActions';

interface MessagePanelProps {
  children?: ReactNode;
  className?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  messageId: string;
  actions?: ReactNode;
}

export default function MessagePanel({
  children,
  className = '',
  onKeyDown,
  messageId,
  actions,
}: MessagePanelProps) {
  const isProcessing = useAssistantStore(state => state.isProcessing);
  const { handleFork } = useMessageActions(messageId);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        return handleFork();
      }
      onKeyDown?.(event);
    },
    [handleFork, onKeyDown],
  );

  return (
    <div
      className={classNames(
        'flex min-w-24 flex-col gap-2 px-4 py-2',
        className,
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {children}
      <MessageActions
        messageId={messageId}
        actions={actions}
        disabled={isProcessing}
      />
    </div>
  );
}
