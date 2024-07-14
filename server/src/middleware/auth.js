import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user info to the request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
