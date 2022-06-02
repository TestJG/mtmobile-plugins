export interface FilePickerResult {
  path: string;
  name: string;
  mime?: string;
}

export interface ShowFilePickerOptions {
  // Only for Android
  chooserTitle?: string;
}
