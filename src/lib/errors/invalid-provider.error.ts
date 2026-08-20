import { jsonStringify } from '@guarani/primitives';

import { DependencyInjectionError } from './dependency-injection.error';

/**
 * Thrown when the provided object is not a valid Provider.
 */
export class InvalidProviderError extends DependencyInjectionError {
  /**
   * Thrown when the provided object is not a valid Provider.
   *
   * @param obj Object used as a Provider.
   */
  public constructor(obj: unknown, options?: ErrorOptions) {
    const serializedObject = InvalidProviderError.getSerializedObject(obj);
    const message = `The object "${serializedObject}" is not a valid Provider.`;

    super(message, options);
  }

  /**
   * Returns a String description of the object for use at the Error's Message.
   *
   * @param obj Object used as a Provider.
   * @returns String description of the object.
   */
  private static getSerializedObject(obj: unknown): string {
    switch (typeof obj) {
      case 'bigint':
        return obj.toString();

      case 'function':
        return obj.name;

      case 'symbol':
        return obj.toString();

      case 'undefined':
        return 'undefined';

      default:
        return jsonStringify(obj);
    }
  }
}
