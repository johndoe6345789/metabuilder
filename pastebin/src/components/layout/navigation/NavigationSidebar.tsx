'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { navigationItems } from './navigation-items';
import { useNavigation } from './useNavigation';

/**
 * Material Design 3 Navigation Drawer
 *
 * Android-style modal navigation drawer with:
 * - Scrim overlay
 * - Slide-in animation
 * - Active indicator pill
 * - MD3 typography and spacing
 */
export function NavigationSidebar() {
  const { menuOpen, setMenuOpen } = useNavigation();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          {/* Scrim/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/32"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
            data-testid="navigation-sidebar-overlay"
          />

          {/* Navigation Drawer */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className={cn(
              "fixed left-0 top-0 h-screen w-80 z-50",
              "bg-[hsl(var(--card))]",
              "flex flex-col",
              "shadow-xl"
            )}
            data-testid="navigation-sidebar"
            id="navigation-sidebar"
            role="navigation"
            aria-label="Main navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border/50" data-testid="navigation-header">
              <span className="text-base font-medium text-foreground pl-3">
                CodeSnippet
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center justify-center",
                  "size-10 rounded-full",
                  "text-muted-foreground",
                  "hover:bg-foreground/[0.08]",
                  "active:bg-foreground/[0.12]",
                  "transition-colors duration-200",
                  "outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                aria-label="Close navigation"
                data-testid="navigation-sidebar-close-btn"
              >
                <X weight="bold" className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav
              role="navigation"
              className="flex-1 overflow-y-auto py-2 px-3"
              data-testid="navigation-items"
              aria-label="Navigation menu items"
            >
              <ul className="space-y-0.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <li key={item.path} data-testid={`nav-item-${item.path.replace(/\//g, '-')}`}>
                      <Link
                        href={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3",
                          "h-14 px-4 rounded-full",
                          "text-sm font-medium",
                          "transition-all duration-200",
                          "outline-none",
                          // State layer
                          "before:absolute before:inset-0 before:rounded-full",
                          "before:bg-current before:opacity-0 before:transition-opacity",
                          "hover:before:opacity-[0.08]",
                          "focus-visible:before:opacity-[0.12]",
                          "active:before:opacity-[0.12]",
                          // Active state
                          isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        data-testid={`nav-link-${item.path.replace(/\//g, '-')}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon
                          weight={isActive ? "fill" : "regular"}
                          className="size-6 relative z-10 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="relative z-10">{item.label}</span>

                        {/* Active indicator line */}
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute right-3 w-1 h-4 bg-primary rounded-full"
                            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50" data-testid="navigation-footer">
              <p className="text-xs text-muted-foreground text-center">
                Material Design 3
              </p>
            </div>

            {/* Android gesture bar indicator */}
            <div className="h-5 flex items-center justify-center pb-2" data-testid="gesture-bar" aria-hidden="true">
              <div className="w-[134px] h-[5px] bg-muted-foreground/40 rounded-full" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
