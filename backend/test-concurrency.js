const http = require('http');

const PORT = 5000;

function makeCheckoutRequest(productId, qty) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      items: [{ productId, quantity: qty }]
    });

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runConcurrencyTest() {
  console.log('⚡ Starting Concurrency Verification Test...');
  console.log('Target: UltraWide 34" Monitor (Product ID: 3, Limited Stock: 3 units)');
  console.log('Simulating 15 simultaneous checkout requests (1 unit each)...\n');

  const NUM_CONCURRENT_USERS = 15;
  const PRODUCT_ID = 3; // UltraWide Monitor with 3 stock
  const QTY_PER_ORDER = 1;

  const promises = [];
  for (let i = 1; i <= NUM_CONCURRENT_USERS; i++) {
    promises.push(makeCheckoutRequest(PRODUCT_ID, QTY_PER_ORDER));
  }

  const results = await Promise.all(promises);

  let successCount = 0;
  let failureCount = 0;

  results.forEach((res, index) => {
    if (res.status === 201 && res.body.success) {
      successCount++;
      console.log(`[User ${index + 1}] ✅ Reserved Order: ${res.body.data.id}`);
    } else {
      failureCount++;
      console.log(`[User ${index + 1}] ❌ Rejected: ${res.body.error}`);
    }
  });

  console.log('\n================ TEST SUMMARY ================');
  console.log(`Total Requests Sent : ${NUM_CONCURRENT_USERS}`);
  console.log(`Successful Locks    : ${successCount}`);
  console.log(`Rejected (Out of Stock): ${failureCount}`);

  if (successCount === 3 && failureCount === 12) {
    console.log('🏆 VERIFICATION PASSED: No overselling occurred! Stock integrity maintained perfectly.');
  } else {
    console.log(`⚠️ VERIFICATION ALERT: Expected 3 successes and 12 failures, got ${successCount} / ${failureCount}`);
  }
}

runConcurrencyTest();
