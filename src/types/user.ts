/**
 * User type definitions for authentication.
 *
 * Kept minimal: only email + password auth is supported.
 * No roles, permissions, or profile data (YAGNI).
 */

/**
 * User entity - represents a registered user.
 * Password hash is never exposed to the client.
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

/**
 * Safe user object without sensitive data.
 * This is what gets stored in session/returned to client.
 */
export interface SafeUser {
  id: number;
  email: string;
}

/**
 * Input for user registration.
 */
export interface RegisterInput {
  email: string;
  password: string;
}

/**
 * Input for user login.
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Session data stored in cookie.
 */
export interface SessionData {
  userId: number;
  email: string;
}
