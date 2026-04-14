import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Centralized encryption/decryption for sensitive data.
 *
 * Design decisions:
 * - AES-256-GCM: Industry standard, authenticated encryption
 * - Key from environment: Never hardcoded, rotatable
 * - IV stored with ciphertext: Required for decryption
 * - Base64 encoding: Safe for database storage
 *
 * Trade-offs:
 * - Encrypted data cannot be searched in DB (acceptable for descriptions/comments)
 * - Slight storage overhead (~40 bytes per encrypted value)
 * - CPU overhead is minimal for small text
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM standard
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Gets and validates the encryption key from environment.
 * Key must be exactly 32 bytes (256 bits) for AES-256.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not set. " +
        "Generate a 32-byte key with: openssl rand -base64 32"
    );
  }

  // Support both raw 32-char keys and base64-encoded keys
  const keyBuffer = Buffer.from(key, "base64");

  if (keyBuffer.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be 32 bytes (256 bits). Got ${keyBuffer.length} bytes. ` +
        "Generate with: openssl rand -base64 32"
    );
  }

  return keyBuffer;
}

/**
 * Encrypts a plaintext string.
 *
 * Output format: base64(IV + authTag + ciphertext)
 * This bundles everything needed for decryption into one string.
 *
 * @param plaintext - Text to encrypt
 * @returns Base64-encoded encrypted data
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext; // Don't encrypt empty strings

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine: IV (12) + authTag (16) + ciphertext (variable)
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString("base64");
}

/**
 * Decrypts an encrypted string.
 *
 * @param encryptedData - Base64-encoded encrypted data from encrypt()
 * @returns Original plaintext
 * @throws Error if decryption fails (wrong key, tampered data)
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData; // Handle empty strings

  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, "base64");

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Checks if a string appears to be encrypted.
 * Useful for migrating existing unencrypted data.
 *
 * Heuristic: Valid encrypted data is base64 and has minimum length
 * (IV + authTag + at least 1 byte of ciphertext = 29+ bytes)
 */
export function isEncrypted(data: string): boolean {
  if (!data || data.length < 40) return false; // 29 bytes = ~40 chars in base64

  try {
    const decoded = Buffer.from(data, "base64");
    // Check if it re-encodes to the same base64 (valid base64 test)
    return decoded.toString("base64") === data && decoded.length >= 29;
  } catch {
    return false;
  }
}
