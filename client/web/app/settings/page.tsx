"use client";

import React from 'react';
import AuthGuard from '../_components/auth/AuthGuard';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl border border-gruvbox-gray p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-2">
                Settings
              </h1>
              <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                Manage your account and preferences
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
                  Profile Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
                  Notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                        Receive updates about your vibes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gruvbox-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gruvbox-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gruvbox-orange"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                        Get notified about new messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gruvbox-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gruvbox-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gruvbox-orange"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
                  Privacy
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                        Public Profile
                      </h3>
                      <p className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gruvbox-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gruvbox-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gruvbox-orange"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                  Danger Zone
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-500 dark:text-red-300">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}