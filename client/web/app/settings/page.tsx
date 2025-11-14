"use client";

import { useState } from "react";
import ChangePasswordForm from "../_components/auth/ChangePasswordForm";
import ProfileInfo from "../_components/auth/ProfileInfo";
import AuthGuard from "../_components/auth/AuthGuard";
import MyVibesList from "../_components/vibes/MyVibesList";
import DeleteAccountButton from "../_components/auth/DeleteAccountButton";
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import {
  IconLock,
  IconUser,
  IconBox,
  IconTrash,
  IconSettings,
} from "@tabler/icons-react";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";

type SettingsSection = "profile" | "password" | "vibes" | "delete";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  const navigationItems = [
    {
      id: "profile" as SettingsSection,
      label: "Profile",
      icon: IconUser,
      description: "Manage your personal information",
    },
    {
      id: "password" as SettingsSection,
      label: "Password",
      icon: IconLock,
      description: "Change your password",
    },
    {
      id: "vibes" as SettingsSection,
      label: "My Vibes",
      icon: IconBox,
      description: "View and manage your listings",
    },
    {
      id: "delete" as SettingsSection,
      label: "Delete Account",
      icon: IconTrash,
      description: "Permanently delete your account",
      danger: true,
    },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
        <PageShell width="xl">
          {/* Header */}
          <FadeIn>
            <SectionHeader
              title="Settings"
              subtitle="Manage your account and preferences"
            />
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Sidebar Navigation */}
            <SlideUp delay={0.1}>
              <aside className="lg:col-span-1">
                <div className="bg-gruvbox-dark-bg1 rounded-xl border border-gruvbox-dark-bg2 overflow-hidden sticky top-20">
                  <div className="p-4 border-b border-gruvbox-dark-bg2 bg-gradient-to-r from-gruvbox-orange/10 to-gruvbox-yellow/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center">
                        <IconSettings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gruvbox-dark-fg0">
                          Account Settings
                        </h3>
                        <p className="text-xs text-gruvbox-gray">
                          Manage your preferences
                        </p>
                      </div>
                    </div>
                  </div>

                  <nav className="p-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                            isActive
                              ? "bg-gruvbox-orange text-white shadow-lg"
                              : item.danger
                              ? "text-gruvbox-red hover:bg-gruvbox-red/10"
                              : "text-gruvbox-dark-fg2 hover:bg-gruvbox-dark-bg2"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              isActive
                                ? "text-white"
                                : item.danger
                                ? "text-gruvbox-red"
                                : "text-gruvbox-gray group-hover:text-gruvbox-orange"
                            }`}
                          />
                          <div className="flex-1 text-left">
                            <p
                              className={`font-medium text-sm ${
                                isActive ? "text-white" : ""
                              }`}
                            >
                              {item.label}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${
                                isActive
                                  ? "text-white/80"
                                  : "text-gruvbox-gray"
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>
            </SlideUp>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <SlideUp delay={0.2}>
                <div className="bg-gruvbox-dark-bg1 rounded-xl shadow-xl border border-gruvbox-dark-bg2 overflow-hidden">
                  {/* Profile Section */}
                  {activeSection === "profile" && (
                    <div className="p-6 md:p-8">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gruvbox-orange/10 flex items-center justify-center">
                            <IconUser className="w-5 h-5 text-gruvbox-orange" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
                              Profile Information
                            </h2>
                            <p className="text-sm text-gruvbox-gray">
                              Update your personal details and profile picture
                            </p>
                          </div>
                        </div>
                      </div>
                      <ProfileInfo />
                    </div>
                  )}

                  {/* Password Section */}
                  {activeSection === "password" && (
                    <div className="p-6 md:p-8">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gruvbox-orange/10 flex items-center justify-center">
                            <IconLock className="w-5 h-5 text-gruvbox-orange" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
                              Password & Security
                            </h2>
                            <p className="text-sm text-gruvbox-gray">
                              Update your password to keep your account secure
                            </p>
                          </div>
                        </div>
                      </div>
                      <ChangePasswordForm />
                    </div>
                  )}

                  {/* My Vibes Section */}
                  {activeSection === "vibes" && (
                    <div className="p-6 md:p-8">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gruvbox-orange/10 flex items-center justify-center">
                            <IconBox className="w-5 h-5 text-gruvbox-orange" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
                              My Vibes
                            </h2>
                            <p className="text-sm text-gruvbox-gray">
                              Manage your vintage listings and items
                            </p>
                          </div>
                        </div>
                      </div>
                      <MyVibesList />
                    </div>
                  )}

                  {/* Delete Account Section */}
                  {activeSection === "delete" && (
                    <div className="p-6 md:p-8">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gruvbox-red/10 flex items-center justify-center">
                            <IconTrash className="w-5 h-5 text-gruvbox-red" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gruvbox-red">
                              Delete Account
                            </h2>
                            <p className="text-sm text-gruvbox-gray">
                              Permanently remove your account and all data
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gruvbox-red/5 border border-gruvbox-red/20 rounded-xl p-6 mb-6">
                        <div className="flex gap-4">
                          <IconTrash className="w-6 h-6 text-gruvbox-red flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gruvbox-red mb-2">
                              Warning: This action cannot be undone
                            </h3>
                            <p className="text-sm text-gruvbox-dark-fg2 mb-3">
                              Deleting your account will permanently remove:
                            </p>
                            <ul className="text-sm text-gruvbox-dark-fg2 space-y-1 list-disc list-inside">
                              <li>Your profile and personal information</li>
                              <li>All your vibes and listings</li>
                              <li>Your comments and interactions</li>
                              <li>Your wishlist and saved items</li>
                              <li>All associated data and history</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <DeleteAccountButton />
                    </div>
                  )}
                </div>
              </SlideUp>
            </div>
          </div>
        </PageShell>
      </div>
    </AuthGuard>
  );
}
