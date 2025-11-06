// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Firebase configuration (same as extension)
const firebaseConfig = {
    apiKey: "AIzaSyDJArynkdVArn2pT58CHZaAHkG1EEAlD6s",
    authDomain: "yt-study-notes.firebaseapp.com",
    projectId: "yt-study-notes",
    storageBucket: "yt-study-notes.appspot.com",
    messagingSenderId: "195954422011",
    appId: "1:195954422011:web:883aa7021078db8cb9405e",
    measurementId: "G-EGHCWT8XKF"
};

// Firebase Functions base URL
// TODO: Replace with your actual Firebase Functions URL after deployment
const FUNCTIONS_BASE_URL = "https://us-central1-yt-study-notes.cloudfunctions.net";

// Razorpay Configuration
// TODO: Replace with your actual Razorpay publishable key
const RAZORPAY_KEY_ID = "rzp_test_Rc5wMwaZkbtRjZ"; // Replace with your Razorpay key

// Pricing Configuration (in INR - update with your actual prices)
const PRICING = {
    'one-time': {
        amount: 999, // ₹999
        currency: "INR",
        label: "Lifetime Premium"
    },
    monthly: {
        amount: 199, // ₹199/month
        currency: "INR",
        label: "Monthly Subscription",
        trialDays: 14
    },
    annual: {
        amount: 1999, // ₹1999/year
        currency: "INR",
        label: "Annual Subscription",
        trialDays: 14
    }
};

// Success/Cancel redirect URLs
const REDIRECT_URLS = {
    success: window.location.origin + "/success.html",
    cancel: window.location.origin + "/cancel.html"
};

