import { DateSelectorOptions, TimeSelectorOptions, DateTimeSelectorOptions } from './common';
import { Application } from '@nativescript/core';

export const showDateTimeSelector = (opts: DateTimeSelectorOptions) =>
  showDateSelector({ ...opts, message: '1/2' })
    .then((date) => {
      if (date) {
        let defTime = getSecondsFromDate(date);
        if (opts.defaultValue) {
          defTime = getSecondsFromDate(opts.defaultValue);
        }
        const options: TimeSelectorOptions = {
          defaultValue: defTime,
          title: opts.title,
          okText: '',
          cancelText: '',
        };
        return showTimeSelector({ ...options, message: '2/2' }).then((time) => {
          if (time) {
            date.setSeconds(time);
          }
          return date;
        });
      }
      return null;
    })
    .catch((e) => {
      console.log('ERROR showDateTimeSelector: ' + e);
      return null;
    });

export const showTimeSelector = (opts: TimeSelectorOptions) => {
  let resolve: (time: number) => void = null;
  let reject = null;
  const promise = new Promise<number>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const timeSetListener = new android.app.TimePickerDialog.OnTimeSetListener({
    onTimeSet: (_, h, m) => resolve(h * 3600 + m * 60),
  });
  const { hours, minutes } = getHourAndMinutesFromSeconds(opts.defaultValue);
  const dialog = new android.app.TimePickerDialog(
    Application.android.foregroundActivity,
    timeSetListener,
    hours,
    minutes,
    true
  );
  dialog.setOnDismissListener(getDismissListener(resolve));
  opts.title ? dialog.setTitle(opts.title) : {};
  opts.message ? dialog.setMessage(opts.message) : {};

  dialog.show();
  return promise.catch((e) => {
    console.log('ERROR showTimeSelector: ' + e);
    return null;
  });
};

export const showDateSelector = (opts: DateSelectorOptions) => {
  const date = opts.defaultValue ? opts.defaultValue : new Date();
  let resolve: (date: Date) => void = null;
  let reject = null;
  const promise = new Promise<Date>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const dateSetListener = new android.app.DatePickerDialog.OnDateSetListener({
    onDateSet: (_, y, m, d) => resolve(new Date(y, m, d)),
  });

  const dialog = new MtntDatePickerDialog(
    Application.android.foregroundActivity,
    dateSetListener,
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    opts.title
  );
  dialog.setOnDismissListener(getDismissListener(resolve));
  opts.message ? dialog.setMessage(opts.message) : {};
  const picker = dialog.getDatePicker();
  picker.setPadding(50, 0, 50, 0); // l-t-r-b
  opts.minimumValue ? picker.setMinDate(opts.minimumValue.getTime()) : {};

  dialog.show();
  return promise.catch((e) => {
    console.log('ERROR showDateSelector: ' + e);
    return null;
  });
};

const getSecondsFromDate = (date: Date) =>
  date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

const getHourAndMinutesFromSeconds = (time: number) => {
  let hours: number, minutes: number;
  if (typeof time === 'number') {
    hours = Math.floor(time / 3600);
    minutes = Math.round((time / 3600 - hours) * 60);
  } else {
    const date = new Date();
    hours = date.getHours();
    minutes = date.getMinutes();
  }
  return { hours, minutes };
};

const getDismissListener = (resolve: (date: Date | number) => void) =>
  new android.content.DialogInterface.OnDismissListener({
    onDismiss: (_) => resolve(null),
  });

@NativeClass()
class MtntDatePickerDialog extends android.app.DatePickerDialog {
  constructor(
    context: android.content.Context,
    listener: android.app.DatePickerDialog.OnDateSetListener,
    year: number,
    month: number,
    dayOfMonth: number,
    title: string
  ) {
    super(context, listener, year, month, dayOfMonth);
    title ? super.setTitle(title) : {};
  }

  setTitle() {} // Overriding set title so title doesn't change
}
