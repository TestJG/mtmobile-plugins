import { WriteTagOptions, NfcApi, NfcNdefData, NdefListenerOptions } from './interfaces';

export declare const nfcIntentHandler: NfcIntentHandler;

export declare class NfcService implements NfcApi {
  available(): Promise<boolean>;
  enabled(): Promise<boolean>;
  writeTag(arg: WriteTagOptions): Promise<void>;
  eraseTag(): Promise<void>;
  /**
   * Set to null to remove the listener.
   */
  setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<void>;
  /**
   * Set to null to remove the listener.
   */
  setOnNdefDiscoveredListener(
    callback: (data: NfcNdefData) => void,
    options?: NdefListenerOptions
  ): Promise<void>;
}
