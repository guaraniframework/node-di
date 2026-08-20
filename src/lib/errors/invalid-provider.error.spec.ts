import { jsonStringify } from '@guarani/primitives';

import { InvalidProviderError } from './invalid-provider.error';

const jsonSerializables: any[] = [null, true, 1, 1.2, 'a', Buffer.alloc(0), [], {}];

describe('Invalid Provider Error', () => {
  it('should serialize a bigint error message.', () => {
    const error = new InvalidProviderError(123n);
    expect(error.message).toBe('The object "123" is not a valid Provider.');
  });

  it('should serialize a function error message.', () => {
    const error = new InvalidProviderError(function foo() {});
    expect(error.message).toBe('The object "foo" is not a valid Provider.');
  });

  it('should serialize a symbol error message.', () => {
    const error = new InvalidProviderError(Symbol('sym'));
    expect(error.message).toBe('The object "Symbol(sym)" is not a valid Provider.');
  });

  it('should serialize an undefined error message.', () => {
    const error = new InvalidProviderError(undefined);
    expect(error.message).toBe('The object "undefined" is not a valid Provider.');
  });

  it.each(jsonSerializables)('should serialize an undefined error message.', (value) => {
    const error = new InvalidProviderError(value);
    expect(error.message).toBe(`The object "${jsonStringify(value)}" is not a valid Provider.`);
  });
});
