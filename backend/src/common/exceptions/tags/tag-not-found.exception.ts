export class TagNotFoundException extends Error {
  constructor() {
    super('Tag not found');
    this.name = 'TagNotFoundException';
  }
}
