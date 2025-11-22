export interface PageSizeChange {
  componentName?: string;
  pageSize: number;
}

export interface PageChange {
  componentName?: string;
  currentPage: number;
}

export interface UploadFileModel {
  tempId?: number;
  id?: number;
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  base64?: string;
  errorMessage?: string;
}
