import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-40 glass-nav">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="font-bold text-lg hover:opacity-80 transition-opacity font-display">
          <span className="text-foreground">Convo</span>
          <span className="holo-text">Bridge</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          {[
            { to: "/", label: "Home" },
            { to: "/pricing", label: "Pricing" },
            { to: "/about", label: "About" },
            { to: "/contact-us", label: "Contact" },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <NavLink to="/login">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Login</span>
          </NavLink>
          <NavLink to="/dashboard">
            <Button size="sm" className="rounded-xl px-5 bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_-5px_hsla(217,91%,50%,0.3)]">
              Get Started
            </Button>
          </NavLink>
        </div>

        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-card border-t border-border">
          <div className="px-6 py-4 space-y-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/pricing', label: 'Pricing' },
              { to: '/about', label: 'About' },
              { to: '/contact-us', label: 'Contact' },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block text-sm py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2">
              <NavLink to="/login" className="w-full" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">Login</Button>
              </NavLink>
              <NavLink to="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Get Started</Button>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
