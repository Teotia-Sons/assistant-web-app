import { ArrowDownIcon } from '@heroicons/react/24/solid';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import AIMessage from './messages/aimessage/AIMessage';
import HumanMessage from './messages/humanmessage/HumanMessage';
import SystemMessage from './messages/systemmessage/SystemMessage';
import Loader from '../../../components/Loader';
import { getConversation } from '../../../services/assistantService';
import { useAssistantStore } from '../../../stores/assistantStore';

export default function Conversation() {
  const [isLoading, setIsLoading] = useState(false);
  const { id: urlConversationId } = useParams();

  const { conversation, setConversation, isProcessing } = useAssistantStore();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentConversationId = useAssistantStore.getState().conversation?.id;
    if (currentConversationId === urlConversationId) {
      // `handleAppend` updates the state for a newly created conversation
      return;
    }

    if (!urlConversationId) {
      setConversation(null);
    } else {
      setIsLoading(true);
      getConversation(urlConversationId)
        .then(setConversation)
        .finally(() => setIsLoading(false));
    }
  }, [urlConversationId, setConversation]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={classnames(
        'relative flex h-full flex-col gap-4 overflow-auto p-2',
        { 'opacity-50': isProcessing },
      )}
    >
      {conversation?.title && <title>{conversation.title}</title>}
      {conversation?.messages.map(({ data: message }) => {
        if (message.type === 'human') {
          return <HumanMessage key={message.id} message={message} />;
        }
        if (message.type === 'ai') {
          return <AIMessage key={message.id} message={message} />;
        }
        return <SystemMessage key={message.id} message={message} />;
      })}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-2 self-end rounded-full bg-[var(--bg-color)] p-2"
        >
          <ArrowDownIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
