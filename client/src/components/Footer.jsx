import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-low dark:bg-[#151F30] py-space-lg mt-auto border-t border-outline-variant/30 dark:border-[#29364A]">
      <div className="w-full px-margin flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant dark:text-[#A8B5CA]">
        <div className="flex items-center gap-space-sm">
          <span className="font-headline-sm text-headline-sm text-primary dark:text-[#4D8DFF] font-bold">
            FINDIT
          </span>
          <span className="font-body-sm text-body-sm">
            © 2026 FINDIT. All rights reserved.
          </span>
        </div>
        <nav aria-label="Footer Links" className="flex flex-wrap items-center gap-space-lg">
          <Link
            to="/help"
            className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] hover:text-primary dark:hover:text-[#4D8DFF] transition-colors"
          >
            Help Center
          </Link>
          <Link
            to="/support"
            className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] hover:text-primary dark:hover:text-[#4D8DFF] transition-colors"
          >
            Contact Support
          </Link>
          <Link
            to="/privacy"
            className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] hover:text-primary dark:hover:text-[#4D8DFF] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] hover:text-primary dark:hover:text-[#4D8DFF] transition-colors"
          >
            Terms and Conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
};
