import classNames from 'classnames';
import { ReactNode } from 'react';

import { useAssistantStore } from '../../../../../stores/assistantStore';
import MessageActions from '../actions/MessageActions';

interface MessagePanelProps {
  children?: ReactNode;
  className?: string;
  messageId: string;
  actions?: ReactNode;
}

export default function MessagePanel({
  children,
  className = '',
  messageId,
  actions,
}: MessagePanelProps) {
  const isProcessing = useAssistantStore(state => state.isProcessing);

  return (
    <div className={classNames('flex min-w-24 flex-col gap-2', className)}>
      {children}
      <MessageActions
        messageId={messageId}
        actions={actions}
        disabled={isProcessing}
      />
    </div>
  );
}
