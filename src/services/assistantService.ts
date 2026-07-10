import { axiosInstance } from './axiosInstance';
import { ModelTag, ReasoningEffort } from './models';
import { processSSEStream } from './streamUtils';

export type MessageType = 'system' | 'human' | 'ai';

interface Cost {
  input: number;
  output: number;
  cache_read: number;
  cache_write: number;
  total: number;
}

interface InputTokenDetails {
  cache_read: number;
  cache_creation: number;
}

interface OutputTokenDetails {
  reasoning: number;
}

interface UsageMetadata {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_token_details?: InputTokenDetails;
  output_token_details?: OutputTokenDetails;
}

interface MessageMetadata {
  creation_time: string;
}

export interface AIMessageMetadata extends MessageMetadata {
  cost?: Cost;
  invocation_time: string;
  latency: number;
  reasoning?: string;
}

interface GeminiContentBlock {
  type: string;
  text?: string;
  thinking?: string;
}

interface GrokTextBlock {
  type: 'text';
  text: string;
}

interface GrokReasoningBlock {
  type: 'reasoning';
  summary: { type: string; text: string }[];
}

interface GrokWebSearchCallBlock {
  type: 'web_search_call';
  action: { type: string; query?: string; url?: string };
}

type GrokContentBlock =
  | GrokTextBlock
  | GrokReasoningBlock
  | GrokWebSearchCallBlock;

type ContentBlock = string | GeminiContentBlock | GrokContentBlock;

interface RawMessage {
  additional_kwargs: MessageMetadata | AIMessageMetadata;
  type: MessageType;
  id: string;
  usage_metadata: UsageMetadata;
  content: string | ContentBlock[];
}

export interface RawConversationType {
  id: string;
  title: string;
  messages: {
    type: MessageType;
    data: RawMessage;
  }[];
  created_at: string;
}

interface Content {
  text: string;
  thinking: string;
}

export interface Message {
  content: Content;
  additional_kwargs: MessageMetadata | AIMessageMetadata;
  usage_metadata: UsageMetadata;
  type: MessageType;
  id: string;
}

export interface ConversationType {
  id: string;
  title: string;
  messages: {
    type: MessageType;
    data: Message;
  }[];
  created_at: string;
}

interface ModelConfig {
  modelInstance: ModelTag;
  reasoningEffort: ReasoningEffort;
}

export function aggregateContent(message: RawMessage): Content {
  const rawMessageContent = message.content;
  const aggregatedContent: Content = {
    text: '',
    thinking: '',
  };

  if (typeof rawMessageContent === 'string') {
    aggregatedContent.text = rawMessageContent;
  } else {
    for (const item of rawMessageContent) {
      if (typeof item === 'string') {
        aggregatedContent.text += item;
      } else if (item && typeof item === 'object' && 'type' in item) {
        if (item.type === 'text') {
          aggregatedContent.text += item.text!;
        }
        if (item.type === 'thinking') {
          aggregatedContent.thinking += item.thinking!;
        }
        if (item.type === 'reasoning') {
          const reasoningItem = item as GrokReasoningBlock;
          for (const summaryItem of reasoningItem.summary) {
            if (summaryItem.text) {
              aggregatedContent.thinking += summaryItem.text + '\n\n';
            }
          }
        }
        if (item.type === 'web_search_call') {
          const webSearchItem = item as GrokWebSearchCallBlock;
          const action = webSearchItem.action;
          if (action.type === 'search' && action.query) {
            aggregatedContent.thinking += `[Web Search] ${action.query}\n\n`;
          }
          if (action.type === 'open_page' && action.url) {
            aggregatedContent.thinking += `[Open Page] ${action.url}\n\n`;
          }
        }
      }
    }
  }

  const rawMessageAdditionalKwargs =
    message.additional_kwargs as AIMessageMetadata;
  if (rawMessageAdditionalKwargs.reasoning) {
    const reasoning = rawMessageAdditionalKwargs.reasoning;
    if (reasoning) {
      aggregatedContent.thinking = reasoning + aggregatedContent.thinking;
    }
  }

  return aggregatedContent;
}

function transformMessage(raw: RawMessage): Message {
  return {
    ...raw,
    content: aggregateContent(raw),
  };
}

function convertConversation(raw: RawConversationType): ConversationType {
  return {
    ...raw,
    messages: raw.messages.map(({ type, data }) => ({
      type,
      data: transformMessage(data),
    })),
  };
}

export const getConversation = async (
  conversationId: string,
): Promise<ConversationType> => {
  const response = await axiosInstance.get<{
    conversation: RawConversationType;
  }>(`/assistant/conversation/${conversationId}`);
  return convertConversation(response.data.conversation);
};

export const appendMessage = async (
  conversationId: string | undefined,
  messageType: string,
  content: string,
): Promise<ConversationType> => {
  const response = await axiosInstance.post<RawConversationType>(
    '/assistant/append',
    {
      conversation_id: conversationId,
      message_type: messageType,
      content,
    },
  );
  return convertConversation(response.data);
};

interface RawStreamChunkMessage {
  type: 'message_chunk';
  data: RawMessage;
}

interface RawStreamConversationMessage {
  type: 'conversation';
  data: RawConversationType;
}

type RawStreamMessage = RawStreamChunkMessage | RawStreamConversationMessage;

interface StreamConversationMessage {
  type: 'conversation';
  data: ConversationType;
}

export const editMessage = async (
  conversationId: string,
  messageId: string,
  content: string,
): Promise<ConversationType> => {
  const response = await axiosInstance.post<RawConversationType>(
    '/assistant/edit',
    {
      conversation_id: conversationId,
      message_id: messageId,
      content,
    },
  );
  return convertConversation(response.data);
};

export const trimConversation = async (
  conversationId: string,
  messageId: string,
): Promise<ConversationType> => {
  const response = await axiosInstance.post<RawConversationType>(
    '/assistant/trim',
    {
      conversation_id: conversationId,
      message_id: messageId,
    },
  );
  return convertConversation(response.data);
};

export const forkConversation = async (
  conversationId: string,
  messageId: string,
  prompt?: string,
): Promise<ConversationType> => {
  const response = await axiosInstance.post<RawConversationType>(
    '/assistant/fork',
    {
      source: conversationId,
      message_id: messageId,
      prompt,
    },
  );
  return convertConversation(response.data);
};

export const invokeStream = async function* (
  conversationId: string,
  modelConfig: ModelConfig,
): AsyncGenerator<StreamConversationMessage, void, unknown> {
  const response = await axiosInstance.post(
    '/assistant/invoke',
    {
      conversation_id: conversationId,
      model: modelConfig.modelInstance,
      reasoning_effort: modelConfig.reasoningEffort,
    },
    {
      responseType: 'stream',
    },
  );

  for await (const message of processSSEStream<RawStreamMessage>(
    response.data,
  )) {
    if (message.type === 'conversation') {
      yield {
        type: 'conversation',
        data: convertConversation(message.data),
      };
    }
  }
};

export interface ConversationListItem {
  id: string;
  title: string;
  created_at: string;
}

export interface ListConversationsFilters {
  query: string;
}

export const listConversations = async (
  filters: ListConversationsFilters,
): Promise<ConversationListItem[]> => {
  const params = new URLSearchParams();
  params.append('query', filters.query);

  const response = await axiosInstance.get<{
    conversations: ConversationListItem[];
  }>('/assistant/conversations', { params });
  return response.data.conversations;
};

export const deleteConversation = async (
  conversationId: string,
): Promise<void> => {
  await axiosInstance.delete(`/assistant/conversation/${conversationId}`);
};
