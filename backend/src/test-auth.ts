import { AuthService } from './services/auth.service';
import { verifyToken } from './utils/jwt';

async function testAuth() {
  console.log('Testing Auth Service...');
  const authService = new AuthService();

  // Test valid login
  const result = await authService.login({
    email: 'admin@erp.com',
    password: 'Admin@123'
  });

  console.log('✅ Login successful! Token received.');
  console.log('User:', result.user);

  const payload = verifyToken(result.token);
  console.log('✅ Token verified successfully! Payload:', payload);
}

testAuth()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Auth test failed:', err);
    process.exit(1);
  });
