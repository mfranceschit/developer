import React, { ReactNode } from 'react';

const AnimatedTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <h1 className="animated-text typewriter-animation">{children}</h1>;
};

export default AnimatedTitle;
