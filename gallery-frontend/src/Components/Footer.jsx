import React from "react";
import BrandLogo from "./BrandLogo";

function Footer() {
  return (
    <footer>
      <div className="container footer-container">
        <a
          href="https://infrabyte.com.au/"
          className="footer-logo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="InfraByte"
        >
          <BrandLogo surface="dark" />
        </a>

        <div className="footer-meta">
          <span>© {new Date().getFullYear()} InfraByte</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
