import { FilePickerResult, ShowFilePickerOptions } from './common';
export * from './common';

export declare const showFilePicker: (
  options?: ShowFilePickerOptions
) => Promise<FilePickerResult | null>;
