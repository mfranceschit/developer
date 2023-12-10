import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

import { Badge } from '@/types';

const badgeVariants = {
  selected: {
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.35 },
    zIndex: 1,
    boxShadow:
      'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
  },
  notSelected: {
    rotateY: 180,
    zIndex: 1,
    boxShadow:
      'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
    transition: { duration: 0.35 },
  },
};
const Badges: React.FC<{ entries: Badge[] }> = ({ entries }) => {
  const { locale } = useRouter();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const selectBadge = (badge: Badge) => {
    if (badge.id === selectedBadge?.id) {
      setSelectedBadge(null);
    } else {
      setSelectedBadge(badge);
    }
  };

  useEffect(() => {
    if (selectedBadge) {
      setSelectedBadge(null);
    }
  }, [locale]);

  return (
    <div className="badges-container">
      {entries.map((badge, i) => (
        <motion.div
          key={i}
          className="badge"
          variants={badgeVariants}
          animate={selectedBadge?.id !== badge.id ? 'selected' : 'notSelected'}
          onClick={() => selectBadge(badge)}>
          {selectedBadge?.id !== badge.id ? (
            <Image
              height={100}
              width={100}
              src={`/assets/images/${badge.img}`}
              alt={badge.name}
            />
          ) : (
            <div className="badge-details">
              <div className="badge-title">
                <h5>{badge.name}</h5>
                {badge.url && (
                  <a href={badge.url} rel="noopener noreferrer" target="_blank">
                    <FaArrowUpRightFromSquare />
                  </a>
                )}
              </div>
              <p className="engraved-text">{badge.issued}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Badges;
