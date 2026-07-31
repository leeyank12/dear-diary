import React from 'react';

export default function AnimatedBackground({ children }) {
  return (
    <div className="animated-bg-wrapper">
      <div className="animated-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>
      <div className="grid-overlay" />
      {children}
    </div>
  );
}
