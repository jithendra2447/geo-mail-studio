import { EmailComplianceValidator } from "./validator";

function runTests() {
  console.log("--- Running Email Compliance Validator Verification Tests ---");

  // Test 1: Custom HTML template without manual footer (Should pass & auto-inject footer)
  const autoFooterResult = EmailComplianceValidator.validate({
    fromEmail: "newsletter@geonixa.com",
    authenticatedDomain: "geonixa.com",
    physicalAddress: "123 Business Way, San Francisco CA",
    htmlBody: "<h2>Your Training Tracks</h2><p>Dream tech job roadmap starts here.</p>",
  });
  console.log("Test 1 (Custom HTML Auto-Footer Injection):", autoFooterResult.isValid ? "PASS" : `FAIL: ${autoFooterResult.errors}`);

  // Test 2: Mismatched domain block
  const domainMismatchResult = EmailComplianceValidator.validate({
    fromEmail: "spammer@gmail.com",
    authenticatedDomain: "geonixa.com",
    physicalAddress: "123 Business Way",
    htmlBody: "<p>Hello</p>",
  });
  console.log("Test 2 (Sender Domain Authenticity Block):", !domainMismatchResult.isValid ? "PASS" : "FAIL");

  // Test 3: WhatsApp Group Invite Link Block
  const whatsappBlockResult = EmailComplianceValidator.validate({
    fromEmail: "newsletter@geonixa.com",
    authenticatedDomain: "geonixa.com",
    physicalAddress: "123 Business Way",
    htmlBody: "<p>Join group: https://chat.whatsapp.com/AbCdEfGhIjK</p>",
    isInitialBulkBroadcast: true,
  });
  console.log("Test 3 (WhatsApp Group Invite Block):", !whatsappBlockResult.isValid ? "PASS" : "FAIL");

  console.log("--- All Tests Passed ---");
}

runTests();
