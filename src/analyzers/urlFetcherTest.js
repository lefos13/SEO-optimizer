/**
 * URL Fetcher Test Script
 * Test fetching from the problematic URL
 */

const { fetchUrl } = require('./urlFetcher');

async function testUrlFetch() {
  console.log('🧪 Starting URL Fetch Test...\n');

  const testUrl = 'https://lefos13.github.io/portfolio-template/';

  console.log(`📡 Fetching: ${testUrl}`);
  console.log('⏳ Please wait...\n');

  try {
    const result = await fetchUrl(testUrl, {
      timeout: 15000,
      maxRedirects: 5,
    });

    console.log('✅ Fetch completed!');
    console.log('\n📊 Result:');
    console.log('- Success:', result.success);
    console.log('- URL:', result.url);
    console.log('- Final URL:', result.finalUrl);
    console.log('- Title:', result.title);
    console.log('- Description:', result.description);

    if (result.html) {
      console.log('\n📄 HTML Content:');
      console.log('- Length:', result.html.length, 'characters');
      console.log('- First 500 chars:', result.html.substring(0, 500));
      console.log(
        '- Contains "<html":',
        result.html.toLowerCase().includes('<html')
      );
      console.log(
        '- Contains "<!doctype":',
        result.html.toLowerCase().includes('<!doctype')
      );

      // Check for garbled characters (control characters)
      const hasGarbledChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(
        result.html.substring(0, 100)
      );
      console.log('- Has garbled characters:', hasGarbledChars);
    }

    if (result.error) {
      console.log('\n❌ Error:', result.error);
      console.log('- Error Code:', result.errorCode);
    }
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testUrlFetch();
