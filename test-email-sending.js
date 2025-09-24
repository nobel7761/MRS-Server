const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3333/api'; // Adjust if your server runs on different port

async function testEmailService() {
  try {
    // console.log('🧪 Testing Email Service...\n');

    // Step 1: Check service health
    // console.log('📊 Step 1: Checking email service health...');
    // const healthResponse = await axios.get(`${BASE_URL}/email/health`);
    // console.log('✅ Service Health:', healthResponse.data.status);
    // console.log('   Message:', healthResponse.data.message);
    // console.log(
    //   '   Timestamp:',
    //   new Date(healthResponse.data.timestamp).toLocaleString(),
    // );

    // Step 2: Check available templates
    // console.log('\n📝 Step 2: Checking available templates...');
    // const templatesResponse = await axios.get(`${BASE_URL}/email/templates`);
    // console.log('✅ Available Templates:');
    // templatesResponse.data.templates.forEach((template) => {
    //   console.log(`   - ${template.name}: ${template.description}`);
    // });

    // Step 3: Test sending a custom test email
    // console.log('\n📧 Step 3: Testing custom email sending...');
    const testEmailResponse = await axios.post(`${BASE_URL}/email/send-test`, {
      toEmail: 'test@example.com',
      subject: 'Test Email from MRS Server',
      template: 'silver-jubilee-announcement',
      templateData: {
        announcementDate: new Date().toLocaleDateString(),
        establishmentYear: 1999,
        currentYear: new Date().getFullYear(),
      },
    });
    // console.log('✅ Test Email Sent:', testEmailResponse.data);

    // console.log('\n🎉 Email service test completed successfully!');
  } catch (error) {
    console.error(
      '❌ Error testing email service:',
      error.response?.data || error.message,
    );

    if (error.response?.status === 404) {
      // console.log(
      //   '\n💡 Make sure your server is running and the endpoints are correct',
      // );
    } else if (error.response?.status === 500) {
      // console.log(
      //   '\n💡 Check your server logs for more details about the error',
      // );
    }
  }
}

// Check if axios is available
try {
  require.resolve('axios');
  testEmailService();
} catch (e) {
  // console.log('📦 Installing axios...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    // console.log('✅ Axios installed successfully');
    testEmailService();
  } catch (installError) {
    console.error('❌ Failed to install axios:', installError.message);
    // console.log('\n💡 Please run: npm install axios');
  }
}
