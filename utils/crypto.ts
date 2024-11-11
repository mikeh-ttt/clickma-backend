const DELIMETER = ':';

import { Buffer } from 'buffer';

export const encryptData = async (plainData: string, encryptionKey: string) => {
  // Generate a random 96-bit initialization vector (IV)
  const initVector = crypto.getRandomValues(new Uint8Array(12));

  // Encode the data to be encrypted
  const encodedData = new TextEncoder().encode(plainData);

  // Prepare the encryption key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(encryptionKey, 'base64'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Encrypt the encoded data with the key
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: initVector,
    },
    cryptoKey,
    encodedData
  );

  return `${Buffer.from(encryptedData).toString(
    'base64'
  )}${DELIMETER}${Buffer.from(initVector).toString('base64')}`;
};

export const decryptData = async (
  encryptedString: string,
  encryptionKey: string
) => {
  const [encryptedDataBase64, ivBase64] = encryptedString.split(DELIMETER);

  if (!encryptedDataBase64 || !ivBase64) {
    throw new Error('Invalid encrypted data format');
  }

  const encryptedData = Buffer.from(encryptedDataBase64, 'base64');
  const initVector = Buffer.from(ivBase64, 'base64');

  // Prepare the decryption key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    Buffer.from(encryptionKey, 'base64'),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  try {
    // Decrypt the encrypted data using the key and IV
    const decodedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: initVector,
      },
      cryptoKey,
      encryptedData
    );

    // Decode and return the decrypted data
    return new TextDecoder().decode(decodedData);
  } catch (error) {
    return JSON.stringify({ payload: null });
  }
};
