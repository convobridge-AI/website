import { NavLink } from '@/components/NavLink';

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-bold text-lg mb-3 font-display">
              <span className="text-foreground">Convo</span>
              <span className="holo-text">Bridge</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AI calling agents that never sleep. Deploy in under 5 minutes.
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <a href="mailto:contactconvobridge@gmail.com" className="block hover:text-foreground transition-colors">
                contactconvobridge@gmail.com
              </a>
              <a href="tel:+919847493118" className="block hover:text-foreground transition-colors">
                +91 9847 493118
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <div className="space-y-2.5">
              <NavLink to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</NavLink>
              <NavLink to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</NavLink>
              <NavLink to="/careers" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</NavLink>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <div className="space-y-2.5">
              <NavLink to="/contact-us" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</NavLink>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <div className="space-y-2.5">
              <NavLink to="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Login</NavLink>
              <NavLink to="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</NavLink>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ConvoBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
