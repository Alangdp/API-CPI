import User from '../models/User.js';

class userController {
  async show(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      const errorsMessages = [];
      error.errors.forEach((error) => {
        errorsMessages.push(error.message);
      });
      res.status(400).json(errorsMessages);
    }
  }

  async store(req, res) {
    try {
      const data = req.body;
      console.log(data);

      const newUser = await User.create({
        ...data,
      });

      res.status(200).json(newUser);
    } catch (error) {
      const errorsMessages = [];
      error.errors.forEach((error) => {
        errorsMessages.push(error.message);
      });
      res.status(400).json(errorsMessages);
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
      res.status(400);
    }
  }

  async patch(req, res) {
    try {
      const id = req.params['id'];
      const updatedUser = await User.update({ ...req.body }, { where: { id } });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);

      res.status(400).json(error);
    }
  }
}

export default new userController();
