export type CarrierType = 'image' | 'audio' | 'video';

export interface StegoMetadata {
  carrierType: CarrierType;
  encryptionMethod: 'AES-256-GCM' | 'RSA-OAEP';
  unlockTime: number; // timestamp
  vdfDifficulty: number;
  payloadSize: number;
  psnr?: number;
  snr?: number;
  ssim?: number;
}

export interface EncryptedPayload {
  ciphertext: string; // hex
  iv: string; // hex
  keyCapsule: string; // hex (VDF output)
  metadata: StegoMetadata;
}
