import { Buffer } from 'buffer';

// Constants for better maintainability
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96-bits for AES-GCM
const ENCODING = 'hex';
const DELIMITER = ':';
const VALID_KEY_LENGTHS = [16, 24, 32];

interface CryptoConfig {
  name: typeof ALGORITHM;
  iv: Uint8Array;
}

/**
 * Validates the secret key length
 * @throws {Error} if key length is invalid
 */
function validateKeyLength(keyBytes: Uint8Array): void {
  if (!VALID_KEY_LENGTHS.includes(keyBytes.length)) {
    throw new Error(
      `Invalid key length. Must be ${VALID_KEY_LENGTHS.join(
        ', '
      )} bytes (${VALID_KEY_LENGTHS.map((x) => x * 8).join(', ')} bits)`
    );
  }
}

/**
 * Creates a crypto key from the secret key
 */
async function createCryptoKey(
  keyBytes: Uint8Array,
  usage: KeyUsage
): Promise<CryptoKey> {
  return await crypto.subtle.importKey('raw', keyBytes, ALGORITHM, false, [
    usage,
  ]);
}

/**
 * Encrypts a plaintext string using AES-GCM
 * @throws {Error} if encryption fails or key length is invalid
 */
export async function encryptToken(
  plainText: string,
  secretKey: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const keyBytes = encoder.encode(secretKey);

    // Validate key length
    validateKeyLength(keyBytes);

    // Create crypto key
    const keyMaterial = await createCryptoKey(keyBytes, 'encrypt');

    // Encrypt the data
    const config: CryptoConfig = { name: ALGORITHM, iv };
    const encryptedData = await crypto.subtle.encrypt(
      config,
      keyMaterial,
      encoder.encode(plainText)
    );

    // Format the result
    return [
      Buffer.from(iv).toString(ENCODING),
      Buffer.from(encryptedData).toString(ENCODING),
    ].join(DELIMITER);
  } catch (error) {
    throw new Error(
      `Encryption failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Decrypts an encrypted string using AES-GCM
 * @throws {Error} if decryption fails, format is invalid, or key length is invalid
 */
export async function decryptToken(
  encryptedString: string,
  secretKey: string
): Promise<string> {
  try {
    // Parse encrypted string
    const [ivHex, encryptedDataHex] = encryptedString.split(DELIMITER);
    if (!ivHex || !encryptedDataHex) {
      throw new Error('Invalid encrypted string format');
    }

    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(secretKey);

    // Validate key length
    validateKeyLength(keyBytes);

    // Convert hex strings to buffers
    const iv = new Uint8Array(Buffer.from(ivHex, ENCODING));
    const encryptedData = Buffer.from(encryptedDataHex, ENCODING);

    // Create crypto key
    const keyMaterial = await createCryptoKey(keyBytes, 'decrypt');

    // Decrypt the data
    const config: CryptoConfig = { name: ALGORITHM, iv };
    const decryptedData = await crypto.subtle.decrypt(
      config,
      keyMaterial,
      encryptedData
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    throw new Error(
      `Decryption failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
