// Header.js
import React from "react";
import { BASE_URL } from "../../constants/constants";

function Header() {
  const image = BASE_URL + "/api/images/logo.png";
  return (
    <header>
      <div className="logo">
        <a href="https://www.kasemrad.co.th/">
          <img src={image} alt="Kasemrad Logo" />
        </a>
      </div>
    </header>
  );
}

export default Header;
