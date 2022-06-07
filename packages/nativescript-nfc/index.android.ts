import {
  AndroidActivityEventData,
  AndroidActivityNewIntentEventData,
  AndroidApplication,
  Application,
  Utils,
} from '@nativescript/core';
import { NfcUriProtocols } from './common';
import { NfcIntentHandler } from './nfcIntentHandler.android';
import {
  NdefListenerOptions,
  NfcApi,
  NfcNdefData,
  NfcTagData,
  WriteTagOptions,
} from './interfaces';

declare let Array: any;

export const nfcIntentHandler = NfcIntentHandler.new();

export class NfcService implements NfcApi {
  private pendingIntent: android.app.PendingIntent;
  private intentFilters: any;
  private techLists: any;
  private static firstInstance = true;
  private created = false;
  private started = false;
  private intent: android.content.Intent;
  private nfcAdapter: android.nfc.NfcAdapter;

  constructor() {
    this.intentFilters = [];
    this.techLists = Array.create('[Ljava.lang.String;', 0);

    this.initNfcAdapter();

    // note: once peer2peer is supported, handle possible pending push messages here

    // only wire these events once
    if (NfcService.firstInstance) {
      NfcService.firstInstance = false;

      // The Nfc adapter may not yet be ready, in case the class was instantiated in a very early stage of the app.
      Application.android.on(
        AndroidApplication.activityCreatedEvent,
        (args: AndroidActivityEventData) => {
          this.initNfcAdapter();
        }
      );

      Application.android.on(
        AndroidApplication.activityPausedEvent,
        (args: AndroidActivityEventData) => {
          let pausingNfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(args.activity);
          if (pausingNfcAdapter !== null) {
            try {
              this.nfcAdapter.disableForegroundDispatch(args.activity);
            } catch (e) {
              console.log(
                'Illegal State Exception stopping NFC. Assuming application is terminating.'
              );
            }
          }
        }
      );

      Application.android.on(
        AndroidApplication.activityResumedEvent,
        (args: AndroidActivityEventData) => {
          let resumingNfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(args.activity);
          if (resumingNfcAdapter !== null && !args.activity.isFinishing()) {
            this.started = true;
            resumingNfcAdapter.enableForegroundDispatch(
              args.activity,
              this.pendingIntent,
              this.intentFilters,
              this.techLists
            );
            // handle any pending intent
            nfcIntentHandler.parseMessage();
          }
        }
      );

      // fired when a new tag is scanned
      Application.android.on(
        AndroidApplication.activityNewIntentEvent,
        (args: AndroidActivityNewIntentEventData) => {
          nfcIntentHandler.savedIntent = this.intent;
          nfcIntentHandler.parseMessage();
        }
      );
    }
  }

  public available() {
    return new Promise<boolean>((resolve, reject) => {
      const nfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(Utils.ad.getApplicationContext());
      resolve(nfcAdapter !== null);
    });
  }

  public enabled() {
    return new Promise<boolean>((resolve, reject) => {
      const nfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(Utils.ad.getApplicationContext());
      resolve(nfcAdapter !== null && nfcAdapter.isEnabled());
    });
  }

  public setOnTagDiscoveredListener(callback: (data: NfcTagData) => void) {
    return nfcIntentHandler.setOnTagDiscoveredListener(callback);
  }

  public setOnNdefDiscoveredListener(
    callback: (data: NfcNdefData) => void,
    options?: NdefListenerOptions
  ) {
    return nfcIntentHandler.setOnNdefDiscoveredListener(callback, options);
  }

  public eraseTag() {
    return new Promise<void>((resolve, reject) => {
      const intent = Application.android.foregroundActivity.getIntent();
      if (intent === null || nfcIntentHandler.savedIntent === null) {
        reject("Can't erase tag; didn't receive an intent");
        return;
      }

      const tag = nfcIntentHandler.savedIntent.getParcelableExtra(
        android.nfc.NfcAdapter.EXTRA_TAG
      ) as android.nfc.Tag;
      const records = new Array.create(android.nfc.NdefRecord, 1);

      const tnf = android.nfc.NdefRecord.TNF_EMPTY;
      const type = Array.create('byte', 0);
      const id = Array.create('byte', 0);
      const payload = Array.create('byte', 0);
      records[0] = new android.nfc.NdefRecord(tnf, type, id, payload);

      // avoiding a TS issue in the generate Android definitions
      const ndefClass = android.nfc.NdefMessage as any;
      const ndefMessage = new ndefClass(records);

      const errorMessage = this.writeNdefMessage(ndefMessage, tag);
      if (errorMessage === null) {
        resolve();
      } else {
        reject(errorMessage);
      }
    });
  }

  public writeTag(arg: WriteTagOptions) {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!arg) {
          reject('Nothing passed to write');
          return;
        }
        const intent = Application.android.foregroundActivity.getIntent();
        if (intent === null || nfcIntentHandler.savedIntent === null) {
          reject("Can not write to tag; didn't receive an intent");
          return;
        }

        const tag = nfcIntentHandler.savedIntent.getParcelableExtra(
          android.nfc.NfcAdapter.EXTRA_TAG
        ) as android.nfc.Tag;

        const records = this.jsonToNdefRecords(arg);

        // avoiding a TS issue in the generate Android definitions
        const ndefClass = android.nfc.NdefMessage as any;
        const ndefMessage = new ndefClass(records);

        const errorMessage = this.writeNdefMessage(ndefMessage, tag);
        if (errorMessage === null) {
          resolve();
        } else {
          reject(errorMessage);
        }
      } catch (ex) {
        reject(ex);
      }
    });
  }

  private initNfcAdapter() {
    if (!this.created) {
      const activity = Application.android.foregroundActivity || Application.android.startActivity;
      if (activity) {
        this.created = true;
        this.intent = new android.content.Intent(activity, activity.getClass());
        this.intent.addFlags(
          android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP |
            android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP
        );
        this.pendingIntent = android.app.PendingIntent.getActivity(activity, 0, this.intent, 0);

        // The adapter must be started with the foreground activity.
        // This allows to start it as soon as possible but only once.
        const foregroundActivity = Application.android.foregroundActivity;
        this.nfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(
          Utils.android.getApplicationContext()
        );
        if (!this.started && this.nfcAdapter !== null && foregroundActivity) {
          this.started = true;
          this.nfcAdapter.enableForegroundDispatch(
            foregroundActivity,
            this.pendingIntent,
            this.intentFilters,
            this.techLists
          );
          // handle any pending intent
          nfcIntentHandler.parseMessage();
        }
      }
    }
  }

  private writeNdefMessage(message: android.nfc.NdefMessage, tag: android.nfc.Tag) {
    const ndef = android.nfc.tech.Ndef.get(tag);

    if (ndef === null) {
      const formatable = android.nfc.tech.NdefFormatable.get(tag);
      if (formatable === null) {
        return "Tag doesn't support NDEF";
      }
      formatable.connect();
      formatable.format(message);
      formatable.close();
      return null;
    }

    try {
      ndef.connect();
    } catch (e) {
      console.log('ndef connection error');
      return 'connection failed';
    }

    if (!ndef.isWritable()) {
      return 'Tag not writable';
    }

    const size = message.toByteArray().length;
    const maxSize = ndef.getMaxSize();

    if (maxSize < size) {
      return (
        'Message too long; tag capacity is ' + maxSize + ' bytes, message is ' + size + ' bytes'
      );
    }

    ndef.writeNdefMessage(message);
    ndef.close();
    return null;
  }

  private jsonToNdefRecords(input: WriteTagOptions): androidNative.Array<android.nfc.NdefRecord> {
    let nrOfRecords = 0;
    nrOfRecords += input.textRecords ? input.textRecords.length : 0;
    nrOfRecords += input.uriRecords ? input.uriRecords.length : 0;
    const records = new Array.create(android.nfc.NdefRecord, nrOfRecords);

    let recordCounter = 0;

    if (input.textRecords !== null) {
      for (const i in input.textRecords) {
        const textRecord = input.textRecords[i];

        const langCode = textRecord.languageCode || 'en';
        const encoded = this.stringToBytes(langCode + textRecord.text);
        encoded.unshift(langCode.length);

        const tnf = android.nfc.NdefRecord.TNF_WELL_KNOWN; // 0x01;
        const type = Array.create('byte', 1);
        type[0] = 0x54;

        const id = Array.create('byte', textRecord.id ? textRecord.id.length : 0);
        if (textRecord.id) {
          for (let j = 0; j < textRecord.id.length; j++) {
            id[j] = textRecord.id[j];
          }
        }

        const payload = Array.create('byte', encoded.length);
        for (let n = 0; n < encoded.length; n++) {
          payload[n] = encoded[n];
        }

        const record = new android.nfc.NdefRecord(tnf, type, id, payload);

        records[recordCounter++] = record;
      }
    }

    if (input.uriRecords !== null) {
      for (const i in input.uriRecords) {
        const uriRecord = input.uriRecords[i];
        const uri = uriRecord.uri;

        let prefix;

        NfcUriProtocols.slice(1).forEach((protocol) => {
          if ((!prefix || prefix === 'urn:') && uri.indexOf(protocol) === 0) {
            prefix = protocol;
          }
        });

        if (!prefix) {
          prefix = '';
        }

        const encoded = this.stringToBytes(uri.slice(prefix.length));
        // prepend protocol code
        encoded.unshift(NfcUriProtocols.indexOf(prefix));

        const tnf = android.nfc.NdefRecord.TNF_WELL_KNOWN; // 0x01;
        const type = Array.create('byte', 1);
        type[0] = 0x55;

        const id = Array.create('byte', uriRecord.id ? uriRecord.id.length : 0);
        if (uriRecord.id) {
          for (let j = 0; j < uriRecord.id.length; j++) {
            id[j] = uriRecord.id[j];
          }
        }

        const payload = Array.create('byte', encoded.length);
        for (let n = 0; n < encoded.length; n++) {
          payload[n] = encoded[n];
        }

        const record = new android.nfc.NdefRecord(tnf, type, id, payload);

        records[recordCounter++] = record;
      }
    }
    return records;
  }

  private stringToBytes(input: string) {
    const bytes = [];
    for (let n = 0; n < input.length; n++) {
      const c = input.charCodeAt(n);
      if (c < 128) {
        bytes[bytes.length] = c;
      } else if (c > 127 && c < 2048) {
        bytes[bytes.length] = (c >> 6) | 192;
        bytes[bytes.length] = (c & 63) | 128;
      } else {
        bytes[bytes.length] = (c >> 12) | 224;
        bytes[bytes.length] = ((c >> 6) & 63) | 128;
        bytes[bytes.length] = (c & 63) | 128;
      }
    }
    return bytes;
  }
}
