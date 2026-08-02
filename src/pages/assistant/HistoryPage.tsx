import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import Loader from '../../components/Loader';
import {
  ConversationListItem,
  listConversations,
} from '../../services/assistantService';

export default function HistoryPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => {
    listConversations({ query })
      .then(setConversations)
      .finally(() => setIsLoading(false));
  }, [query]);

  if (isLoading) {
    return (
      <div className="p-16">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center gap-4 p-4">
      <title>History</title>
      <div className="neu-up flex min-w-96 flex-grow flex-col items-center gap-2 overflow-auto">
        {conversations.map(conv => (
          <Link
            key={conv.id}
            to={`/${conv.id}`}
            className={'w-full max-w-[600px] border-b hover:cursor-pointer'}
          >
            <span className={'text-xs text-[var(--border-color)]'}>
              {format(new Date(conv.created_at), 'dd MMM HH:mm')}
            </span>
            <br />
            {conv.title}
          </Link>
        ))}
      </div>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />
    </div>
  );
}
