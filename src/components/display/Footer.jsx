// Footer.jsx
// Displays the footer with sponsor logos

import React from 'react';
import { useLayout } from '../core/LayoutManager';
import '../../styles/components/Footer.css';

function Footer({ visible }) {
  const { displayType } = useLayout();
  
  if (!visible) {
    return null;
  }

  return (
    <div className={`footer ${displayType}`}>
      <div className="footer-content">
        <img 
          src="/assets/footer.png" 
          alt="Sponsors" 
          className="sponsor-logo"
        />
      </div>
    </div>
  );
}

export default Footer;