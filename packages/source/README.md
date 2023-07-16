# @chunkd/source

Base interface for all sources used by `@chunkd`

## Usage

```typescript
export interface Source {
  fetchBytes(offset: number, length?: number);
}
```
