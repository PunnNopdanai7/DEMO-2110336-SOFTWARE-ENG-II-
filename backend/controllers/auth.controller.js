const User = require("../models/user.model");

/*
 * @desc     Resigter user
 * @route    POST /api/v1/auth/register
 * @access   Public
 */
exports.register = async (req, res, _next) => {
  console.log("Register user");
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username and password",
      });
    }

    const user = await User.create({
      username,
      password,
    });

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.log(error);

    if (error?.message) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({ success: false, error: error });
  }
};

/*
 * @desc     Login user
 * @route    POST /api/v1/auth/login
 * @access   Public
 */
exports.login = async (req, res, _next) => {
  console.log("Login user");
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username and password",
      });
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(404).json({
        success: false,
        error: "Invalid credentials",
      });
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {}
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.signedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
