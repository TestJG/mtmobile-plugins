export interface FilePickerResult {
  path: string;
  name: string;
  mime?: string;
}

export interface ShowFilePickerOptions {
  // Only for Android
  chooserTitle: string;
}

const defaultOptions: ShowFilePickerOptions = {
  chooserTitle: '',
};

export const parseOptions = (options?: ShowFilePickerOptions) => {
  if (!options) return defaultOptions;
  return options;
};

export const octetStreamMime = 'application/octet-stream';
