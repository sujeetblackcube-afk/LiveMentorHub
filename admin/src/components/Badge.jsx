
import React, { memo } from 'react';
import { theme } from '../theme';

const BADGE_STYLES = {
  success: { color: theme.colors.success },
  danger: { color: theme.colors.danger },
  warning: { color: '#F59E0B' },
  pending: { color: theme.colors.primary },
  default: { color: theme.colors.textSecondary },
};

const Badge = memo(function Badge({ text, type }) {
  return (
    <span className="text-md font-bold" style={BADGE_STYLES[type] || BADGE_STYLES.default}>
      {text}
    </span>
  );
});

export default Badge;


