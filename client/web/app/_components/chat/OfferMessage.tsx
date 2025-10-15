"use client";

import { useState } from "react";
import { updateOfferStatus } from "../../_apis/chat/chat";

interface OfferMessageProps {
  offerData: {
    amount: number;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    expiresAt: string;
  };
  messageId: string;
  isFromMe: boolean;
  onStatusUpdate: (messageId: string, status: 'accepted' | 'rejected') => void;
}

export default function OfferMessage({ 
  offerData, 
  messageId, 
  isFromMe, 
  onStatusUpdate 
}: OfferMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOfferAction = async (status: 'accepted' | 'rejected') => {
    if (isUpdating || offerData.status !== 'pending') return;

    setIsUpdating(true);
    try {
      await updateOfferStatus(messageId, status);
      onStatusUpdate(messageId, status);
    } catch (error) {
      console.error("Failed to update offer status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = () => {
    switch (offerData.status) {
      case 'pending':
        return 'bg-gruvbox-yellow/20 text-gruvbox-yellow';
      case 'accepted':
        return 'bg-gruvbox-green/20 text-gruvbox-green';
      case 'rejected':
        return 'bg-gruvbox-red/20 text-gruvbox-red';
      case 'expired':
        return 'bg-gruvbox-gray/20 text-gruvbox-gray';
      default:
        return 'bg-gruvbox-gray/20 text-gruvbox-gray';
    }
  };

  const isExpired = new Date(offerData.expiresAt) < new Date();

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-lg">💰</span>
        <span className="font-semibold">Offer: ${offerData.amount}</span>
      </div>
      
      {offerData.message && (
        <p className="text-sm opacity-90">{offerData.message}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className={`text-xs px-2 py-1 rounded ${getStatusColor()}`}>
          Status: {isExpired ? 'expired' : offerData.status}
        </div>
        
        {!isFromMe && offerData.status === 'pending' && !isExpired && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleOfferAction('rejected')}
              disabled={isUpdating}
              className="px-3 py-1 text-xs bg-gruvbox-red/20 text-gruvbox-red rounded hover:bg-gruvbox-red/30 transition-colors disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Reject'}
            </button>
            <button
              onClick={() => handleOfferAction('accepted')}
              disabled={isUpdating}
              className="px-3 py-1 text-xs bg-gruvbox-green/20 text-gruvbox-green rounded hover:bg-gruvbox-green/30 transition-colors disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Accept'}
            </button>
          </div>
        )}
      </div>
      
      {isExpired && offerData.status === 'pending' && (
        <p className="text-xs text-gruvbox-gray">
          This offer has expired
        </p>
      )}
    </div>
  );
}
