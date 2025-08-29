import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Container from './ui/Container';

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    services: [
      { name: 'Browse Deals', href: '/deals' },
      { name: 'Find Partners', href: '/partners' },
      { name: 'Membership Plans', href: '/membership' },
      { name: 'Gift Cards', href: '/gift-cards' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
  ];

  return (
    <footer className="bg-neutral-black/90 backdrop-blur-lg border-t border-white/10 text-white">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-royal-gold rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-white font-display font-bold text-xl">
                  Go Save
                </span>
              </div>
              <p className="text-neutral-grey text-sm leading-relaxed">
                Your gateway to exclusive local deals and discounts. Save big while supporting local businesses.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-neutral-grey hover:text-royal-gold transition-colors duration-320"
                      aria-label={social.name}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-grey hover:text-royal-gold transition-colors duration-320 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-grey hover:text-royal-gold transition-colors duration-320 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 mb-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-grey hover:text-royal-gold transition-colors duration-320 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-neutral-grey text-sm">
                  <Mail size={16} />
                  <span>support@gosave.com</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-grey text-sm">
                  <Phone size={16} />
                  <span>+92 300 1234567</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-grey text-sm">
                  <MapPin size={16} />
                  <span>Islamabad, Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-neutral-grey text-sm">
              © 2025 Go Save. All rights reserved.
            </p>
            <p className="text-neutral-grey text-sm">
              Made with ❤️ for local businesses
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
