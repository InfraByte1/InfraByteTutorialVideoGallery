import React from "react";
import logo from '../Assets/images/mywebsite.png'

function Footer() {
  return (
    <footer>
      <div className="container footer-container">
        <p>
          <a href="#">
            <img src={logo} alt="logo" width="100" hight="100" />
          </a>
        </p>
        <p>
          <strong>
            Powered by <a href="https://infrabyte.com.au/">Infrabyte</a>
          </strong>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
