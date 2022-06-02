# @testjg/nativescript-datetimeselector

## Installation

```javascript
ns plugin add @testjg/nativescript-datetimeselector
```

## Usage

```typescript
// Return Date with hours, minutes and seconds set to zero
const date = await showDateSelector({ okText: 'ok', cancelText: 'cancel' })

// Returns Date
const dateTime = await showDateTimeSelector({ okText: 'ok', cancelText: 'cancel' })

// Returns number of seconds
const time = await showTimeSelector({ okText: 'ok', cancelText: 'cancel' })
```

## License

Apache License Version 2.0
