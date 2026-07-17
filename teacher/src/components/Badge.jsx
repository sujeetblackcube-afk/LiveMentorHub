
import { theme } from '../theme';

function Badge({ text, type }) {
  const styles = {
    success: { color: theme.colors.success },
    danger: { color: theme.colors.danger },
    warning: { color: '#F59E0B' }, // Assuming warning color not in theme, using a standard yellow
    pending: { color: theme.colors.primary },
    default: { color: theme.colors.textSecondary },
  };

  return (
    <span className="text-md font-bold" style={styles[type] || styles.default}>
      • {text}
    </span>
  );
}

export default Badge;

