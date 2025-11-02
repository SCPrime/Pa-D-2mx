/**
 * PaiiD 2MX - Persistent Navigation Header
 * 
 * Professional navigation that stays consistent across all pages
 * Prevents users from getting "lost" in demo pages
 */

import Link from "next/link";
import { useRouter } from "next/router";
import { WalletButton } from "../wallet/WalletButton";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
  const router = useRouter();
  const { user } = useAuth();

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dex-demo", label: "Swap", icon: "🔄" },
    { href: "/market-demo", label: "Market", icon: "📊" },
    { href: "/wallet-demo", label: "Wallet", icon: "🔗" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-2xl font-bold text-white">PaiiD 2MX</div>
            <span className="hidden sm:inline-flex px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
              DEX Platform
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${
                    isActive(link.href)
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }
                `}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side: Wallet + User */}
          <div className="flex items-center gap-3">
            <WalletButton />
            
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-400 text-sm">{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all
                ${
                  isActive(link.href)
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }
              `}
            >
              <span>{link.icon}</span>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;

