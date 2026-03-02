const fs = require("fs");
const path = require("path");

module.exports = async (paymentId, amount) => {
  const content = `
Ripple AI Donation Receipt

Payment ID: ${paymentId}
Amount: ₹${amount}
Date: ${new Date().toLocaleString()}

Thank you for supporting Ripple AI ❤️
`;

  const filePath = path.join(__dirname, `../receipts/${paymentId}.txt`);
  fs.writeFileSync(filePath, content);
};
