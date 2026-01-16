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

export interface BreadCrumb {
  label: string;
  link: string;
}

export interface OptionsParams {
  param: string;
  params?: Record<string, any>;
  key: string;
  setter: (value: any) => void;
}
