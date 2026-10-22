const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Request ke header se token nikaalo
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access Denied. No token provided.' });
  }

  // 2. "Bearer " ke baad wala asli token alag karo
  const token = authHeader.split(' ')[1];

  try {
    // 3. Token ko verify karo (Check karo ke asli hai ya nakli)
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. User ki info request mein daal do taake aage kaam aa sake
    req.user = verified;
    
    // 5. Guard bolta hai: "Sab theek hai, andar jao!"
    next(); 
  } catch (error) {
    res.status(400).json({ error: 'Invalid or Expired Token' });
  }
};