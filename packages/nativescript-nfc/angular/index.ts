import { Injectable, Provider } from '@angular/core';
import { NfcService } from '@testjg/nativescript-nfc';

@Injectable()
export class NgNfcService extends NfcService {}

export const NfcProvider: Provider = { provide: NfcService, useClass: NfcService };
