import { Application } from '@nativescript/core';
import { NfcUriProtocols, log } from './common';
import { NdefListenerOptions, NfcNdefData, NfcNdefRecord, NfcTagData } from './interfaces';

let onTagDiscoveredListener: null | ((data: NfcTagData) => void) = null;
let onNdefDiscoveredListener: null | ((data: NfcNdefData) => void) = null;

export class NfcIntentHandler {
  public savedIntent: android.content.Intent = null;

  public static new() {
    return new NfcIntentHandler();
  }

  constructor() {}

  public setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      onTagDiscoveredListener = callback;
      resolve();
    });
  }

  public setOnNdefDiscoveredListener(
    callback: (data: NfcNdefData) => void,
    options?: NdefListenerOptions
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // TODO use options, some day
      onNdefDiscoveredListener = callback;
      resolve();
    });
  }

  parseMessage(): void {
    const activity = Application.android.foregroundActivity || Application.android.startActivity;
    const intent = activity.getIntent();

    if (intent === null || this.savedIntent === null) {
      return;
    }

    const action = intent.getAction();
    if (action === null) {
      return;
    }

    const tag = intent.getParcelableExtra(android.nfc.NfcAdapter.EXTRA_TAG) as android.nfc.Tag;
    const messages = intent.getParcelableArrayExtra(android.nfc.NfcAdapter.EXTRA_NDEF_MESSAGES);

    // every action should map to a different listener you pass in at 'startListening'
    if (action === android.nfc.NfcAdapter.ACTION_NDEF_DISCOVERED) {
      const ndef = android.nfc.tech.Ndef.get(tag);

      const ndefJson: NfcNdefData = this.ndefToJSON(ndef);

      if (ndef === null && messages !== null) {
        if (messages.length > 0) {
          const message = messages[0] as android.nfc.NdefMessage;
          ndefJson.message = this.messageToJSON(message);
          ndefJson.type = 'NDEF Push Protocol';
        }
        if (messages.length > 1) {
          log('Expected 1 ndefMessage but found ' + messages.length);
        }
      }

      if (onNdefDiscoveredListener === null) {
        log(
          'Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: ' +
            JSON.stringify(ndefJson)
        );
      } else {
        onNdefDiscoveredListener(ndefJson);
      }
      activity.getIntent().setAction('');
    } else if (action === android.nfc.NfcAdapter.ACTION_TECH_DISCOVERED) {
      /*
      const techList = tag.getTechList();

      for (let i = 0; i < tag.getTechList().length; i++) {
        const tech = tag.getTechList()[i];
        let tagTech = techList(t);
        console.log("tagTech: " + tagTech);
        if (tagTech === NdefFormatable.class.getName()) {
            fireNdefFormatableEvent(tag);
        } else if (tagTech === Ndef.class.getName()) {
            let ndef = Ndef.get(tag);
            fireNdefEvent(NDEF, ndef, messages);
        }
      }
      activity.getIntent().setAction('');
      */
    } else if (action === android.nfc.NfcAdapter.ACTION_TAG_DISCOVERED) {
      const result: NfcTagData = {
        id: tag === null ? null : this.byteArrayToJSArray(tag.getId()),
        techList: this.techListToJSON(tag),
      };

      if (onTagDiscoveredListener === null) {
        log(
          'Tag discovered, but no listener was set via setOnTagDiscoveredListener. Ndef: ' +
            JSON.stringify(result)
        );
      } else {
        onTagDiscoveredListener(result);
      }
      activity.getIntent().setAction('');
    }
  }

  byteArrayToJSArray(bytes): number[] {
    const result = [];
    for (let i = 0; i < bytes.length; i++) {
      result.push(bytes[i]);
    }
    return result;
  }

  byteArrayToJSON(bytes): string {
    const json = new org.json.JSONArray();
    for (let i = 0; i < bytes.length; i++) {
      json.put(bytes[i]);
    }
    return json.toString();
  }

  bytesToHexString(bytes): string {
    let dec,
      hexstring,
      bytesAsHexString = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] >= 0) {
        dec = bytes[i];
      } else {
        dec = 256 + bytes[i];
      }
      hexstring = dec.toString(16);
      // zero padding
      if (hexstring.length === 1) {
        hexstring = '0' + hexstring;
      }
      bytesAsHexString += hexstring;
    }
    return bytesAsHexString;
  }

  bytesToString(bytes): string {
    let result = '';
    let i, c, c1, c2, c3;
    i = c = c1 = c2 = c3 = 0;

    // Perform byte-order check
    if (bytes.length >= 3) {
      if ((bytes[0] & 0xef) === 0xef && (bytes[1] & 0xbb) === 0xbb && (bytes[2] & 0xbf) === 0xbf) {
        // stream has a BOM at the start, skip over
        i = 3;
      }
    }

    while (i < bytes.length) {
      c = bytes[i] & 0xff;

      if (c < 128) {
        result += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        if (i + 1 >= bytes.length) {
          throw new Error('Un-expected encoding error, UTF-8 stream truncated, or incorrect');
        }
        c2 = bytes[i + 1] & 0xff;
        result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        if (i + 2 >= bytes.length || i + 1 >= bytes.length) {
          throw new Error('Un-expected encoding error, UTF-8 stream truncated, or incorrect');
        }
        c2 = bytes[i + 1] & 0xff;
        c3 = bytes[i + 2] & 0xff;
        result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return result;
  }

  techListToJSON(tag): string[] {
    if (tag !== null) {
      const techList = [];
      for (let i = 0; i < tag.getTechList().length; i++) {
        techList.push(tag.getTechList()[i]);
      }
      return techList;
    }
    return null;
  }

  ndefToJSON(ndef: android.nfc.tech.Ndef): NfcNdefData {
    if (ndef === null) {
      return null;
    }

    const result = {
      type: ndef.getType()[0],
      maxSize: ndef.getMaxSize(),
      writable: ndef.isWritable(),
      message: this.messageToJSON(ndef.getCachedNdefMessage()),
      canMakeReadOnly: ndef.canMakeReadOnly(),
    } as NfcNdefData;

    const tag = ndef.getTag();
    if (tag !== null) {
      result.id = this.byteArrayToJSArray(tag.getId());
      result.techList = this.techListToJSON(tag);
    }

    return result;
  }

  messageToJSON(message: android.nfc.NdefMessage): NfcNdefRecord[] {
    try {
      if (message === null) {
        return null;
      }
      const records = message.getRecords();
      const result = [];
      for (let i = 0; i < records.length; i++) {
        const record = this.recordToJSON(records[i]);
        result.push(record);
      }
      return result;
    } catch (e) {
      log('Error in messageToJSON: ' + e);
      return null;
    }
  }

  recordToJSON(record: android.nfc.NdefRecord): NfcNdefRecord {
    let payloadAsString = this.bytesToString(record.getPayload());
    const payloadAsStringWithPrefix = payloadAsString;
    const type = record.getType()[0];

    if (type === android.nfc.NdefRecord.RTD_TEXT[0]) {
      const languageCodeLength = record.getPayload()[0];
      payloadAsString = payloadAsStringWithPrefix.substring(languageCodeLength + 1);
    } else if (type === android.nfc.NdefRecord.RTD_URI[0]) {
      let prefix = NfcUriProtocols[record.getPayload()[0]];
      if (!prefix) {
        prefix = '';
      }
      payloadAsString = prefix + payloadAsString.slice(1);
    }

    return {
      tnf: record.getTnf(),
      type,
      id: this.byteArrayToJSArray(record.getId()),
      payload: this.byteArrayToJSON(record.getPayload()),
      payloadAsHexString: this.bytesToHexString(record.getPayload()),
      payloadAsStringWithPrefix,
      payloadAsString,
    };
  }
}
