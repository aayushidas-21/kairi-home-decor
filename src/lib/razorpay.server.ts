import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export let razorpayInstance: Razorpay | null = null;

if (keyId && keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("Razorpay initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Razorpay:", err);
  }
} else {
  console.warn("Razorpay key credentials are not fully configured in environment variables. Falling back to sandbox/mock mode.");
}

export { keyId, keySecret };
