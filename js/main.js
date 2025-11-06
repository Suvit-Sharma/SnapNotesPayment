// ============================================
// MAIN APPLICATION LOGIC
// ============================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    if (!initFirebase()) {
        showError('Failed to initialize Firebase. Please refresh the page.');
        return;
    }

    // Set up auth state listener
    onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            await handleSignedIn(user);
        } else {
            // User is not signed in
            handleSignedOut();
        }
    });

    // Set up payment button listeners
    setupPaymentButtons();

    // Update pricing display
    updatePricingDisplay();
});

// Handle signed in state
async function handleSignedIn(user) {
    // Hide sign in screen, show payment screen
    document.getElementById('signInScreen').style.display = 'none';
    document.getElementById('paymentScreen').style.display = 'block';
    document.getElementById('loadingScreen').style.display = 'none';

    // Update UI
    document.getElementById('userEmail').textContent = user.email || 'User';
    document.getElementById('signOutBtn').style.display = 'inline-block';

    // Set up sign out button
    document.getElementById('signOutBtn').onclick = async () => {
        await signOut();
        window.location.reload();
    };

    // Update premium status
    await updatePremiumStatus();
}

// Handle signed out state
function handleSignedOut() {
    // Hide payment screen, show sign in screen
    document.getElementById('paymentScreen').style.display = 'none';
    document.getElementById('signInScreen').style.display = 'block';
    document.getElementById('loadingScreen').style.display = 'none';

    // Clear user info
    document.getElementById('userEmail').textContent = '';
    document.getElementById('signOutBtn').style.display = 'none';

    // Set up sign in button
    document.getElementById('signInBtn').onclick = async () => {
        await signInWithGoogle();
    };
}

// Update premium status display
async function updatePremiumStatus() {
    const status = await getPremiumStatus();
    if (!status) return;

    const badge = document.getElementById('premiumBadge');
    const statusBadge = document.getElementById('currentStatusBadge');
    const trialInfo = document.getElementById('trialInfo');
    const premiumInfo = document.getElementById('premiumInfo');

    if (status.isPremium) {
        // User has premium
        badge.textContent = 'Premium';
        badge.classList.add('premium');
        statusBadge.innerHTML = '<span class="status-icon">⭐</span><span class="status-text">Premium Active</span>';
        statusBadge.classList.add('premium');

        if (status.trialEndsAt && status.trialEndsAt > new Date()) {
            // Show trial info
            trialInfo.style.display = 'block';
            premiumInfo.style.display = 'none';
            const trialEnd = status.trialEndsAt.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('trialEndDate').textContent = trialEnd;
        } else if (status.expiresAt) {
            // Show expiration info
            trialInfo.style.display = 'none';
            premiumInfo.style.display = 'block';
            const expires = status.expiresAt.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('expiresDate').textContent = expires;
        } else {
            // Lifetime or subscription
            trialInfo.style.display = 'none';
            premiumInfo.style.display = 'block';
            document.getElementById('expiresDate').textContent = 'Never';
        }
    } else {
        // User is free
        badge.textContent = 'Free';
        badge.classList.remove('premium');
        statusBadge.innerHTML = '<span class="status-icon">⭐</span><span class="status-text">Free Plan</span>';
        statusBadge.classList.remove('premium');
        trialInfo.style.display = 'none';
        premiumInfo.style.display = 'none';
    }
}

// Set up payment button listeners
function setupPaymentButtons() {
    const buttons = document.querySelectorAll('.pricing-btn');
    buttons.forEach(button => {
        // Store original text
        button.setAttribute('data-original-text', button.textContent);
        
        button.addEventListener('click', () => {
            const planType = button.getAttribute('data-plan');
            if (planType) {
                handlePaymentClick(planType);
            }
        });
    });
}

// Update pricing display
function updatePricingDisplay() {
    // One-time
    document.getElementById('oneTimePrice').textContent = PRICING['one-time'].amount.toLocaleString('en-IN');
    
    // Monthly
    document.getElementById('monthlyPrice').textContent = PRICING.monthly.amount.toLocaleString('en-IN');
    
    // Annual
    document.getElementById('annualPrice').textContent = PRICING.annual.amount.toLocaleString('en-IN');
}

