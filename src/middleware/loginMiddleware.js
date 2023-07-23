import pkg from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line
export default (req, res, next) => {
  if (req.headers.authorization) {
    const [_, token] = req.headers.authorization.split(' ');
    if (!token) return res.status(401).json({ msg: 'Bearer Token is null' });

    pkg.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
      if (err) return res.status(401).json({ msg: 'Invalid Bearer Token' });
      req.userId = Number(decoded);
      return next();
    });
  } else {
    return res.status(401).json({ msg: 'Invalid Bearer Token' });
  }
};
