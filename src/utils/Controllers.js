export function erroSequelizeFilter(error) {
  const errorsMessages = [];
  if (
    error.name !== undefined &&
    error.name === 'SequelizeConnectionRefusedError'
  )
    return { msg: 'SequelizeConnectionRefusedError' };

  error.errors.forEach((error) => {
    errorsMessages.push(error.message);
  });

  return errorsMessages;
}
