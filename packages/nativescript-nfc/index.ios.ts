import { NfcUriProtocols, log } from './common';
import {
  NdefListenerOptions,
  NfcApi,
  NfcNdefData,
  NfcNdefRecord,
  NfcSessionInvalidator,
  NfcTagData,
  WriteTagOptions,
} from './interfaces';

export const nfcIntentHandler = null;

export class NfcService implements NfcApi, NfcSessionInvalidator {
  private session: NFCNDEFReaderSession;
  private delegate: NFCNDEFReaderSessionDelegateImpl;

  private static _available(): boolean {
    const isIOS11OrUp = NSObject.instancesRespondToSelector('accessibilityAttributedLabel');
    if (isIOS11OrUp) {
      try {
        return NFCNDEFReaderSession.readingAvailable;
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  }

  public available() {
    return Promise.resolve(NfcService._available());
  }

  public enabled() {
    return Promise.resolve(NfcService._available());
  }

  public setOnTagDiscoveredListener(callback: (data: NfcTagData) => void) {
    return Promise.resolve();
  }

  public setOnNdefDiscoveredListener(
    callback: (data: NfcNdefData) => void,
    options?: NdefListenerOptions
  ) {
    return new Promise<void>((resolve, reject) => {
      if (!NfcService._available()) {
        reject();
        return;
      }

      if (callback === null) {
        this.invalidateSession();
        resolve();
        return;
      }

      try {
        this.delegate = NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(
          new WeakRef(this),
          (data) => {
            if (!callback) {
              log(
                'Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: ' +
                  JSON.stringify(data)
              );
            } else {
              // execute on the main thread with this trick, so UI updates are not broken
              Promise.resolve().then(() => callback(data));
            }
          },
          options
        );

        this.session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(
          this.delegate,
          null,
          options && options.stopAfterFirstRead
        );

        if (options && options.scanHint) {
          this.session.alertMessage = options.scanHint;
        }

        this.session.beginSession();

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  invalidateSession() {
    if (this.session) {
      this.session.invalidateSession();
      this.session = undefined;
    }
  }

  public stopListening() {
    return Promise.resolve();
  }

  public writeTag(arg: WriteTagOptions) {
    return Promise.reject('Not available on iOS');
  }

  public eraseTag() {
    return Promise.reject('Not available on iOS');
  }
}

@NativeClass()
class NFCNDEFReaderSessionDelegateImpl extends NSObject implements NFCNDEFReaderSessionDelegate {
  public static ObjCProtocols = [];

  private _owner: WeakRef<NfcSessionInvalidator>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;

  public static new(): NFCNDEFReaderSessionDelegateImpl {
    try {
      NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate);
    } catch (ignore) {}
    return <NFCNDEFReaderSessionDelegateImpl>super.new();
  }

  public static createWithOwnerResultCallbackAndOptions(
    owner: WeakRef<NfcSessionInvalidator>,
    callback: (message: any) => void,
    options?: NdefListenerOptions
  ): NFCNDEFReaderSessionDelegateImpl {
    const delegate = NFCNDEFReaderSessionDelegateImpl.new();
    delegate._owner = owner;
    delegate.options = options;
    delegate.resultCallback = callback;
    return delegate;
  }

  readerSessionDidBecomeActive(session: NFCNDEFReaderSession) {
    // ignore, but by implementing this function we suppress a log about it not being implemented ;)
  }

  // Called when the reader session finds a new tag
  readerSessionDidDetectNDEFs(
    session: NFCNDEFReaderSession,
    messages: NSArray<NFCNDEFMessage>
  ): void {
    const firstMessage = messages[0];
    if (this.options && this.options.stopAfterFirstRead) {
      setTimeout(() => this._owner.get().invalidateSession());
    }

    // execute on the main thread with this trick
    this.resultCallback(NFCNDEFReaderSessionDelegateImpl.ndefToJson(firstMessage));
  }

  // If not commented iOS does not execute readerSessionDidDetectNDEFs, that's where we notify the
  // main thread
  // readerSessionDidDetectTags(
  //   session: NFCNDEFReaderSession,
  //   tags: NSArray<NFCNDEFTag> | NFCNDEFTag[]
  // ): void {}

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(
    session: any /* NFCNDEFReaderSession */,
    error: NSError
  ): void {
    this._owner.get().invalidateSession();
  }

  private static ndefToJson(message: NFCNDEFMessage): NfcNdefData {
    if (message === null) {
      return null;
    }

    return {
      message: NFCNDEFReaderSessionDelegateImpl.messageToJSON(message),
    };
  }

  private static messageToJSON(message: NFCNDEFMessage): NfcNdefRecord[] {
    const result = [];
    for (let i = 0; i < message.records.count; i++) {
      result.push(NFCNDEFReaderSessionDelegateImpl.recordToJSON(message.records.objectAtIndex(i)));
    }
    return result;
  }

  private static recordToJSON(record: NFCNDEFPayload): NfcNdefRecord {
    const payloadAsHexArray = NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.payload);
    let payloadAsString = NFCNDEFReaderSessionDelegateImpl.nsdataToASCIIString(record.payload);
    const payloadAsStringWithPrefix = payloadAsString;
    const recordType = NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.type);
    const decimalType = NFCNDEFReaderSessionDelegateImpl.hexToDec(recordType[0]);
    if (decimalType === 84) {
      const languageCodeLength: number = +payloadAsHexArray[0];
      payloadAsString = payloadAsStringWithPrefix.substring(languageCodeLength + 1);
    } else if (decimalType === 85) {
      let prefix = NfcUriProtocols[payloadAsHexArray[0]];
      if (!prefix) {
        prefix = '';
      }
      payloadAsString = prefix + payloadAsString.slice(1);
    }

    return {
      tnf: record.typeNameFormat, // "typeNameFormat" (1 = well known) - see https://developer.apple.com/documentation/corenfc/nfctypenameformat?changes=latest_major&language=objc
      type: decimalType,
      id: NFCNDEFReaderSessionDelegateImpl.hexToDecArray(
        NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.identifier)
      ),
      payload: NFCNDEFReaderSessionDelegateImpl.hexToDecArray(payloadAsHexArray),
      payloadAsHexString: NFCNDEFReaderSessionDelegateImpl.nsdataToHexString(record.payload),
      payloadAsStringWithPrefix,
      payloadAsString,
    };
  }

  private static hexToDec(hex) {
    if (hex === undefined) {
      return undefined;
    }

    let result = 0,
      digitValue;
    hex = hex.toLowerCase();
    for (let i = 0; i < hex.length; i++) {
      digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
      result = result * 16 + digitValue;
    }
    return result;
  }

  private static buf2hexString(buffer) {
    // buffer is an ArrayBuffer
    return Array.prototype.map
      .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  }

  private static buf2hexArray(buffer) {
    // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), (x) =>
      ('00' + x.toString(16)).slice(-2)
    );
  }

  private static buf2hexArrayNr(buffer) {
    // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), (x) => +x.toString(16));
  }

  private static hex2a(hexx) {
    const hex = hexx.toString(); // force conversion
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  private static nsdataToHexString(data): string {
    const b = interop.bufferFromData(data);
    return NFCNDEFReaderSessionDelegateImpl.buf2hexString(b);
  }

  private static nsdataToHexArray(data): Array<string> {
    const b = interop.bufferFromData(data);
    return NFCNDEFReaderSessionDelegateImpl.buf2hexArray(b);
  }

  private static nsdataToASCIIString(data): string {
    return NFCNDEFReaderSessionDelegateImpl.hex2a(
      NFCNDEFReaderSessionDelegateImpl.nsdataToHexString(data)
    );
  }

  private static hexToDecArray(hexArray): any {
    const resultArray = [];
    for (let i = 0; i < hexArray.length; i++) {
      let result = 0,
        digitValue;
      const hex = hexArray[i].toLowerCase();
      for (let j = 0; j < hex.length; j++) {
        digitValue = '0123456789abcdefgh'.indexOf(hex[j]);
        result = result * 16 + digitValue;
      }
      resultArray.push(result);
    }
    return JSON.stringify(resultArray);
  }
}
