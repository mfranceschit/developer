import React from 'react';
import { usePathname } from 'next/navigation';

import SocialButtons from '@/components/SocialButtons';
import { ROUTES } from '@/routes';

const Footer = () => {
  const path = usePathname();
  return (
    <footer className="footer">
      {path !== ROUTES.contact && <SocialButtons size={24} />}
    </footer>
  );
};

export default Footer;
