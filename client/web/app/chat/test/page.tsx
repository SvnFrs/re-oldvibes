"use client";

import { useState } from "react";
import { useAuth } from "../../_contexts/AuthContext";
import AuthGuard from "../../_components/auth/AuthGuard";

export default function ChatTestPage() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>("");

  const testChatAPI = async () => {
    try {
      setTestResult("Testing chat API...");
      
      // Test basic chat API
      const response = await fetch('/api/chat/conversations', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Chat API working! Found ${data.conversations?.length || 0} conversations`);
      } else {
        setTestResult(`❌ Chat API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  const testSocketConnection = async () => {
    try {
      setTestResult("Testing socket connection...");
      
      // Test token endpoint first
      const tokenResponse = await fetch('/api/auth/token', {
        credentials: 'include'
      });
      
      if (!tokenResponse.ok) {
        setTestResult(`❌ Token endpoint failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
        return;
      }
      
      const tokenData = await tokenResponse.json();
      setTestResult(`✅ Token retrieved: ${tokenData.token.substring(0, 20)}...`);
      
      // Import socket dynamically
      const { getSocket } = await import('../../_libs/socket');
      const socket = await getSocket();
      
      if (socket) {
        setTestResult(prev => prev + "\n✅ Socket connection successful!");
        
        // Test socket events
        socket.on('connect', () => {
          setTestResult(prev => prev + "\n🔗 Socket connected with ID: " + socket.id);
        });
        
        socket.on('disconnect', () => {
          setTestResult(prev => prev + "\n🔌 Socket disconnected");
        });
        
        socket.on('error', (error) => {
          setTestResult(prev => prev + "\n❌ Socket error: " + error.message);
        });
        
      } else {
        setTestResult(prev => prev + "\n❌ Socket connection failed - no authentication token");
      }
    } catch (error) {
      setTestResult(`❌ Socket error: ${error}`);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-8">
            Chat System Test
          </h1>
          
          <div className="space-y-4">
            <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">User Info</h2>
              <p>ID: {user?.id}</p>
              <p>Name: {user?.name}</p>
              <p>Email: {user?.email}</p>
            </div>

            <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Tests</h2>
              
              <div className="space-y-2">
                <button
                  onClick={testChatAPI}
                  className="w-full px-4 py-2 bg-gruvbox-blue text-gruvbox-light-bg0 rounded-lg hover:bg-gruvbox-blue/90 transition-colors"
                >
                  Test Chat API
                </button>
                
                <button
                  onClick={testSocketConnection}
                  className="w-full px-4 py-2 bg-gruvbox-yellow text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                >
                  Test Socket Connection
                </button>
              </div>
            </div>

            {testResult && (
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}

            <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              <div className="space-y-2">
                <a
                  href="/chat"
                  className="block w-full px-4 py-2 bg-gruvbox-green text-gruvbox-light-bg0 rounded-lg hover:bg-gruvbox-green/90 transition-colors text-center"
                >
                  Go to Chat List
                </a>
                <a
                  href="/"
                  className="block w-full px-4 py-2 bg-gruvbox-gray text-gruvbox-light-bg0 rounded-lg hover:bg-gruvbox-gray/90 transition-colors text-center"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
