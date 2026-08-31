export class ParentPageNotFoundException extends Error {
  constructor() {
    super('Parent page not found');
    this.name = 'ParentPageNotFoundException';
  }
}
