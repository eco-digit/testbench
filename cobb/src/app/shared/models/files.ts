import { FileType } from '@enums/file-type.enum';

export interface BaseFile {
  id: string;
  fileName: string;
  originalFileName: string;
  customFileName: string;
  mimeType: string;
  fileType: FileType;
  description: string;
  creationTime: string;
  defaultFile: boolean;
}

export interface ApplicationFile {
  id: string;
  fileName: string;
  originalFileName: string;
  customFileName: string;
  mimeType: string;
  fileType: string;
  description: string;
  creationTime: string;
  defaultFile: boolean;
}

export interface FilesTableData {
  name: string;
  uploaded: string;
  default?: boolean;
  description?: string;
}

export type InfrastructureDefinition = {
  name: string;
  content: string;
  template?: string;
};
