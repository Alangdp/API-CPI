import User from '../models/User.js';

import { erroSequelizeFilter } from '../utils/controllersExtra.js';

class UserController {
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

      return res.status(200).json(newUser);
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (user === null) return res.status(400).json({ message: 'invalid id' });
      const deletedCount = await user.destroy();
      if (deletedCount)
        return res
          .status(200)
          .json({ message: 'user has been deleted', userDeleted: user });

      return res.status(400).json({ message: 'user not recorded' });
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }

  async patch(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const userToUpdate = await User.findByPk(id);
      await userToUpdate.update({ ...data });

      return res
        .status(200)
        .json({ msg: 'user has been updated', userUpdated: userToUpdate });
    } catch (error) {
      const errorsMessages = erroSequelizeFilter(error);
      return res.status(400).json(errorsMessages);
    }
  }
}

export default new UserController();
