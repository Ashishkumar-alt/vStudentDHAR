/**
 * Phone number masking utilities for privacy protection
 */

/**
 * Mask phone number for public display
 * Examples:
 * - "+919876543210" -> "+9198765****10"
 * - "9876543210" -> "98765****10"
 * - "+1234567890" -> "+123456****90"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Remove any non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  if (cleanPhone.length < 4) {
    return phone; // Too short to mask meaningfully
  }

  // Keep first 6 digits and last 2 digits, mask the middle
  const firstPart = cleanPhone.slice(0, 6);
  const lastPart = cleanPhone.slice(-2);
  const maskLength = cleanPhone.length - 8; // Total length minus visible digits
  const mask = '*'.repeat(Math.max(maskLength, 4)); // At least 4 asterisks

  return `${firstPart}${mask}${lastPart}`;
}

/**
 * Check if phone number is masked
 */
export function isPhoneMasked(phone: string): boolean {
  return phone.includes('*');
}

/**
 * Reveal full phone number (for authenticated users who click "Contact")
 * This would typically be done after user authentication verification
 */
export function revealPhoneNumber(phone: string, userHasPermission: boolean = false): string {
  if (!userHasPermission) {
    throw new Error("Unauthorized: You don't have permission to reveal phone numbers");
  }
  
  // In a real implementation, you would fetch the full phone number from your database
  // This function assumes the input is the full number when user has permission
  return phone;
}

/**
 * Format phone number for display (masked or full)
 */
export function formatPhoneNumber(phone: string, masked: boolean = true): string {
  if (!phone) return '';
  
  if (masked) {
    return maskPhoneNumber(phone);
  }
  
  return phone;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove any non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a valid international format
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Generate a safe display version of phone number
 * This is the main function to use in components
 */
export function getSafePhoneDisplay(phone: string, showFull: boolean = false): string {
  if (!phone) return '';
  
  if (showFull) {
    return formatPhoneNumber(phone, false);
  }
  
  return formatPhoneNumber(phone, true);
}

/**
 * Phone number visibility state management
 */
export interface PhoneVisibilityState {
  masked: boolean;
  revealed: boolean;
  phone: string;
}

/**
 * Create initial phone visibility state
 */
export function createPhoneVisibilityState(phone: string): PhoneVisibilityState {
  return {
    masked: true,
    revealed: false,
    phone: maskPhoneNumber(phone),
  };
}

/**
 * Reveal phone number (with permission check)
 */
export function revealPhoneWithPermission(
  state: PhoneVisibilityState, 
  fullPhone: string, 
  userIsAuthenticated: boolean = false
): PhoneVisibilityState {
  if (!userIsAuthenticated) {
    throw new Error("Authentication required to reveal phone number");
  }
  
  return {
    ...state,
    masked: false,
    revealed: true,
    phone: fullPhone,
  };
}
