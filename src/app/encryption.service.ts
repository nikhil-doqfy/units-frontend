import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
  private iv = CryptoJS.enc.Utf8.parse('1234567890123456');

  encrypt(data: any): string {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(raw, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return 'ENC:' + encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  decrypt(cipherText: string): any {
    if (!cipherText?.startsWith('ENC:')) return cipherText;

    const base64 = cipherText.replace('ENC:', '');

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(base64) } as any,
      this.key,
      {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const text = decrypted.toString(CryptoJS.enc.Utf8);

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
