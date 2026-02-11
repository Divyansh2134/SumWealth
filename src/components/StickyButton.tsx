import React from 'react';
import '../styles/StickyButton.css';

interface StickyButtonProps {
  onClick: () => void;
}

export const StickyButton: React.FC<StickyButtonProps> = ({ onClick }) => {
  return (
    <button
      className="sticky-button"
      onClick={onClick}
      aria-label="Add new calculator"
    >
      +
    </button>
  );
};
