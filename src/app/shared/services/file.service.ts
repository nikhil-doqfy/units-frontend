import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}

  getFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 KB';
    if (!bytes) return '';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const value = bytes / Math.pow(1024, i);

    return `${value.toFixed(2)} ${sizes[i]}`;
  }
}
