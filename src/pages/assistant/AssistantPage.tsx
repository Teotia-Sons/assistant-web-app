import Conversation from './conversation/Conversation';
import AssistantInput from './input/AssistantInput';

export default function AssistantPage() {
  return (
    <div className="flex h-screen flex-col gap-4 p-2">
      <div className="min-h-0 flex-grow">
        <Conversation />
      </div>
      <AssistantInput />
    </div>
  );
}
