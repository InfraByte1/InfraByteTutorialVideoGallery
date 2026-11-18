import React from "react";
import logo from "../Assets/images/nonon.png";

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
          <img src={logo} alt="InfraByte" />
        </a>

        <div className="footer-meta">
          <span>© {new Date().getFullYear()} InfraByte</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
