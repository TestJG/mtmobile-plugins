import { FilePickerResult } from './common';
import {
  knownFolders,
  File,
  Application,
  AndroidApplication,
  AndroidActivityResultEventData,
} from '@nativescript/core';

const REQUEST_CODE = 1970;

export const showFilePicker = (): Promise<FilePickerResult> =>
  new Promise((resolve, reject) => {
    try {
      const intent = new android.content.Intent();
      // intent.setAction("android.intent.action.OPEN_DOCUMENT");
      intent.setAction(android.content.Intent.ACTION_GET_CONTENT);
      intent.setType('*/*');
      intent.addCategory(android.content.Intent.CATEGORY_OPENABLE);
      intent.putExtra(android.content.Intent.EXTRA_LOCAL_ONLY, true);
      const chooser = android.content.Intent.createChooser(intent, 'Select a File');
      chooser.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
      chooser.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

      const activity = Application.android.foregroundActivity as android.app.Activity;
      const onResult = (args: AndroidActivityResultEventData) => {
        if (
          args.requestCode === REQUEST_CODE &&
          args.resultCode === android.app.Activity.RESULT_OK
        ) {
          const uri = (args.intent as android.content.Intent).getData();
          const contentResolver = activity.getContentResolver();
          const docFile = androidx.documentfile.provider.DocumentFile.fromSingleUri(activity, uri);
          const name = docFile.getName() || uri.getLastPathSegment();
          const path = knownFolders.temp().path + '/' + Math.random();
          const buffer = Array.create('byte', 4096);
          const output = new java.io.ByteArrayOutputStream();
          try {
            const input = contentResolver.openInputStream(uri);
            let size = input.read(buffer);
            // tslint:disable-next-line:triple-equals
            while (size != -1) {
              output.write(buffer, 0, size);
              size = input.read(buffer);
            }
            output.toByteArray();
            File.fromPath(path).writeSync(output.toByteArray(), (e) => reject('error.addDoc'));
            const result: FilePickerResult = {
              name,
              path,
              mime:
                contentResolver.getType(uri) ||
                docFile.getType() ||
                android.webkit.MimeTypeMap.getSingleton().getMimeTypeFromExtension(
                  name.split('.').pop()
                ) ||
                'application/octet-stream',
            };
            resolve(result);
          } catch (error) {
            reject('error.addDoc');
          }
        } else {
          resolve(null);
        }
        Application.android.off(AndroidApplication.activityResultEvent, onResult);
      };

      Application.android.on(AndroidApplication.activityResultEvent, onResult);
      activity.startActivityForResult(intent, REQUEST_CODE);
    } catch (error) {
      reject(error);
    }
  });
