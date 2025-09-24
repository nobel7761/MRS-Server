const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your-jwt-token-here'; // Replace with actual JWT token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  try {
    // 1. Test Service Health
    console.log('1. Testing Service Health...');
    const health = await api.get('/email/health');
    console.log('✅ Health Check:', health.data);
    console.log('');

    // 2. Get Available Templates
    console.log('2. Getting Available Templates...');
    const templates = await api.get('/email/templates');
    console.log('✅ Templates:', templates.data);
    console.log('');

    // 3. Test Configuration
    console.log('3. Testing Email Configuration...');
    const configTest = await api.post('/email/test-configuration');
    console.log('✅ Configuration Test:', configTest.data);
    console.log('');

    // 4. Send Test Email
    console.log('4. Sending Test Email...');
    const testEmail = await api.post('/email/send-test', {
      toEmail: 'test@example.com',
      subject: 'Test Email from MRS Server',
      template: 'silver-jubilee-announcement',
      templateData: {
        announcementDate: new Date().toLocaleDateString(),
        establishmentYear: 1999,
        currentYear: new Date().getFullYear(),
      },
    });
    console.log('✅ Test Email:', testEmail.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log(
        '\n💡 Make sure to set a valid JWT token in TEST_TOKEN variable',
      );
    }
  }
}

// Run tests
testEmailService();
