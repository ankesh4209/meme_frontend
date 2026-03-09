import React from "react";

const FAQ = [
  {
    q: "How do I deposit funds?",
    a: "Go to the Wallet page and use the Deposit by Card or Add Funds button. Follow the instructions to complete your deposit.",
  },
  {
    q: "How do I withdraw funds?",
    a: "On the Wallet page, enter the amount you wish to withdraw and click Withdraw. Withdrawals are allowed only after 7 days from your last deposit/update.",
  },
  {
    q: "When are daily notifications sent?",
    a: "Daily notifications are sent at 18:00 (6 PM) every day.",
  },
  {
    q: "How are bonus points calculated?",
    a: "You receive 10% of your deposit amount as bonus points each time you deposit.",
  },
  {
    q: "How do I make a manual payment?",
    a: "Scan the QR code on the Wallet page to make a manual payment.",
  },
];

const terms = `
1. All users must provide accurate information during registration.
2. Withdrawals are subject to a 7-day lock period after deposit.
3. Bonus points are non-transferable and have no cash value.
4. Manual payments must be confirmed by admin before funds are credited.
5. The platform is not responsible for losses due to market volatility.
6. By using this platform, you agree to all terms and conditions stated here.`;

const FaqAndTerms = () => (
  <div
    style={{
      maxWidth: 700,
      margin: "2rem auto",
      padding: 24,
      background: "#11151c",
      borderRadius: 16,
      color: "#fff",
    }}
  >
    <h2 style={{ marginBottom: 24 }}>Frequently Asked Questions</h2>
    <ul style={{ marginBottom: 32 }}>
      {FAQ.map((item, idx) => (
        <li key={idx} style={{ marginBottom: 18 }}>
          <strong>Q: {item.q}</strong>
          <br />
          <span style={{ color: "#FCD535" }}>A: {item.a}</span>
        </li>
      ))}
    </ul>
    <h2 style={{ marginBottom: 16 }}>Terms &amp; Conditions</h2>
    <pre
      style={{
        background: "#181c25",
        padding: 16,
        borderRadius: 8,
        color: "#FCD535",
      }}
    >
      {terms}
    </pre>
  </div>
);

export default FaqAndTerms;
