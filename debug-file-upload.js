const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testFileUpload() {
  try {
    // console.log('🧪 Testing file upload...');

    // Create a simple test image
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Write test image to file
    fs.writeFileSync('./debug-test.png', testImageBuffer);

    const formData = new FormData();
    formData.append('bannerImage', fs.createReadStream('./debug-test.png'));

    // console.log(
    //   '📤 Sending request to: http://localhost:3333/api/events/upload-banner',
    // );

    const response = await axios.post(
      'http://localhost:3333/api/events/upload-banner',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    // console.log('✅ Upload successful!');
    // console.log('Response:', response.data);

    // Clean up
    fs.unlinkSync('./debug-test.png');
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

// Run the test
testFileUpload();
