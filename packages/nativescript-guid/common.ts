export const parseGuid = (guid: string, separator?: string) =>
  typeof separator === 'undefined' ? guid : guid.split('-').join(separator);
