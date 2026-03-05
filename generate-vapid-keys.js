// Run: npx web-push generate-vapid-keys
// Then add to Vercel Environment Variables:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
//   VAPID_PRIVATE_KEY=<private key>
//   VAPID_EMAIL=mailto:kontakt@caseoutstudio.pl
//
// Or run this script: node generate-vapid-keys.js
const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();
console.log("\n=== VAPID Keys Generated ===\n");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("\nAdd these to Vercel → Settings → Environment Variables\n");
