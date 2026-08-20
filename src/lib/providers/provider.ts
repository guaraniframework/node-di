import { ClassProvider, isClassProvider } from './class/class.provider';
import { FactoryProvider, isFactoryProvider } from './factory/factory.provider';
import { isTokenProvider, TokenProvider } from './token/token.provider';
import { isValueProvider, ValueProvider } from './value/value.provider';

/**
 * Denotes a Provider.
 */
export type Provider<T> = ClassProvider<T> | FactoryProvider<T> | TokenProvider<T> | ValueProvider<T>;

/**
 * Checks if the provided object is a Provider.
 *
 * @param obj Object to be checked.
 */
export function isProvider<T>(obj: unknown): obj is Provider<T> {
  const checks = [isClassProvider<T>(obj), isFactoryProvider<T>(obj), isTokenProvider<T>(obj), isValueProvider<T>(obj)];
  return checks.filter((check) => check === true).length === 1;
}
