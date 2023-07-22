import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line-+
export default (req, res, next) => {
  const { password } = req.body;
  if (password !== process.env.SECRET_TOKEN)
    return res.status(401).json({ msg: 'Invalid Password' });
  return next();
};
