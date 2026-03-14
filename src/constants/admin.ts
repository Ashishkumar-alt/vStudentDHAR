// Admin configuration
export const ADMIN_EMAIL = "vstudent343@gmail.com";

// Helper function to check if email is admin
export function isAdminEmail(email?: string): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
