"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_contexts/AuthContext";

export default function AdminSignin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isLoading } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    const result = await login(email, password);
    
    if (result.success) {
      // AuthContext will handle the redirect based on user role
      // If user is not admin/staff, they will be redirected to /feed
      // If they are admin/staff, they will be redirected to /admin/panel
    } else {
      setError(result.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gruvbox-light-bg0">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Sign In</h1>
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gruvbox-orange text-white py-2 rounded font-bold disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
