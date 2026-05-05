import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import {
  forkConversation,
  trimConversation,
} from '../../../../../services/assistantService';
import { useAssistantStore } from '../../../../../stores/assistantStore';

export function useMessageActions(messageId: string) {
  const navigate = useNavigate();
  const { conversation, setConversation, setIsProcessing } =
    useAssistantStore();

  const handleTrim = useCallback(async () => {
    setIsProcessing(true);
    try {
      const updatedConversation = await trimConversation(
        conversation!.id,
        messageId,
      );
      setConversation(updatedConversation);
    } finally {
      setIsProcessing(false);
    }
  }, [conversation, setConversation, setIsProcessing, messageId]);

  const handleFork = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedText = window.getSelection()?.toString();
      const forkedConversation = await forkConversation(
        conversation!.id,
        messageId,
        selectedText,
      );
      navigate(`/${forkedConversation.id}`);
    } finally {
      setIsProcessing(false);
    }
  }, [conversation, setIsProcessing, messageId, navigate]);

  return { handleTrim, handleFork };
}
