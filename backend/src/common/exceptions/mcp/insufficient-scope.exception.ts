export class InsufficientScopeException extends Error {
  constructor(requiredScopes: string[]) {
    super(
      `Insufficient scope: this tool requires one of [${requiredScopes.join(', ')}]`,
    );
    this.name = 'InsufficientScopeException';
  }
}
