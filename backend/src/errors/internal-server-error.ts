class InternalServerError extends Error {
  public statusCode: number;

  constructor() {
    super('Произошла ошибка');
    this.statusCode = 500;
  }
}

export default InternalServerError;
