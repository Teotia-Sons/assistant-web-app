import {
  ClockIcon,
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import RoleSelector, { RoleType } from './RoleSelector';
import TextArea from './TextArea';
import {
  appendMessage,
  deleteConversation,
  invokeStream,
} from '../../../services/assistantService';
import { useAppStore } from '../../../store';
import { useAssistantStore } from '../../../stores/assistantStore';
import ModelConfigSelector from '../sharedcomponents/ModelConfigSelector';

export default function AssistantInput() {
  const navigate = useNavigate();
  const { prompt, setPrompt, modelConfig } = useAppStore();
  const { conversation, setConversation, isProcessing, setIsProcessing } =
    useAssistantStore();
  const [role, setRole] = useState<RoleType>('human');

  const handleAppend = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      const updatedConversation = await appendMessage(
        conversation?.id,
        role,
        prompt,
      );
      setConversation(updatedConversation);
      setPrompt('');

      if (!conversation) {
        navigate(`/${updatedConversation.id}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    conversation,
    isProcessing,
    prompt,
    role,
    setPrompt,
    setConversation,
    setIsProcessing,
  ]);

  const handleInvoke = useCallback(async () => {
    const { conversation } = useAssistantStore.getState();
    setIsProcessing(true);
    try {
      for await (const message of invokeStream(conversation!.id, modelConfig)) {
        setConversation(message.data);
      }
    } catch (exc) {
      alert(exc);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, setIsProcessing, setConversation, modelConfig]);

  const handleSubmit = useCallback(async () => {
    await handleAppend();
    await handleInvoke();
  }, [handleAppend, handleInvoke]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.ctrlKey && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        if (event.shiftKey) {
          window.open('/', '_blank');
        } else {
          navigate('/');
        }
      }
    },
    [navigate],
  );

  const handleDelete = useCallback(async () => {
    await deleteConversation(conversation!.id);
    navigate(-1);
  }, [conversation, navigate]);

  return (
    <div className="relative flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {conversation?.id && (
            <>
              <Link
                to="/"
                onClick={e => isProcessing && e.preventDefault()}
                className={classNames('neu-up rounded-full p-2', {
                  'opacity-50': isProcessing,
                })}
              >
                <PlusIcon className="size-4" />
              </Link>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="neu-up rounded-full p-2 disabled:opacity-50"
              >
                <TrashIcon className="size-4" />
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/history')}
            disabled={isProcessing}
            className="neu-up rounded-full p-2 disabled:opacity-50"
          >
            <ClockIcon className="size-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <ModelConfigSelector disabled={isProcessing} />
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="neu-up rounded-full p-2 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <TextArea
          value={prompt}
          onChange={setPrompt}
          onSave={handleAppend}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          autoFocus
        />
      </div>
      <div className="absolute bottom-2 right-2">
        <RoleSelector value={role} onChange={setRole} disabled={isProcessing} />
      </div>
    </div>
  );
}
