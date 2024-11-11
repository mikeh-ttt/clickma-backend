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
  const encoder = new TextEncoder();
  const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
  const encryptedData = Buffer.from(encryptedDataHex, 'hex');
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    'AES-GCM',
    false,
    ['decrypt']
  );

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
}
