"use client";

import React from 'react';

interface MediaPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export default function MediaPreview({ files, onRemove }: MediaPreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-3">
        Selected Files ({files.length}/5):
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-3 border border-gruvbox-gray">
              {/* File Preview */}
              <div className="aspect-square bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : file.type.startsWith('video/') ? (
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <div className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 text-center">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">File</span>
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-xs text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove file"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
