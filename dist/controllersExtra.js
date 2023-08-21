export default class {
  static erroSequelizeFilter(errorType) {
    const errorsMessages = [];
    if (
      errorType.name !== undefined &&
      errorType.name === 'SequelizeConnectionRefusedError'
    )
      return { msg: 'SequelizeConnectionRefusedError' };
    try {
      console.log(errorType);
      errorType.errors.forEach((error) => {
        errorsMessages.push(error.message);
      });
      return { msg: errorsMessages };
    } catch (error) {
      if (error instanceof Error) {
        return { msg: error.message, err: error.message };
      }
    }
  }
}
