import { parseGuid } from './common';

export const createGuid = (separator?: string): string =>
  parseGuid(java.util.UUID.randomUUID().toString(), separator);
