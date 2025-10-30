import { IconAlertTriangle, IconBan, IconX } from "@tabler/icons-react";

interface ModerationAlertProps {
  type: "warning" | "banned";
  message: string;
  reason: string;
  categories?: string[];
  badBehaviorCount?: number;
  warning?: string;
  contact?: string;
  bannedAt?: string;
  onClose: () => void;
}

export function ModerationAlert({
  type,
  message,
  reason,
  categories,
  badBehaviorCount,
  warning,
  contact,
  bannedAt,
  onClose,
}: ModerationAlertProps) {
  const isWarning = type === "warning";
  const isBanned = type === "banned";

  return (
    <div
      className={`mb-6 p-4 rounded-lg border-2 ${
        isWarning
          ? "bg-gruvbox-yellow-light/10 dark:bg-gruvbox-yellow-dark/10 border-gruvbox-yellow-light dark:border-gruvbox-yellow-dark"
          : "bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border-gruvbox-red-light dark:border-gruvbox-red-dark"
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isWarning ? (
            <IconAlertTriangle
              size={24}
              className="text-gruvbox-yellow-light dark:text-gruvbox-yellow-dark"
            />
          ) : (
            <IconBan
              size={24}
              className="text-gruvbox-red-light dark:text-gruvbox-red-dark"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-lg mb-1 ${
              isWarning
                ? "text-gruvbox-yellow-light dark:text-gruvbox-yellow-dark"
                : "text-gruvbox-red-light dark:text-gruvbox-red-dark"
            }`}
          >
            {message}
          </h3>

          <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
            {reason}
          </p>

          {/* Categories (for moderation warnings) */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Warning message (for moderation warnings) */}
          {warning && (
            <div className="mt-2 p-2 rounded bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1">
              <p className="text-sm font-semibold text-gruvbox-orange">
                ⚠️ {warning}
              </p>
            </div>
          )}

          {/* Strike counter (for moderation warnings) */}
          {badBehaviorCount !== undefined && badBehaviorCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                Violations:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      num <= badBehaviorCount
                        ? num === 3
                          ? "bg-gruvbox-red-light dark:bg-gruvbox-red-dark text-white"
                          : "bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark text-gruvbox-dark-bg0"
                        : "bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-gray"
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact info (for temp bans) */}
          {contact && (
            <p className="mt-2 text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
              {contact}
            </p>
          )}

          {/* Ban timestamp */}
          {bannedAt && (
            <p className="mt-2 text-xs text-gruvbox-gray">
              Banned at: {new Date(bannedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg1 rounded transition"
          aria-label="Close alert"
        >
          <IconX
            size={20}
            className="text-gruvbox-gray hover:text-gruvbox-light-fg0 dark:hover:text-gruvbox-dark-fg0"
          />
        </button>
      </div>
    </div>
  );
}
