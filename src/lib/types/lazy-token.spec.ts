import { LazyToken } from './lazy-token';

class Foo {
  public constructor(public readonly foo: string) {}

  public print(): string {
    return this.foo;
  }
}

describe('Lazy Token', () => {
  describe('resolve()', () => {
    const lazyToken = new LazyToken(() => Foo);

    it('should resolve the lazy token into an instance of Foo.', () => {
      const foo = lazyToken.resolve(() => new Foo('foo'));

      expect(foo).toBeInstanceOf(Foo);
      expect(foo.print()).toBe('foo');
    });
  });

  describe('resolveAll()', () => {
    const lazyToken = new LazyToken(() => Foo);

    it('should resolve the lazy token into an instance of Foo.', () => {
      const fooCollection = lazyToken.resolveAll(() => [new Foo('foo'), new Foo('bar')]);

      expect(fooCollection).toBeArrayOfSize(2);
      expect(fooCollection).toSatisfyAll((foo) => foo instanceof Foo);

      expect(fooCollection[0]!.print()).toBe('foo');
      expect(fooCollection[1]!.print()).toBe('bar');
    });
  });
});
