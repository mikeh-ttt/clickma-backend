export async function encryptToken(
  token: string,
  secretKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    'AES-GCM',
    false,
    ['encrypt']
  );

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    keyMaterial,
    encoder.encode(token)
  );

  return `${Buffer.from(iv).toString('hex')}:${Buffer.from(
    encryptedData
  ).toString('hex')}`;
}
export async function decryptToken(
  encryptedString: string,
  secretKey: string
): Promise<string> {
  const [ivHex, encryptedDataHex] = encryptedString.split(':');
  if (!ivHex || !encryptedDataHex) {
    throw new Error('Invalid encrypted string format');
  }

  const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
  const encryptedData = Buffer.from(encryptedDataHex, 'hex');

  // Ensure the key is 128, 192, or 256 bits
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(secretKey);
  if (
    keyBytes.length !== 16 &&
    keyBytes.length !== 24 &&
    keyBytes.length !== 32
  ) {
    throw new Error('Invalid key length. Must be 128, 192, or 256 bits.');
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    'AES-GCM',
    false,
    ['decrypt']
  );

  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      keyMaterial,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
