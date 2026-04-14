import bcrypt from "bcrypt";
import { query } from "./db";
import { User, SafeUser, RegisterInput, LoginInput } from "@/types";

/**
 * Authentication library - handles user registration and login.
 *
 * Design decisions:
 * - bcrypt for password hashing (industry standard, includes salt)
 * - Cost factor 12: good balance of security and performance
 * - Emails stored lowercase for case-insensitive matching
 * - No password requirements enforced here (keep it simple)
 */

const BCRYPT_COST = 12;

/**
 * Converts a User to SafeUser (removes password_hash).
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Registers a new user.
 * Returns SafeUser on success, null if email already exists.
 */
export async function registerUser(
  input: RegisterInput
): Promise<SafeUser | null> {
  const email = input.email.toLowerCase().trim();

  // Check if user already exists
  const existing = await query<User>("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (existing.rows.length > 0) {
    return null; // Email already registered
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  // Insert user
  const result = await query<User>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, created_at`,
    [email, passwordHash]
  );

  return toSafeUser(result.rows[0]);
}

/**
 * Authenticates a user with email and password.
 * Returns SafeUser on success, null on failure.
 */
export async function authenticateUser(
  input: LoginInput
): Promise<SafeUser | null> {
  const email = input.email.toLowerCase().trim();

  // Find user by email
  const result = await query<User>(
    `SELECT id, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    return null; // User not found
  }

  // Verify password
  const isValid = await bcrypt.compare(input.password, user.password_hash);
  if (!isValid) {
    return null; // Wrong password
  }

  return toSafeUser(user);
}

/**
 * Gets a user by ID.
 * Used for session validation.
 */
export async function getUserById(id: number): Promise<SafeUser | null> {
  const result = await query<User>(
    `SELECT id, email, password_hash, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  const user = result.rows[0];
  return user ? toSafeUser(user) : null;
}
