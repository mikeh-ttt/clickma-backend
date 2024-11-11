// import { encryptToken, decryptToken } from '../crypto';

// describe('Token Encryption/Decryption', () => {
//   // Valid test cases
//   describe('Valid scenarios', () => {
//     const testCases = [
//       {
//         name: 'simple string',
//         input: 'Hello, World!',
//         key: 'mysecretkey16bytes',
//       },
//       {
//         name: 'empty string',
//         input: '',
//         key: 'mysecretkey16bytes',
//       },
//       {
//         name: 'long string',
//         input: 'a'.repeat(1000),
//         key: 'mysecretkey16bytes',
//       },
//       {
//         name: 'special characters',
//         input: '!@#$%^&*()_+-=[]{}|;:,.<>?`~',
//         key: 'mysecretkey16bytes',
//       },
//       {
//         name: 'unicode characters',
//         input: '你好，世界！🌍✨',
//         key: 'mysecretkey16bytes',
//       },
//       {
//         name: 'JSON string',
//         input: JSON.stringify({ test: 'data', number: 123 }),
//         key: 'mysecretkey16bytes',
//       },
//     ];

//     test.each(testCases)(
//       'should encrypt and decrypt $name correctly',
//       async ({ input, key }) => {
//         const encrypted = await encryptToken(input, key);

//         // Basic validation of encrypted string format
//         expect(encrypted).toContain(':');
//         expect(encrypted.split(':').length).toBe(2);

//         const decrypted = await decryptToken(encrypted, key);
//         expect(decrypted).toBe(input);
//       }
//     );

//     test('should work with different valid key lengths', async () => {
//       const input = 'Test message';
//       const keys = {
//         '128bit': 'mysecretkey16bytes', // 16 bytes
//         '192bit': 'mysecretkey24byteslong123', // 24 bytes
//         '256bit': 'mysecretkey32byteslongversion123', // 32 bytes
//       };

//       for (const [keySize, key] of Object.entries(keys)) {
//         const encrypted = await encryptToken(input, key);
//         const decrypted = await decryptToken(encrypted, key);
//         expect(decrypted).toBe(input);
//       }
//     });
//   });

//   // Error cases
//   describe('Error scenarios', () => {
//     test('should throw on invalid key length', async () => {
//       const input = 'Test message';
//       const invalidKey = 'tooshort'; // Less than 16 bytes

//       await expect(encryptToken(input, invalidKey)).rejects.toThrow(
//         'Invalid key length'
//       );

//       const validEncrypted = await encryptToken(input, 'mysecretkey16bytes');
//       await expect(decryptToken(validEncrypted, invalidKey)).rejects.toThrow(
//         'Invalid key length'
//       );
//     });

//     test('should throw on invalid encrypted string format', async () => {
//       const invalidEncrypted = 'not-a-valid-format';
//       await expect(
//         decryptToken(invalidEncrypted, 'mysecretkey16bytes')
//       ).rejects.toThrow('Invalid encrypted string format');
//     });

//     test('should throw on tampered encrypted data', async () => {
//       const input = 'Test message';
//       const key = 'mysecretkey16bytes';

//       const encrypted = await encryptToken(input, key);
//       const [iv, data] = encrypted.split(':');

//       // Tamper with the encrypted data
//       const tamperedEncrypted = `${iv}:${data}abc`;

//       await expect(decryptToken(tamperedEncrypted, key)).rejects.toThrow();
//     });

//     test('should throw on wrong key', async () => {
//       const input = 'Test message';
//       const key1 = 'mysecretkey16bytes';
//       const key2 = 'differentkey16byte';

//       const encrypted = await encryptToken(input, key1);
//       await expect(decryptToken(encrypted, key2)).rejects.toThrow();
//     });
//   });

//   // Performance tests
//   describe('Performance', () => {
//     test('should handle concurrent operations', async () => {
//       const input = 'Test message';
//       const key = 'mysecretkey16bytes';
//       const iterations = 100;

//       const promises = Array.from({ length: iterations }, async () => {
//         const encrypted = await encryptToken(input, key);
//         const decrypted = await decryptToken(encrypted, key);
//         return decrypted;
//       });

//       const results = await Promise.all(promises);
//       results.forEach((result) => expect(result).toBe(input));
//     });

//     test('should handle large data', async () => {
//       const input = 'a'.repeat(1000000); // 1MB of data
//       const key = 'mysecretkey16bytes';

//       const encrypted = await encryptToken(input, key);
//       const decrypted = await decryptToken(encrypted, key);
//       expect(decrypted).toBe(input);
//     }, 10000); // Increase timeout for large data test
//   });

//   // Deterministic tests
//   describe('Deterministic behavior', () => {
//     test('should generate different ciphertexts for same input', async () => {
//       const input = 'Test message';
//       const key = 'mysecretkey16bytes';

//       const encrypted1 = await encryptToken(input, key);
//       const encrypted2 = await encryptToken(input, key);

//       expect(encrypted1).not.toBe(encrypted2);
//     });
//   });
// });
