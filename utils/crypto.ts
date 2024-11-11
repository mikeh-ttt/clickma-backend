import { Buffer } from 'buffer';

const DELIMETER = ':';

export const encrypt = async (
  plain: string,
  secret: string
): Promise<string> => {
  if (!crypto) {
    throw new Error(
      'No WebAPI crypto module found. Do you call me in the right place?'
    );
  }

  // Generate a random 12-byte initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Set up the AES-GCM algorithm with the IV
  const alg = { name: 'AES-GCM', iv };

  // Generate a SHA-256 hash from the secret key
  const keyHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret)
  );

  // Encode the plaintext to be encrypted
  const encodedPlaintext = new TextEncoder().encode(plain);

  // Import the secret key for encryption
  const secretKey = await crypto.subtle.importKey('raw', keyHash, alg, false, [
    'encrypt',
  ]);

  // Encrypt the data
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    secretKey,
    encodedPlaintext
  );

  // Return the ciphertext and IV as base64-encoded strings
  return `${Buffer.from(ciphertext).toString(
    'base64'
  )}${DELIMETER}${Buffer.from(iv).toString('base64')}`;
};

export const decrypt = async (
  encrypted: string,
  secret: string
): Promise<string | null> => {
  if (!crypto) {
    throw new Error(
      'No WebAPI crypto module found. Do you call me in the right place?'
    );
  }

  // Split the encrypted data into ciphertext and IV parts
  const [ciphertextBase64, ivBase64] = encrypted.split(DELIMETER);

  if (!ciphertextBase64 || !ivBase64) {
    return null;
  }

  // Set up the AES-GCM algorithm with the IV
  const iv = Buffer.from(ivBase64, 'base64');
  const alg = { name: 'AES-GCM', iv };

  // Generate a SHA-256 hash from the secret key
  const keyHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret)
  );

  // Import the secret key for decryption
  const secretKey = await crypto.subtle.importKey('raw', keyHash, alg, false, [
    'decrypt',
  ]);

  try {
    // Decrypt the ciphertext
    const cleartext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      secretKey,
      Buffer.from(ciphertextBase64, 'base64')
    );

    // Return the decrypted data as a string
    return new TextDecoder().decode(cleartext);
  } catch (e) {
    return null;
  }
};
