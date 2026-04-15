/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return bufToHex(exported);
}

export async function importKey(hex: string): Promise<CryptoKey> {
  const buf = hexToBuf(hex);
  return await window.crypto.subtle.importKey(
    'raw',
    buf,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(message: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);
  
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return {
    ciphertext: bufToHex(ciphertext),
    iv: bufToHex(iv),
  };
}

export async function decryptMessage(ciphertextHex: string, ivHex: string, key: CryptoKey): Promise<string> {
  try {
    const ciphertext = hexToBuf(ciphertextHex);
    const iv = hexToBuf(ivHex);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('Decryption error details:', err);
    if (err instanceof Error) {
      throw new Error(`Decryption failed: ${err.message || 'The key or payload might be corrupted.'}`);
    }
    throw new Error('Decryption failed: The key or payload might be corrupted.');
  }
}

// Helpers
export function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}
