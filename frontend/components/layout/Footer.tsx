/**
 * PaiiD 2MX - Footer Component
 * 
 * Consistent footer with links and copyright
 */

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Platform Info */}
          <div>
            <h3 className="text-white font-semibold mb-3">PaiiD 2MX</h3>
            <p className="text-slate-400 text-sm">
              Decentralized exchange trading platform with multi-chain support and zero monthly costs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dex-demo" className="text-slate-400 text-sm hover:text-blue-400 transition-colors">
                  DEX Swap
                </Link>
              </li>
              <li>
                <Link href="/market-demo" className="text-slate-400 text-sm hover:text-blue-400 transition-colors">
                  Market Data
                </Link>
              </li>
              <li>
                <Link href="/wallet-demo" className="text-slate-400 text-sm hover:text-blue-400 transition-colors">
                  Wallet Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/SCPrime/PaiiD-2mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-blue-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-slate-400 text-sm hover:text-blue-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://paiid-2mx-backend.onrender.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-blue-400 transition-colors"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-700/50 text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} Dr. SC Prime. All Rights Reserved. | PaiiD 2MX - DEX Trading Platform
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Proprietary and Confidential - Unauthorized copying or distribution prohibited
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

