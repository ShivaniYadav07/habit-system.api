import jwt from 'jsonwebtoken';

const setCookie = async (res, user, message, statusCode) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true, // Secure the cookie
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Cookie expiration
      sameSite: "None", // Allow cross-site cookies (for Postman)
      secure: false, // Make it false for testing in Postman (should be true in production with HTTPS)
    })
    .json({
      success: true,
      message,
      user,
    });
};

export default setCookie;
