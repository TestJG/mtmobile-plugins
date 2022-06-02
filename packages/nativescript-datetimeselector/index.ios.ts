import { Device } from '@nativescript/core';
import { DateSelectorOptions, DateTimeSelectorOptions, TimeSelectorOptions } from './common';

interface IOsSelectorOptions {
  defaultValue?: Date;
  minimumValue?: Date;
  title?: string;
  okText: string;
  cancelText: string;
}

export const showDateTimeSelector = async (opts: DateTimeSelectorOptions) => {
  if (Device.deviceType === 'Phone') return showSelector(opts, UIDatePickerMode.DateAndTime);

  // Showing 2 pickers as on iPad it doesn't look right when using UIDatePickerMode.DateAndTime
  const date = await showDateSelector(opts);
  if (!date) return null;

  const defaultValue = getSecondsFromDate(opts.defaultValue);
  const time = await showTimeSelector({ ...opts, defaultValue });

  if (!time) return date;

  date.setSeconds(time);
  return date;
};

export const showDateSelector = (opts: DateSelectorOptions) =>
  showSelector(opts, UIDatePickerMode.Date).then((date) =>
    date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null
  );

export const showTimeSelector = (opts: TimeSelectorOptions) => {
  const secondsToDateMapper = (time: number, def: Date) => {
    if (typeof time === 'number') {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setSeconds(time);
      return date;
    } else {
      return def;
    }
  };
  const options: IOsSelectorOptions = {
    defaultValue: secondsToDateMapper(opts.defaultValue, new Date()),
    // minimumValue: secondsToDateMapper(opts.minimumValue, null),
    title: opts.title,
    cancelText: opts.cancelText,
    okText: opts.okText,
  };
  return showSelector(options, UIDatePickerMode.Time).then(getSecondsFromDate);
};

const getSecondsFromDate = (date?: Date | null) =>
  date ? date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() : null;

const showSelector = (opts: IOsSelectorOptions, mode: UIDatePickerMode) => {
  // Values from https://github.com/NativeScript/nativescript-datetimepicker/src/datetimepicker.ios.ts
  const SUPPORT_DATE_PICKER_STYLE = parseFloat(Device.osVersion) >= 14.0;
  const DEFAULT_DATE_PICKER_STYLE = parseFloat(Device.osVersion) >= 14.0 ? 3 : 1;
  const DEFAULT_TIME_PICKER_STYLE = 1;
  const _isTablet = Device.deviceType === 'Tablet';
  // const _nativeDialog: UIAlertController;

  const PICKER_DEFAULT_MESSAGE_HEIGHT = parseFloat(Device.osVersion) >= 14.0 ? 300 : 192;
  const PICKER_WIDTH_INSETS = 16;
  const PICKER_WIDTH_PAD = 304;
  const PICKER_DEFAULT_OFFSET = 16;
  const PICKER_DEFAULT_TITLE_OFFSET = 26.5;
  const PICKER_DEFAULT_TITLE_HEIGHT = 16;
  const PICKER_DEFAULT_MESSAGE =
    parseFloat(Device.osVersion) >= 14.0
      ? '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'
      : '\n\n\n\n\n\n\n\n\n';

  let resolve = null;
  const promise = new Promise<Date>((res) => {
    resolve = res;
  });

  // Picker
  const picker = UIDatePicker.alloc().initWithFrame(CGRectZero);
  picker.datePickerMode = mode;
  /**
   * Gets or set the UIDatePickerStyle of the date picker in iOS 13.4+. Defaults to 0.
   * Valid values are numbers:
   *  - 0: automatic (system picks the concrete style based on the current platform and date picker mode)
   *  - 1: wheels (the date picker displays as a wheel picker)
   *  - 2: compact (the date picker displays as a label that when tapped displays a calendar-style editor)
   *  - 3: inline  (the date pickers displays as an inline, editable field)
   */
  if (SUPPORT_DATE_PICKER_STYLE) {
    picker.preferredDatePickerStyle =
      mode === UIDatePickerMode.Time ? DEFAULT_TIME_PICKER_STYLE : DEFAULT_DATE_PICKER_STYLE;
  }
  picker.date = opts.defaultValue ? opts.defaultValue : new Date();
  opts.minimumValue ? (picker.minimumDate = opts.minimumValue) : {};

  // Dialog
  const dialog = UIAlertController.alertControllerWithTitleMessagePreferredStyle(
    opts.title,
    PICKER_DEFAULT_MESSAGE,
    UIAlertControllerStyle.ActionSheet
  );
  const dialogSize =
    picker.preferredDatePickerStyle === 3
      ? 280
      : Math.min(dialog.view.frame.size.width, dialog.view.frame.size.height);
  const pickerWidth =
    UIDevice.currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Pad
      ? PICKER_WIDTH_PAD
      : dialogSize - PICKER_WIDTH_INSETS;

  let containerFrameTop = opts.title ? PICKER_DEFAULT_TITLE_OFFSET : PICKER_DEFAULT_OFFSET;
  if (opts.title) {
    containerFrameTop += PICKER_DEFAULT_TITLE_HEIGHT;
  }

  const pickerContainer = UIView.alloc().init();

  // optionally apply spinners color

  const left = _isTablet
    ? 0
    : (dialog.view.frame.size.width - pickerWidth) / 2 - PICKER_WIDTH_INSETS;
  picker.frame = CGRectMake(left, 0, pickerWidth, PICKER_DEFAULT_MESSAGE_HEIGHT);
  pickerContainer.addSubview(picker);

  // if applied color to spinners clear vibrancy effects

  const label = findLabelWithText(dialog.view, PICKER_DEFAULT_MESSAGE);
  const labelContainer = getLabelContainer(label);
  labelContainer.clipsToBounds = !_isTablet;
  labelContainer.addSubview(pickerContainer);

  pickerContainer.translatesAutoresizingMaskIntoConstraints = false;
  pickerContainer.topAnchor.constraintEqualToAnchorConstant(
    dialog.view.topAnchor,
    containerFrameTop
  ).active = true;
  pickerContainer.leftAnchor.constraintEqualToAnchor(dialog.view.leftAnchor).active = true;
  pickerContainer.rightAnchor.constraintEqualToAnchor(dialog.view.rightAnchor).active = true;
  pickerContainer.bottomAnchor.constraintEqualToAnchor(dialog.view.bottomAnchor).active = true;

  if (picker.preferredDatePickerStyle === 3) {
    picker.centerXAnchor.constraintEqualToAnchor(pickerContainer.centerXAnchor).active = true;
    // picker.leftAnchor.constraintEqualToAnchorConstant(pickerContainer.leftAnchor, left).active = true;
  } else {
    picker.leftAnchor.constraintLessThanOrEqualToAnchorConstant(
      pickerContainer.leftAnchor,
      PICKER_WIDTH_INSETS
    ).active = true;
    picker.rightAnchor.constraintLessThanOrEqualToAnchorConstant(
      pickerContainer.rightAnchor,
      PICKER_WIDTH_INSETS
    ).active = true;
  }

  const okAction = UIAlertAction.actionWithTitleStyleHandler(
    opts.okText,
    UIAlertActionStyle.Default,
    () => resolve(picker.date)
  );
  dialog.addAction(okAction);
  const cancelAction = UIAlertAction.actionWithTitleStyleHandler(
    opts.cancelText,
    UIAlertActionStyle.Cancel,
    () => resolve(null)
  );
  dialog.addAction(cancelAction);

  // Show
  const app = UIApplication.sharedApplication;
  const win = app.keyWindow || (app.windows && app.windows.count && app.windows.objectAtIndex(0));
  let viewCtrl = win.rootViewController;
  while (viewCtrl && viewCtrl.presentedViewController) {
    viewCtrl = viewCtrl.presentedViewController;
  }

  if (viewCtrl) {
    if (dialog.popoverPresentationController) {
      dialog.popoverPresentationController.sourceView = viewCtrl.view;
      dialog.popoverPresentationController.sourceRect = CGRectMake(
        viewCtrl.view.bounds.size.width / 2.0,
        viewCtrl.view.bounds.size.height / 2.0,
        1.0,
        1.0
      );
      dialog.popoverPresentationController.permittedArrowDirections = 0;
    }
    viewCtrl.presentViewControllerAnimatedCompletion(dialog, true, () => {});
  }

  return promise.catch((e) => {
    console.log('ERROR showSelector: ' + e);
    return null;
  });
};

const findLabelWithText = (uiView: UIView, text: string) => {
  if (uiView instanceof UILabel && uiView.text === text) {
    return uiView;
  }
  const subViewsCount = uiView.subviews.count;
  for (let i = 0; i < subViewsCount; i++) {
    const label = findLabelWithText(uiView.subviews[i], text);
    if (label) {
      return label;
    }
  }
  return null;
};

const getLabelContainer = (uiView: UIView): UIView => {
  if (uiView && uiView.superview instanceof UIView) {
    return uiView.superview;
  }
  return getLabelContainer(uiView.superview);
};
