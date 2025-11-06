// ============================================
// RAZORPAY PAYMENT INTEGRATION
// ============================================

// Create checkout session via Firebase Function
async function createCheckoutSession(planType) {
    const user = getCurrentUser();
    if (!user) {
        showError('Please sign in first');
        return null;
    }

    try {
        // Show loading state
        const button = document.querySelector(`[data-plan="${planType}"]`);
        if (button) {
            button.disabled = true;
            button.textContent = 'Processing...';
        }

        // Get Firebase Auth token for authentication
        const idToken = await user.getIdToken();

        // Prepare request body
        const pricingInfo = PRICING[planType];
        if (!pricingInfo) {
            throw new Error(`Invalid plan type: ${planType}`);
        }
        
        const requestBody = {
            userId: user.uid,
            planType: planType,
            trialDays: planType !== 'one-time' ? (pricingInfo.trialDays || 0) : 0
        };

        console.log('Creating order with:', requestBody);
        console.log('PRICING object:', PRICING);
        console.log('PRICING[planType]:', PRICING[planType]);

        // Call Firebase Function to create Razorpay order
        const response = await fetch(`${FUNCTIONS_BASE_URL}/createRazorpayOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If response is not JSON, use status text
                errorData = { error: `Server error: ${response.status} ${response.statusText}` };
            }
            console.error('Server error response:', errorData);
            const errorMessage = errorData.error || errorData.message || `Server error: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Restore button
        if (button) {
            button.disabled = false;
            button.textContent = button.getAttribute('data-original-text') || 'Choose Plan';
        }

        return data;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        showError(error.message || 'Failed to create payment session. Please try again.');
        
        // Restore button
        const button = document.querySelector(`[data-plan="${planType}"]`);
        if (button) {
            button.disabled = false;
            button.textContent = button.getAttribute('data-original-text') || 'Choose Plan';
        }
        
        return null;
    }
}

// Initialize Razorpay Checkout
function initializeRazorpayCheckout(orderData) {
    return new Promise((resolve, reject) => {
        // Load Razorpay script if not already loaded
        if (window.Razorpay) {
            proceedWithCheckout();
        } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = proceedWithCheckout;
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
        }

        function proceedWithCheckout() {
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'YT Study Notes',
                description: orderData.description || 'Premium Upgrade',
                order_id: orderData.orderId,
                handler: function(response) {
                    // Payment successful
                    handlePaymentSuccess(response, orderData);
                    resolve(response);
                },
                prefill: {
                    name: orderData.userName || '',
                    email: orderData.userEmail || '',
                    contact: orderData.userPhone || ''
                },
                theme: {
                    color: '#facc15'
                },
                modal: {
                    ondismiss: function() {
                        // User closed the payment dialog
                        reject(new Error('Payment cancelled by user'));
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();
        }
    });
}

// Handle successful payment
async function handlePaymentSuccess(response, orderData) {
    try {
        // Get Firebase Auth token for authentication
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        const idToken = await user.getIdToken();

        // Verify payment with Firebase Function
        const verifyResponse = await fetch(`${FUNCTIONS_BASE_URL}/verifyRazorpayPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
                planType: orderData.planType
            })
        });

        if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
        }

        // Redirect to success page
        const successUrl = `${REDIRECT_URLS.success}?order_id=${response.razorpay_order_id}&plan=${orderData.planType}`;
        window.location.href = successUrl;
    } catch (error) {
        console.error('Payment verification error:', error);
        showError('Payment succeeded but verification failed. Please contact support.');
    }
}

// Handle payment button click
async function handlePaymentClick(planType) {
    // Check if user is signed in
    const user = getCurrentUser();
    if (!user) {
        showError('Please sign in first');
        return;
    }

    // Create checkout session
    const orderData = await createCheckoutSession(planType);
    if (!orderData) {
        return;
    }

    // Initialize Razorpay checkout
    try {
        await initializeRazorpayCheckout(orderData);
    } catch (error) {
        if (error.message !== 'Payment cancelled by user') {
            showError(error.message || 'Failed to initialize payment');
        }
    }
}

