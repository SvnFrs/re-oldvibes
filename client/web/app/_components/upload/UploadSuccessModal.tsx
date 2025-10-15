"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconX, IconEye } from "@tabler/icons-react";

interface UploadSuccessModalProps {
  isOpen: boolean;
  vibeId: string;
  onClose: () => void;
}

export default function UploadSuccessModal({ isOpen, vibeId, onClose }: UploadSuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gruvbox-green/20 rounded-full flex items-center justify-center">
              <IconCheck className="w-6 h-6 text-gruvbox-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                Upload Successful!
              </h3>
              <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                Your vibe has been submitted for review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gruvbox-gray/20 rounded-full transition-colors"
          >
            <IconX className="w-5 h-5 text-gruvbox-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-gruvbox-blue/10 border border-gruvbox-blue/20 rounded-lg p-4">
            <p className="text-sm text-gruvbox-blue">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-gruvbox-blue mt-2 space-y-1">
              <li>• Your vibe will be reviewed by our moderators</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• It will then be visible in the marketplace</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/vibes/${vibeId}`)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gruvbox-blue text-gruvbox-light-bg0 rounded-lg hover:bg-gruvbox-blue/90 transition-colors"
            >
              <IconEye className="w-4 h-4" />
              <span>View Vibe</span>
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gruvbox-yellow text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
            >
              <IconCheck className="w-4 h-4" />
              <span>Upload Another</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gruvbox-gray">
              Redirecting to homepage in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
