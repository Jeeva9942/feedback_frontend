import { useAuth } from '@/context/AuthContext';
import { LogOut, Phone, Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { motion } from 'framer-motion';
import nptcLogo from '@/assets/nptc_logo_new.png';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  // Hide user info and logout button on the login page even if a session exists
  const showUser = user && !isLoginPage;

  return (
    <div className="no-print">
      {/* Top dark bar - matches nptc.ac.in */}
      <div className="bg-primary text-primary-foreground text-xs sm:text-sm py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">

          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 md:gap-5 w-full sm:w-auto text-[10px] sm:text-xs md:text-sm">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Phone size={11} className="sm:w-[13px] sm:h-[13px]" />
              91-4259-236030, 236040, 236050
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Mail size={11} className="sm:w-[13px] sm:h-[13px]" />
              <span className="sm:hidden">nptc.ac.in</span>
              <span className="hidden sm:inline">principal@nptc.ac.in</span>
            </span>
          </div>

          {showUser && (
            <span className="text-primary-foreground/70 text-xs font-medium">
              {user.role === 'student' ? `${user.name} · ${user.rollNo}` : 'Administrator'}
            </span>
          )}

        </div>
      </div>

      {/* Main header - white with logo, matching nptc.ac.in style */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card border-b border-border shadow-sm pb-2 sm:pb-0"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-2 md:py-1 flex items-start sm:items-center justify-between">

          <div className="flex flex-row items-center gap-4 sm:gap-4 md:gap-5 w-full sm:w-auto">
            <img
              src={nptcLogo}
              alt="Nachimuthu Polytechnic College Logo"
              className="h-28 w-28 sm:h-28 sm:w-auto md:h-32 lg:h-40 xl:h-44 object-contain flex-shrink-0 transition-all duration-300"
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] leading-tight sm:text-lg md:text-2xl lg:text-3xl font-display font-bold text-primary pb-1 sm:pb-0">
                Nachimuthu Polytechnic College
              </h1>

              {/* Mobile Text */}
              <p className="sm:hidden text-[12px] text-primary/80 leading-tight mt-1">
                Govt. Aided • Autonomous • AICTE Approved
              </p>
              <p className="sm:hidden text-[11px] text-muted-foreground leading-tight mt-0.5">
                Affiliated to DOTE, Tamilnadu
              </p>

              {/* Desktop Text */}
              <p className="hidden sm:block text-[11px] sm:text-sm md:text-base text-primary/80 leading-snug mt-1">
                Government Aided • Autonomous Institution • Approved by AICTE, New Delhi
              </p>
              <p className="hidden sm:block text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-snug mt-0.5">
                Affiliated to State Board of Technical Education & Training, Tamilnadu
              </p>

              <p className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground italic mt-1.5 sm:mt-1">
                (A Division of NIA Educational Institutions)
              </p>
            </div>

          </div>

          {showUser && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex-shrink-0"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          )}

        </div>
      </motion.header>
    </div>
  );
}
