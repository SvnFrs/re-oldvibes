import Footer from "./footer";
import Header from "./header";
import BanStatusBanner from "../../_components/auth/BanStatusBanner";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      <BanStatusBanner />
      <main className="flex-1 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0">{children}</main>
      <Footer />
    </div>
  );
}
