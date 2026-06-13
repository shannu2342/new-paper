import React from 'react';
import logo from '../assets/greater-today-logo.png';

const Logo = () => {
  return <img className="brand-logo" src={logo} alt="Greater Today" width="92" height="92" decoding="async" fetchPriority="high" />;
};

export default Logo;
