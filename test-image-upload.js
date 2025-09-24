const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Test script for image upload functionality
async function testImageUpload() {
  try {
    console.log('Testing image upload functionality...');

    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Write test image to file
    fs.writeFileSync('./test-image.png', testImageBuffer);

    // Create form data
    const formData = new FormData();
    formData.append('bannerImage', fs.createReadStream('./test-image.png'));

    // Test the upload endpoint
    const response = await axios.post(
      'http://localhost:3000/events/upload-banner',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    console.log('✅ Upload successful!');
    console.log('Banner Image URL:', response.data.bannerImageUrl);

    // Clean up test file
    fs.unlinkSync('./test-image.png');
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
  }
}

// Test event creation with image upload
async function testEventCreationWithImage() {
  try {
    console.log('\nTesting event creation with image upload...');

    // Create a simple test image
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    fs.writeFileSync('./test-event-image.png', testImageBuffer);

    const formData = new FormData();
    formData.append(
      'bannerImage',
      fs.createReadStream('./test-event-image.png'),
    );
    formData.append('title', 'Test Event with Image');
    formData.append('shortDescription', 'A test event with image upload');
    formData.append(
      'fullDescription',
      'This is a full description for the test event',
    );
    formData.append('date', '2024-12-31T10:00:00.000Z');
    formData.append('startsTime', '10:00 AM');
    formData.append('venue', 'Test Venue');
    formData.append('organizerName', 'Test Organizer');
    formData.append('organizerContactInfo', 'test@example.com');
    formData.append('isPaidEvent', 'false');
    formData.append('seatLimit', '100');
    formData.append('status', 'Upcoming');
    formData.append('visibility', 'Public');

    const response = await axios.post(
      'http://localhost:3000/events',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    console.log('✅ Event creation with image successful!');
    console.log('Event ID:', response.data.event._id);
    console.log('Banner Image URL:', response.data.event.bannerImage);

    // Clean up test file
    fs.unlinkSync('./test-event-image.png');
  } catch (error) {
    console.error(
      '❌ Event creation failed:',
      error.response?.data || error.message,
    );
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting image upload tests...\n');
  console.log('Make sure your server is running on http://localhost:3000');
  console.log('And you have set up your Cloudinary environment variables:\n');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret\n');

  testImageUpload()
    .then(() => testEventCreationWithImage())
    .then(() => console.log('\n🎉 All tests completed!'))
    .catch(console.error);
}

module.exports = { testImageUpload, testEventCreationWithImage };
