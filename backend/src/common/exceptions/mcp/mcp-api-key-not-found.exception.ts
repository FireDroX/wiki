export class McpApiKeyNotFoundException extends Error {
  constructor() {
    super('API key not found');
    this.name = 'McpApiKeyNotFoundException';
  }
}
