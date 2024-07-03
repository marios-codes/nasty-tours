const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT__COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the output, not the database
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // 1) Retrieve email and password from request
  const { email, password } = req.body;

  // 2) Check if the request contains the email and password
  if (!email || !password) {
    // Remeber to use return or else we will send two response to the client:
    // One with the error and the second one with the response below
    return next(new AppError('Please provide an email and password!', 400));
  }

  // 3) Check if user exists in our database and if password is correct
  const user = await User.findOne({ email: email }).select('+password'); // We use select with a '+' to select a field from the database which by default is not selected

  // Compare the hashed password in our database against user's input password during login AFTER checking if the user exists in our database
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError('User email and/or password are incorrect', 401));
  }

  // 4) If everything is OK send the token to the client
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt', { httpOnly: true });

  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  // We get the token from the header of our request. Example of the header token is: {Authorization: 'Bearer ' + token}
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // functionality from the cookie-parser npm package
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.')
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // will handle the error in our global error controller handler
  // example of decoded token
  // {
  //   "id": "6509ba973276de7efd4992aa",
  //   "iat": 1695136669,
  //   "exp": 1702912669
  // }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Only for rendered pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    ); // will handle the error in our global error controller handler

    // example of decoded token
    // {
    //   "id": "6509ba973276de7efd4992aa",
    //   "iat": 1695136669,
    //   "exp": 1702912669
    // }

    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // There is a logged in user
    res.locals.user = currentUser; // Using res.locals we can pass any data to our templates
    return next();
  }
  next();
});

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // example of roles = ['admin', 'lead-guide']
    // If let's say roles = ['user'] then the access should be forbidden if an endpoint
    // only allows access to the above two roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on given email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken(); // returns the unencrypted reset token
  // Save the created encrypted reset token to our database
  await user.save({ validateBeforeSave: false });
  // 3) Send the unencrypted reset token to the user's email address
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // In case of an error clear these fields from our database
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Please try later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the encrypted token
  // create an encrypted token based on the unencrypted token we got from our request
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // also check in our user query that the token has not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // delete these fields after setting the new password
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // we don't want to turn off the validators this time as in userSchema we have a validator that checks if password and confirmPassword patch before save.

  // 3) Update changedPasswordAt property for the user is done on the presave middleware function on userModel.js
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password'); // We use select with a '+' to select a field from the database which by default is not selected

  // 2) Check if POSTed password is correct
  // Compare the hashed password in our database against user's input password AFTER checking if the user exists in our database
  if (
    !(await user.isCorrectPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, update password in our database
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save(); // we don't want to turn off the validators this time as in userSchema we have a validator that checks if password and confirmPassword patch before save.
  // User.findByIdAndUpdate will NOT work as intended!

  // Updated changedPasswordAt property for the user is done on the presave middleware function on userModel.js
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
