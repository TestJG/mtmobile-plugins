export interface DateSelectorOptions extends Options {
  defaultValue?: Date;
  minimumValue?: Date;
}

export interface TimeSelectorOptions extends Options {
  defaultValue?: number;
}

export interface DateTimeSelectorOptions extends Options {
  defaultValue?: Date;
}

interface Options {
  title?: string;
  message?: string;
  defaultValue?: Date | number;
  // Only for iOS
  okText: string;
  // Only for iOS
  cancelText: string;
}
