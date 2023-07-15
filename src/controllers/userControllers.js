import User from '../models/User.js';

import { erroSequelizeFilter } from '../utils/Controllers.js';

class userController {
  async show(req, res) {
    try {
      const users = await User.findAll();
      return res.status(200).json(users);
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }

  async store(req, res) {
    try {
      const data = req.body;
      const newUser = await User.create({
        ...data,
      });

      res.status(200).json(newUser);
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }

  async delete(req, res) {
    try {
      const id = req.params['id'];
      const user = await User.findByPk(id);
      if (user === null) res.status(400).json({ message: 'invalid id' });
      const deletedCount = await user.destroy();
      if (deletedCount)
        res
          .status(200)
          .json({ message: 'user has been deleted', userDeleted: user });
      res.status(400).json({ message: 'user not recorded' });
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }

  async patch(req, res) {
    try {
      const id = req.params['id'];
      const userToUpdate = await User.findByPk(id);
      const status = await userToUpdate.update({ ...req.body });

      res.status(200).json(userToUpdate);
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }
}

export default new userController();
