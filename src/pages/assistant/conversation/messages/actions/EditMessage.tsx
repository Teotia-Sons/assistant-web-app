import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import classnames from 'classnames';
import { Save } from 'lucide-react';
import { useState } from 'react';

import {
  editMessage,
  invokeStream,
  trimConversation,
} from '../../../../../services/assistantService';
import { useAppStore } from '../../../../../store';
import { useAssistantStore } from '../../../../../stores/assistantStore';
import TextArea from '../../../input/TextArea';

interface EditMessageProps {
  text: string;
  messageId: string;
  conversationId: string;
  onEscape: () => void;
  className?: string;
}

export default function EditMessage({
  text: initialText,
  messageId,
  conversationId,
  onEscape,
  className,
}: EditMessageProps) {
  const [text, setText] = useState(initialText);
  const { setConversation, setIsProcessing } = useAssistantStore();
  const { modelConfig } = useAppStore();

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const updatedConversation = await editMessage(
        conversationId,
        messageId,
        text,
      );
      setConversation(updatedConversation);
    } finally {
      setIsProcessing(false);
    }
    onEscape();
  };

  const handleTrimAndSubmit = async () => {
    setIsProcessing(true);
    try {
      const editedConversation = await editMessage(
        conversationId,
        messageId,
        text,
      );
      setConversation(editedConversation);

      onEscape();

      const trimmedConversation = await trimConversation(
        conversationId,
        messageId,
      );
      setConversation(trimmedConversation);

      for await (const message of invokeStream(conversationId, modelConfig)) {
        setConversation(message.data);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={classnames(
        'neu-up flex min-h-64 flex-col gap-2 p-2',
        className,
      )}
    >
      <TextArea
        value={text}
        onChange={(text: string) => setText(text)}
        onSave={handleSubmit}
        onSubmit={handleTrimAndSubmit}
        className={'rounded-lg'}
      />
      <div className="flex justify-end gap-1">
        <button onClick={onEscape} className="rounded-full p-2">
          <XMarkIcon className="size-4" />
        </button>
        <button onClick={handleSubmit} className="rounded-full p-2">
          <Save className="size-4" />
        </button>
        <button onClick={handleTrimAndSubmit} className="rounded-full p-2">
          <PaperAirplaneIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
