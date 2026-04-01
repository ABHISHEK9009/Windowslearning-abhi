import { Link } from 'react-router-dom';

const footerLinks = {
  'For Learners': [
    { label: 'Browse Mentors', to: '/mentors' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'My Dashboard', to: '/dashboard' },
    { label: 'Post Requirement', to: '/requirements/post' },
  ],
  'For Mentors': [
    { label: 'Become a Mentor', to: '/signup' },
    { label: 'Mentor Dashboard', to: '/mentor/dashboard' },
    { label: 'Earnings', to: '/mentor/earnings' },
    { label: 'Resources', to: '/blog' },
  ],
  'Company': [
    { label: 'About Us', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Contact', to: '/contact' },
  ],
  'Support': [
    { label: 'Help Center', to: '/help' },
    { label: 'Safety', to: '/safety' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-bold">
              Windows<span className="text-accent">Learning</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's most trusted live mentorship platform. Learn from verified experts, anytime.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h5 className="font-semibold text-sm mb-4">{title}</h5>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="container-main py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Windows Learning. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
