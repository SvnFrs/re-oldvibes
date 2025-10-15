"use client";

interface TypingIndicatorProps {
  isTyping: boolean;
  participantName?: string;
}

export default function TypingIndicator({ isTyping, participantName = "Someone" }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center space-x-2 mb-4 px-4">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gruvbox-gray rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gruvbox-gray rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gruvbox-gray rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3">
        {participantName} is typing...
      </span>
    </div>
  );
}
