# @testjg/nativescript-sqlite

[![npm version](https://badge.fury.io/js/@testjg%2Fnativescript-sqlite.svg)](https://badge.fury.io/js/@testjg%2Fnativescript-sqlite)

## Installation

```javascript
ns plugin add @testjg/nativescript-sqlite
```

## Usage

You should take care of wrapping sqlite calls to your preferred async option (promises, observables, async/await). And catch any exceptions thrown.

```TypeScript
import { openOrCreate, deleteDatabase } from "@testjg/nativescript-sqlite";

const sqlite = openOrCreate("path/to/db");
sqlite.execute("CREATE TABLE names (id INT, name TEXT)");
sqlite.transaction(cancelTransaction => {
    // Calling cancelTransaction will rollback all changes made to db
    names.forEach((name, id) =>
        sqlite.execute(
            "INSERT INTO names (id, name) VALUES (?, ?)",
            [id, name]
        )
    );
});
```

## License

Apache License Version 2.0
