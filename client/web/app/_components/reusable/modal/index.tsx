"use client";

import { cn } from "@/app/_libs/utils";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  opened: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    opened,
    onClose,
    title,
    className = "",
    showCloseButton = true,
    children,
    ...props
  }, ref) => {
    const closeOnEscape = React.useCallback(
      (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      },
      [onClose],
    );

    React.useEffect(() => {
      if (opened) {
        document.body.classList.add("no-scroll");
        document.addEventListener("keydown", closeOnEscape);
      } else {
        document.body.classList.remove("no-scroll");
        document.removeEventListener("keydown", closeOnEscape);
      }

      return () => {
        document.body.classList.remove("no-scroll");
        document.removeEventListener("keydown", closeOnEscape);
      };
    }, [opened, closeOnEscape]);

    return (
      <AnimatePresence>
        {opened && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={onClose}
          >
            <motion.div
              ref={ref}
              className={cn(
                "bg-gruvbox-dark-bg0 p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar border border-gruvbox-dark-bg2 max-w-lg w-full relative",
                className,
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              {...(props as React.ComponentProps<typeof motion.div>)}
            >
              {showCloseButton && (
                <button
                  className="absolute top-4 right-4 text-gruvbox-gray hover:text-gruvbox-red transition-colors rounded-full p-1 hover:bg-gruvbox-dark-bg1 z-10"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <IconX size={20} />
                </button>
              )}

              {title && (
                <h2 className="text-2xl font-bold mb-6 text-gruvbox-dark-fg0 pr-8">
                  {title}
                </h2>
              )}

              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
