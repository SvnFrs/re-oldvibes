import LoginForm from "../../_components/auth/LoginForm";
import AuthGuard from "../../_components/auth/AuthGuard";

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </AuthGuard>
  );
}
