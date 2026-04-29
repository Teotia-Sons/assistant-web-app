import { ScissorsIcon } from '@heroicons/react/24/outline';
import classnames from 'classnames';
import { GitFork } from 'lucide-react';
import { ReactNode } from 'react';

import { useMessageActions } from '../hooks/useMessageActions';

interface MessageActionsProps {
  messageId: string;
  actions?: ReactNode;
  disabled?: boolean;
}

export default function MessageActions({
  messageId,
  actions,
  disabled,
}: MessageActionsProps) {
  const { handleTrim, handleFork } = useMessageActions(messageId);

  const iconClassName = classnames('size-4', {
    'opacity-50': disabled,
    'hover:cursor-pointer': !disabled,
  });

  const handleForkClick = (e: React.MouseEvent) => {
    // Prevent click to unselect the text for forking the conversations.
    e.preventDefault();
    void handleFork();
  };

  return (
    <div className={'flex justify-between gap-4'}>
      <div className={'flex gap-2'}>{actions}</div>
      <div className={'flex gap-2'}>
        <ScissorsIcon
          className={iconClassName}
          onClick={() => !disabled && handleTrim()}
          title="Trim"
        />
        <GitFork className={iconClassName} onMouseDown={handleForkClick} />
      </div>
    </div>
  );
}
