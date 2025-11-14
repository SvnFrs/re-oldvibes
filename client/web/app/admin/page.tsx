"use client";
import { useEffect, useState } from "react";
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card";
import { FadeIn } from "../_motion/MotionWrappers";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
};

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || !["admin", "staff"].includes(data.user.role)) {
          router.replace("/admin/signin");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.replace("/admin/signin"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading)
    return (
      <div className="p-8 text-center text-sm text-gruvbox-dark-fg2">
        Loading...
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen pt-6 pb-16">
      <PageShell width="xl">
        <SectionHeader
          title="Admin Panel"
          subtitle="Moderate vibes, manage users & staff, ensure platform quality"
          actions={
            <a
              href="/admin/profile"
              className="text-sm font-medium text-gruvbox-blue hover:text-gruvbox-blue-light transition"
            >
              View Profile
            </a>
          }
        />
        <div className="mb-6 text-xs font-mono text-gruvbox-dark-fg3">
          Signed in as: {user.email} ({user.role})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn>
            <Card interactive>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Staff Management</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gruvbox-dark-fg2">
                {user.role === "admin" ? <StaffSection /> : <p>Admin only</p>}
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn>
            <Card interactive>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">User Management</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gruvbox-dark-fg2">
                <UserSection />
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn>
            <Card interactive>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Vibe Moderation</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gruvbox-dark-fg2">
                <VibeModerationSection />
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </PageShell>
    </div>
  );
}

// --- StaffSection, UserSection, VibeModerationSection components below ---

function StaffSection() {
  return (
    <div className="space-y-2">
      <p className="text-gruvbox-dark-fg3">
        Manage staff permissions and roles.
      </p>
      <div className="rounded-md border p-3 text-xs bg-gruvbox-dark-bg1">
        TODO: Staff list table
      </div>
    </div>
  );
}

function UserSection() {
  return (
    <div className="space-y-2">
      <p className="text-gruvbox-dark-fg3">
        Review users and adjust account status.
      </p>
      <div className="rounded-md border p-3 text-xs bg-gruvbox-dark-bg1">
        TODO: User list table
      </div>
    </div>
  );
}

function VibeModerationSection() {
  return (
    <div className="space-y-2">
      <p className="text-gruvbox-dark-fg3">
        Approve or reject newly submitted vibes.
      </p>
      <div className="rounded-md border p-3 text-xs bg-gruvbox-dark-bg1">
        TODO: Pending vibes queue
      </div>
    </div>
  );
}
