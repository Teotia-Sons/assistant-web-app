import { PencilIcon } from '@heroicons/react/24/outline';
import classnames from 'classnames';
import { useState } from 'react';

import { Message } from '../../../../../services/assistantService';
import { useAssistantStore } from '../../../../../stores/assistantStore';
import EditMessage from '../actions/EditMessage';
import MarkdownView from '../displaypanel/MarkdownView';
import MessagePanel from '../displaypanel/MessagePanel';

interface HumanMessageProps {
  message: Message;
}

export default function HumanMessage({ message }: HumanMessageProps) {
  const { conversation, isProcessing } = useAssistantStore();
  const text = message.content.text;
  const messageId = message.id;

  const [isEditing, setIsEditing] = useState(false);
  const handleEdit = () => setIsEditing(true);
  const handleEscape = () => setIsEditing(false);
  const onEdit = () => !isProcessing && handleEdit();

  if (isEditing) {
    return (
      <EditMessage
        text={text}
        messageId={messageId}
        conversationId={conversation!.id}
        onEscape={handleEscape}
        className={'w-[80%] self-end'}
      />
    );
  }

  return (
    <MessagePanel
      messageId={messageId}
      className="neu-up max-w-[80%] self-end"
      actions={
        <PencilIcon
          className={classnames('size-4 hover:cursor-pointer', {
            'opacity-50': isProcessing,
          })}
          onClick={onEdit}
        />
      }
    >
      <MarkdownView content={text} />
    </MessagePanel>
  );
}
