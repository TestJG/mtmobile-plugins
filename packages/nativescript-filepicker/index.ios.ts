import { Utils } from '@nativescript/core';
import { FilePickerResult, parseOptions, ShowFilePickerOptions } from './common';

export const showFilePicker = (options?: ShowFilePickerOptions) => {
  options = parseOptions(options);
  const documentTypes = Utils.ios.collections.jsArrayToNSArray(['public.data']);
  const controller = UIDocumentPickerViewController.alloc().initWithDocumentTypesInMode(
    documentTypes,
    UIDocumentPickerMode.Import
  );
  return new Promise<FilePickerResult>((res, rej) => {
    controller.delegate = MediafilepickerDocumentPickerDelegate.initWithOwner(
      new WeakRef(showFilePicker),
      res,
      rej
    );
    const app = UIApplication.sharedApplication;
    app.keyWindow.rootViewController.presentViewControllerAnimatedCompletion(
      controller,
      true,
      null
    );
  });
};

@NativeClass()
class MediafilepickerDocumentPickerDelegate extends NSObject implements UIDocumentPickerDelegate {
  private _owner: WeakRef<any>;
  public static ObjCProtocols = [UIDocumentPickerDelegate];
  public static resolve: (file: FilePickerResult) => void;
  public static reject: (error: any) => void;

  static initWithOwner(
    owner: WeakRef<any>,
    resolve: (file: FilePickerResult) => void,
    reject: (error: any) => void
  ): MediafilepickerDocumentPickerDelegate {
    this.resolve = (file: FilePickerResult) => setTimeout(() => resolve(file), 300);
    this.reject = reject;
    const delegate =
      MediafilepickerDocumentPickerDelegate.new() as MediafilepickerDocumentPickerDelegate;
    delegate._owner = owner;
    return delegate;
  }

  public documentPickerDidPickDocumentAtURL(
    controller: UIDocumentPickerViewController,
    url: NSURL
  ) {
    if (url) {
      MediafilepickerDocumentPickerDelegate.resolveNSUrl(url);
    } else {
      MediafilepickerDocumentPickerDelegate.resolve(null);
    }
  }

  public documentPickerDidPickDocumentsAtURLs(
    controller: UIDocumentPickerViewController,
    urls: NSArray<NSURL>
  ) {
    if (urls && urls.count > 0) {
      MediafilepickerDocumentPickerDelegate.resolveNSUrl(urls[0]);
    } else {
      MediafilepickerDocumentPickerDelegate.resolve(null);
    }
  }

  public documentPickerWasCancelled(controller: UIDocumentPickerViewController) {
    MediafilepickerDocumentPickerDelegate.resolve(null);
  }

  static resolveNSUrl(url: NSURL) {
    let path = url.absoluteString.replace('file:///private', '');
    path = decodeURI(url.absoluteString.replace('file:///', ''));
    const name = path.split('/').pop();
    MediafilepickerDocumentPickerDelegate.resolve({
      path,
      name,
      mime: getMime(name),
    });
  }
}

const getMime = (fileName: string) => {
  const uti = UTTypeCreatePreferredIdentifierForTag(
    kUTTagClassFilenameExtension,
    fileName.split('.').pop(),
    null
  );
  const mime = UTTypeCopyPreferredTagWithClass(
    uti ? uti.takeRetainedValue() : null,
    kUTTagClassMIMEType
  );
  return mime ? mime.takeRetainedValue() : null;
};
