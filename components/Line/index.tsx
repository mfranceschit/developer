import React from 'react';

const CLASSNAME: { [position: string]: string } = {
  top: 'top',
  bottom: 'bottom',
  right: 'right',
  left: 'left',
};

const Line = ({ position }: { position: string }) => {
  return <div className={`line ${CLASSNAME[position]}`} />;
};

export default Line;
