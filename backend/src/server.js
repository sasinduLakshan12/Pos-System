const app = require('./app');
const connectDB = require('./db/mongoDatabase');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 LOOMPOS BACKEND REST API RUNNING ON PORT ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
  });
})();
