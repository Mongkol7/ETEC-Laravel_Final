/**
 * Get user initials from name/email
 * @param {object} user - User object with name/email
 * @returns {string} 1-2 character initials
 */
export function getUserInitials(user) {
  if (!user) return 'G';

  const displayName = user.name || user.username || user.email || '';
  return (
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

/**
 * Get user display name
 * @param {object} user - User object
 * @returns {string} User's display name
 */
export function getUserDisplayName(user) {
  if (!user) return 'Guest';
  return user.name || user.username || user.email || 'User';
}

/**
 * Get user avatar (prefer image_url, fallback to initials)
 * @param {object} user - User object
 * @returns {object} {type: 'image' | 'initials', value: string}
 */
export function getUserAvatar(user) {
  if (!user) return { type: 'initials', value: 'G' };

  if (user.image_url) {
    return { type: 'image', value: user.image_url };
  }

  return { type: 'initials', value: getUserInitials(user) };
}
