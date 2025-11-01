/**
 * Attendance Card Component
 */

/**
 * Create an attendance stat card
 * @param {Object} data - Card data
 * @param {string} data.title - Card title
 * @param {string|number} data.value - Main value to display
 * @param {string} data.icon - Icon class or emoji
 * @param {string} data.color - Color variant (primary, success, danger, warning)
 * @param {string} data.trend - Trend indicator (up, down, neutral)
 * @returns {HTMLElement}
 */
export function createAttendanceCard({
  title,
  value,
  icon = '📊',
  color = 'primary',
  trend = null,
}) {
  const card = document.createElement('div');
  card.className = `card shadow-sm attendance-card attendance-card--${color}`;

  const colorClasses = {
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  card.className = `card shadow-sm ${colorClasses[color] || colorClasses.primary}`;

  const iconElement =
    typeof icon === 'string' && icon.length === 1
      ? `<span class="icon-large">${icon}</span>`
      : `<i class="${icon}"></i>`;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

  card.innerHTML = `
    <div class="card-body p-6">
      <div class="flex-between mb-2">
        <div class="icon-large">${iconElement}</div>
        ${trend ? `<span class="text-muted text-sm">${trendIcon}</span>` : ''}
      </div>
      <h3 class="text-3xl font-bold mb-2 text-primary">
        ${value}
      </h3>
      <p class="text-sm text-secondary">
        ${title}
      </p>
    </div>
  `;

  return card;
}
