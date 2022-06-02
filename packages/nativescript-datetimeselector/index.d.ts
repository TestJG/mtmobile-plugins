import { DateSelectorOptions, DateTimeSelectorOptions, TimeSelectorOptions } from './common';

export declare const showDateSelector: (opts: DateSelectorOptions) => Promise<Date>;

export declare const showTimeSelector: (opts: TimeSelectorOptions) => Promise<number>;

export declare const showDateTimeSelector: (opts: DateTimeSelectorOptions) => Promise<Date>;
