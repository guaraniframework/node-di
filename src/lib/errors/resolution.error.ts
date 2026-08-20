import { DependencyInjectionError } from './dependency-injection.error';

/**
 * Thrown when the Container is not able to resolve the requested Token.
 */
export class ResolutionError extends DependencyInjectionError {}
