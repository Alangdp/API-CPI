export const teste = 123;

export function erroSequelizeFilter(errorType) {
  const errorsMessages = [];
  if (
    errorType.name !== undefined &&
    errorType.name === 'SequelizeConnectionRefusedError'
  )
    return { msg: 'SequelizeConnectionRefusedError' };

  try {
    errorType.errors.forEach((error) => {
      errorsMessages.push(error.message);
    });

    return { msg: errorsMessages };
  } catch (error) {
    console.log(error);
    return { msg: error.message, err: error.Error };
  }
}
