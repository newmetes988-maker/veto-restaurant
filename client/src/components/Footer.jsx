import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { api } from '../utils/api';

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const socialIcons = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
};

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/public', false)
      .then((data) => {
        if (data.status === 'success') {
          setSettings(data.data);
        }
      })
      .catch(() => {
        // silently fail, fallback to defaults
      });
  }, []);

  const socialLinks = settings?.socialLinks || {};
  const contactPhones = settings?.contactPhones || [];
  const contactEmail = settings?.contactEmail || '';
  const address = settings?.address || '';

  const hasSocial = Object.values(socialLinks).some((url) => url && url.trim() !== '');

  return (
    <footer className="bg-brand-950 border-t border-brand-800/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-lg text-white mb-2">Veto Café & Restaurant</h3>
            <p className="text-brand-500 text-sm leading-relaxed">
              Fine dining, crafted cocktails, and unforgettable experiences in the heart of Alexandria.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-3">Contact</h4>
            <div className="space-y-2">
              {contactPhones.length > 0 ? (
                contactPhones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:+2${phone.replace(/^0/, '')}`}
                    className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 hover:text-gold-400 transition-colors text-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    +20 {phone.replace(/^0/, '')}
                  </a>
                ))
              ) : (
                <>
                  <a href="tel:+201050101098" className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 hover:text-gold-400 transition-colors text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    +20 10 5010 1098
                  </a>
                  <a href="tel:+201050101097" className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 hover:text-gold-400 transition-colors text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    +20 10 5010 1097
                  </a>
                </>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 hover:text-gold-400 transition-colors text-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {contactEmail}
                </a>
              )}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-3">Locations</h4>
            <div className="space-y-2">
              {address ? (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 text-sm">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {address}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    Gleem Bay, Alexandria
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    Montaza, Alexandria
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social */}
          {hasSocial && (
            <div>
              <h4 className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-3">Follow Us</h4>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {Object.entries(socialLinks).map(([key, url]) => {
                  if (!url || !url.trim()) return null;
                  const Icon = socialIcons[key];
                  if (!Icon) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-brand-800/50 border border-brand-700/50 flex items-center justify-center text-brand-400 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/10 transition-all"
                      title={key}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-brand-800/20 text-center">
          <p className="text-brand-600 text-xs">
            © {new Date().getFullYear()} Veto Café & Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
