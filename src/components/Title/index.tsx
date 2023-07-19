import React, { ReactNode } from 'react';

const Title = ({ children }: { children: ReactNode }) => (
  <h1 className="main-title">{children}</h1>
);

export default Title;
