import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-950 border-t border-brand-800/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
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
              <a href="tel:+201050101098" className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 hover:text-gold-400 transition-colors text-sm">
                <Phone className="w-3.5 h-3.5" />
                +20 10 5010 1098
              </a>
              <a href="tel:+201050101097" className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 hover:text-gold-400 transition-colors text-sm">
                <Phone className="w-3.5 h-3.5" />
                +20 10 5010 1097
              </a>
            </div>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-3">Locations</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 text-sm">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Gleem Bay, Alexandria
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-500 text-sm">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Montaza, Alexandria
              </div>
            </div>
          </div>
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
