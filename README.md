# YT Study Notes - Payment Page

Payment page for YT Study Notes Chrome extension, hosted on GitHub Pages.

## Setup Instructions

### 1. Create GitHub Repository

1. Go to GitHub and create a new **public** repository named `SnapNotesPayment`
2. Clone it locally or prepare to push files

### 2. Configure Firebase

#### Update `js/config.js`:

1. **Firebase Config**: Already configured (matches extension)
2. **Firebase Functions URL**: Update after deploying Functions
   ```javascript
   const FUNCTIONS_BASE_URL = "https://us-central1-yt-study-notes.cloudfunctions.net";
   ```
3. **Razorpay Key**: Add your Razorpay publishable key
   ```javascript
   const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_ID_HERE";
   ```
4. **Pricing**: Update with your actual prices (currently in INR)
   ```javascript
   const PRICING = {
       oneTime: { amount: 999, currency: "INR" },
       monthly: { amount: 199, currency: "INR", trialDays: 14 },
       annual: { amount: 1999, currency: "INR", trialDays: 14 }
   };
   ```

### 3. Enable GitHub Pages

1. Push all files to your repository
2. Go to Repository Settings → Pages
3. Source: Select `main` branch (or your default branch)
4. Folder: `/ (root)` or `/payment-page` (if you put files in subfolder)
5. Save

Your site will be available at: `https://suvit-sharma.github.io/SnapNotesPayment/`

### 4. Configure Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Add authorized domains:
   - `suvit-sharma.github.io`
   - `localhost` (for local testing)

### 5. Update Extension Redirect

In your extension's `upgrade-prompt.js`, update the redirect URL:

```javascript
upgradeBtn.onclick = () => {
    window.open('https://suvit-sharma.github.io/SnapNotesPayment/', '_blank');
    backdrop.remove();
};
```

## File Structure

```
payment-page/
├── index.html          # Main payment page
├── success.html        # Payment success page
├── cancel.html         # Payment cancelled page
├── css/
│   └── styles.css      # Stylesheet
├── js/
│   ├── config.js       # Configuration (Firebase, Razorpay, pricing)
│   ├── auth.js         # Firebase Authentication
│   ├── payment.js      # Razorpay payment integration
│   └── main.js         # Main application logic
└── README.md           # This file
```

## Features

- ✅ Firebase Authentication (Google Sign-in)
- ✅ Premium status display
- ✅ Three payment options (One-time, Monthly, Annual)
- ✅ 14-day free trial for subscriptions
- ✅ Razorpay payment integration
- ✅ Success/Cancel pages
- ✅ Responsive design matching extension style
- ✅ Error handling

## Firebase Functions Required

You'll need to create these Firebase Functions:

1. **`createRazorpayOrder`** - Creates Razorpay order
   - Input: `{ userId, planType, amount, currency, trialDays }`
   - Output: `{ orderId, amount, currency, description, userName, userEmail }`

2. **`verifyRazorpayPayment`** - Verifies payment and updates Firestore
   - Input: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, planType }`
   - Output: `{ success: true }`

3. **`razorpayWebhook`** - Handles Razorpay webhooks
   - Events: `payment.captured`, `subscription.created`, `subscription.activated`, etc.

## Testing

### Local Testing

1. Serve files locally (use a local server, not `file://`)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

2. Access at `http://localhost:8000`

3. Test authentication and payment flow

### Production Testing

1. Use Razorpay test mode
2. Test with test cards:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
   - Any CVV, any future expiry date

## Customization

### Change Colors

Edit `css/styles.css`:
```css
:root {
    --accent: #facc15;  /* Yellow accent */
    --accent-dark: #78350f;
}
```

### Change Pricing

Edit `js/config.js`:
```javascript
const PRICING = {
    oneTime: { amount: 999, currency: "INR" },
    // ...
};
```

### Change Trial Period

Edit `js/config.js`:
```javascript
monthly: { trialDays: 14 }, // Change to your desired days
annual: { trialDays: 14 }
```

## Security Notes

- ✅ Firebase API keys are safe to expose (public by design)
- ✅ Razorpay secret key stays in Firebase Functions (never in client code)
- ✅ All sensitive operations happen server-side
- ✅ Firebase Security Rules protect Firestore data

## Support

For issues or questions:
1. Check Firebase Functions logs
2. Check browser console for errors
3. Verify Firebase authorized domains
4. Verify Razorpay webhook configuration

## Next Steps

1. Create Firebase Functions (see main plan)
2. Deploy Functions
3. Update `FUNCTIONS_BASE_URL` in `config.js`
4. Add Razorpay publishable key
5. Test complete payment flow
6. Update extension to redirect to payment page

