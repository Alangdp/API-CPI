import pkg from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/User.js';

dotenv.config();

// import { erroSequelizeFilter } from '../utils/Controllers.js';

class TokenController {
  async store(req, res) {
    const data = req.body;
    const user = await User.findOne({ where: { email: data.email } });
    if (user === null)
      return res.status(400).json({ msg: 'Email not registred' });
    if (!user.validatePassword(data.password)) {
      return res.status(400).json({ msg: 'Incorret password' });
    }

    const token = pkg.sign(user.id, process.env.SECRET_TOKEN);
    return res.status(200).json({ token, user });
  }
}

export default new TokenController();
