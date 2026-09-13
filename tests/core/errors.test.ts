import { describe, expect, it } from 'vitest';
import { SwimLibBuildError, SwimLibError, SwimLibParseError } from '../../src/core/errors';

describe('error hierarchy', () => {
  it('parse and build errors extend SwimLibError', () => {
    expect(new SwimLibParseError('bad input')).toBeInstanceOf(SwimLibError);
    expect(new SwimLibBuildError('bad output')).toBeInstanceOf(SwimLibError);
  });

  it('sets name to the concrete class', () => {
    expect(new SwimLibParseError('x').name).toBe('SwimLibParseError');
    expect(new SwimLibParseError('x').message).toBe('x');
  });
});
