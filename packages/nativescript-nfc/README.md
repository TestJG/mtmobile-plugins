# @testjg/nativescript-nfc

Based on the great and more complete: https://github.com/EddyVerbruggen/nativescript-nfc

## Installation

```javascript
ns plugin add @testjg/nativescript-nfc
```

## Usage

Make sure your AndroidManifest.xml includes the permission:

```xml
<uses-permission android:name="android.permission.NFC"/>
```

In your app code:

```typescript
import { NfcService } from '@testjg/nativescript-nfc';

export class DemoNfc {
  private nfcService = new NfcService();

  async startListening() {
    const available = await this.nfcService.available();
    if (!available) return;

    const enabled = await this.nfcService.enabled();
    if (!enabled) return;

    this.nfcService.setOnNdefDiscoveredListener((nfcData) => console.log('Scanned', nfcData));
  }

  async stopListening() {
    this.nfcService.setOnNdefDiscoveredListener(null);
  }
}
```

## License

Apache License Version 2.0
