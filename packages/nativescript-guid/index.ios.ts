import { parseGuid } from './common';

export const createGuid = (separator?: string): string =>
  parseGuid(NSUUID.new().UUIDString.toLowerCase(), separator);
