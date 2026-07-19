import Conversation from './conversation/Conversation';
import AssistantInput from './input/AssistantInput';

export default function AssistantPage() {
  return (
    <div className="flex h-screen flex-col gap-4 p-3">
      <div className="min-h-0 flex-grow p-2">
        <Conversation />
      </div>
      <AssistantInput />
    </div>
  );
}
