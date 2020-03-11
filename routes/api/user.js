const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

//@route - POST api/user
//@desc - Register user
//@access - Public
router.post(
  '/',
  [
    check('name', 'name is required')
      .not()
      .isEmpty(),
    check('email', 'add valid email').isEmail(),
    check(
      'password',
      'please enter a password with more than 6 characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    //Check the response for the express validation erors and return...
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'user already exist' }] });
      }
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }

    res.send('user registered');
  }
);

module.exports = router;
