import { useState } from "react";
import { jsPDF } from "jspdf";

const RAZORPAY_KEY = "rzp_test_S9A1V7A41NSMuz"; // MUST match backend TEST key
const API_BASE = "http://localhost:5000/api";

export default function Donate() {
  const [amount, setAmount] = useState("100");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [error, setError] = useState("");

  // ---------------- LOAD RAZORPAY  ------------------------
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ---------------- HANDLE PAYMENT ----------------
  const handlePayment = async () => {
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!amount || Number(amount) < 1) {
      setError("Please enter a valid donation amount");
      return;
    }

    setLoading(true);

    const razorpayReady = await loadRazorpay();
    if (!razorpayReady) {
      setError("Razorpay SDK failed to load. Check your internet.");
      setLoading(false);
      return;
    }

    try {
      // ---------------- CREATE ORDER ---------------- 
      
      const res = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Order API failed: ${txt}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error("Order creation failed");

      const options = {
        key: RAZORPAY_KEY,
        amount: data.order.amount,
        currency: "INR",
        name: "Make-A-Wish",
        description: "Ripple AI Donation Platform",
        order_id: data.order.id,

        handler: async function (response) {
          try {
            // ---------------- VERIFY PAYMENT ----------------
            const verifyRes = await fetch(`${API_BASE}/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                email,
                amount
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error("Payment verification failed");
            }

            setPaymentId(response.razorpay_payment_id);
            setSuccess(true);
            generateReceipt(response.razorpay_payment_id, amount, email);
          } catch (err) {
            console.error("VERIFY ERROR:", err);
            setError("Payment succeeded but verification failed.");
          }
        },

        modal: {
          ondismiss: function () {
            setError("Payment cancelled by user");
          }
        },

        prefill: { email },
        theme: { color: "#2563eb" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      setError(err.message || "Backend not reachable");
    }

    setLoading(false);
  };

  // ---------------- SUCCESS PAGE ----------------
  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1>🎉 Thank You!</h1>
          <p>Your donation was successful.</p>
          <p><b>Payment ID:</b> {paymentId}</p>

          <button
            style={styles.btn}
            onClick={() => generateReceipt(paymentId, amount, email)}
          >
            Download Receipt
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => (window.location.href = "/")}
          >
            Donate Again
          </button>
        </div>
      </div>
    );
  }

  // ---------------- DONATION FORM ----------------
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Make-A-Wish</h1>
        <p>Helping children achieve their dreams</p>

        {error && <p style={styles.error}>{error}</p>}

        <label>Donation Amount (₹)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          style={styles.btn}
          disabled={loading}
          onClick={handlePayment}
        >
          {loading ? "Processing..." : "Donate Now"}
        </button>
      </div>
    </div>
  );
}

// ---------------- PDF RECEIPT ----------------
function generateReceipt(paymentId, amount, email) {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("Donation Receipt", 20, 20);

  doc.setFontSize(14);
  doc.text("Make-A-Wish - Ripple AI Platform", 20, 35);
  doc.line(20, 40, 190, 40);

  const date = new Date().toLocaleString();
  doc.text(`Receipt ID: ${paymentId}`, 20, 60);
  doc.text(`Email: ${email}`, 20, 75);
  doc.text(`Amount: ₹${amount}`, 20, 90);
  doc.text(`Date: ${date}`, 20, 105);

  doc.line(20, 115, 190, 115);
  doc.text("Thank you for making a difference ❤️", 20, 140);

  doc.save(`Donation_Receipt_${paymentId}.pdf`);
}

// ---------------- STYLES ----------------
const styles = {
  page: {
    height: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: "360px",
    background: "#1e293b",
    padding: "32px",
    borderRadius: "16px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0px 20px 50px rgba(0,0,0,0.25)",
    textAlign: "center"
  },
  btn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #94a3b8",
    background: "transparent",
    color: "white",
    cursor: "pointer"
  },
  error: {
    color: "#fca5a5",
    fontSize: "14px",
    marginBottom: "8px"
  }
};
