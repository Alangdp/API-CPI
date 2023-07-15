import pkg from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line
export default (req, res, next) => {
  const [_, token] = req.headers.authorization.split(' ');
  if (!token) return res.status(401).json({ msg: 'Bearer Token is null' });

  pkg.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Invalid Bearer Token' });
    req.userId = decoded.id;
    return next();
  });
};
