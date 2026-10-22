const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  {
    sub: 'user_1',
    orgId: 'org_123',
    role: 'admin',
    email: 'test@example.com'
  },
  process.env.JWT_SECRET || 'test-secret',
  { expiresIn: '24h' }
);

console.log('\n=== YOUR TEST JWT ===\n');
console.log(token);
console.log('\nCopy this token and save it in Notepad.\n');