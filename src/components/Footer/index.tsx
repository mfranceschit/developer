import React from 'react';

const Footer = () => {
  const networks = []

  return (
    <footer className="footer navbar-static-bottom">
        <div className="social-links">
          {networks.map((network) => {
              const { id, name, url } = network;
              return (
                <a
                  key={id}
                  href={url || 'https://github.com/cobidev/gatsby-simplefolio'}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label={name}
                >
                  <i className={`fa fa-${name || 'refresh'} fa-inverse`} />
                </a>
              );
            })}
        </div>
    </footer>
  );
};

export default Footer;
