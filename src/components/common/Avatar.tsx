import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Pastel background palette for initials fallback
const AVATAR_COLORS = [
  { bg: '#e0e7ff', text: '#3730a3' },
  { bg: '#dcfce7', text: '#166534' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#fae8ff', text: '#86198f' },
  { bg: '#e0f2fe', text: '#075985' },
  { bg: '#ffe4e6', text: '#9f1239' },
  { bg: '#f3e8ff', text: '#6b21a8' },
  { bg: '#ccfbf1', text: '#115e59' }
];

const getInitials = (name: string): string => {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorByName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 36,
  className = '',
  style = {}
}) => {
  const [hasError, setHasError] = useState(false);

  const colorScheme = getColorByName(name);
  const initials = getInitials(name);

  if (!src || hasError) {
    return (
      <div
        className={`avatar-fallback ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: colorScheme.bg,
          color: colorScheme.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${Math.max(10, Math.floor(size * 0.38))}px`,
          userSelect: 'none',
          flexShrink: 0,
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
          ...style
        }}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style
      }}
    />
  );
};
