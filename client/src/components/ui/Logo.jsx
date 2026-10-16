import React from 'react';

/**
 * The CULT emblem. The mark is an interlaced geometric knot with fine gold
 * texture, so it is used as a transparent PNG rather than re-traced as a path —
 * that keeps the brand exactly as designed at every size.
 */
export default function Logo({ size = 44, className = '', title = 'CULT' }) {
  return (
    <img
      src="/images/logo.png"
      alt={title}
      width={size}
      height={size}
      className={`logo-mark ${className}`.trim()}
      draggable="false"
    />
  );
}
