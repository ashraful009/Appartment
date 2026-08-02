import React from "react";

const HomeFooter = () => {
  return (
    <footer className="w-[min(1600px,calc(100%-4rem))] mx-auto mb-8 p-8 lg:p-12 bg-[#1f2937] text-white rounded-[30px] shadow-xl" id="footer">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-4">
          <a className="inline-flex items-center gap-3 font-bold text-white text-xl" href="#home">
            <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white shadow-lg">
              N
            </span>
            <span className="flex flex-col leading-tight">
              <strong>Nirapad Nibash</strong>
              <small className="text-gray-400 text-xs font-normal">Premium Living</small>
            </span>
          </a>
          <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
            Premium homes with refined design, lasting comfort, and trusted service.
          </p>
        </div>

        
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#properties" className="hover:text-white transition-colors">Property</a></li>
            <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#footer" className="hover:text-white transition-colors">Sign Up</a></li>
          </ul>
        </div>

        
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Contact</h3>
          <div className="space-y-1.5 text-sm text-gray-300">
            <p><a href="mailto:hello@nirapadnibash.com" className="hover:text-white transition-colors">hello@nirapadnibash.com</a></p>
            <p><a href="tel:+8801700000000" className="hover:text-white transition-colors">+880 1700 000 000</a></p>
            <p>Dhaka, Bangladesh</p>
          </div>
        </div>

        
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Follow</h3>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="inline-grid place-items-center w-10 h-10 rounded-full bg-white/10 text-white font-bold hover:bg-[#2563eb] transition-colors"
            >
              f
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="inline-grid place-items-center w-10 h-10 rounded-full bg-white/10 text-white font-bold hover:bg-[#2563eb] transition-colors"
            >
              in
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="inline-grid place-items-center w-10 h-10 rounded-full bg-white/10 text-white font-bold hover:bg-[#2563eb] transition-colors"
            >
              ig
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
        <p>© 2026 Nirapad Nibash. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default HomeFooter;
