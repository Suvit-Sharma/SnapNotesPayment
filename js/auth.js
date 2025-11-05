// ============================================
// FIREBASE AUTHENTICATION
// ============================================

let auth = null;
let db = null;

// Initialize Firebase
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Sign in with Google
async function signInWithGoogle() {
    if (!auth) {
        console.error('Firebase Auth not initialized');
        return false;
    }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        console.log('Signed in:', result.user.email);
        return result.user;
    } catch (error) {
        console.error('Sign in error:', error);
        showError('Sign in failed: ' + error.message);
        return null;
    }
}

// Sign out
async function signOut() {
    if (!auth) return;
    
    try {
        await auth.signOut();
        console.log('Signed out');
        return true;
    } catch (error) {
        console.error('Sign out error:', error);
        return false;
    }
}

// Get current user
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// Listen to auth state changes
function onAuthStateChanged(callback) {
    if (!auth) return;
    return auth.onAuthStateChanged(callback);
}

// Get user's premium status from Firestore
async function getPremiumStatus() {
    if (!db || !auth || !auth.currentUser) {
        return null;
    }

    try {
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        
        if (!userDoc.exists) {
            return {
                isPremium: false,
                subscriptionType: null,
                trialEndsAt: null,
                expiresAt: null
            };
        }

        const data = userDoc.data();
        const premium = data.premium || {};
        
        // Check if user has active premium
        let isPremium = premium.isPremium || false;
        
        // Check trial period
        if (premium.trialEndsAt) {
            const trialEnd = premium.trialEndsAt.toDate();
            const now = new Date();
            if (trialEnd > now) {
                isPremium = true; // Still in trial
            }
        }
        
        // Check expiration for one-time payments
        if (premium.expiresAt && premium.subscriptionType === 'one-time') {
            const expires = premium.expiresAt.toDate();
            const now = new Date();
            if (expires < now) {
                isPremium = false; // Expired
            }
        }

        return {
            isPremium: isPremium,
            subscriptionType: premium.subscriptionType || null,
            trialEndsAt: premium.trialEndsAt ? premium.trialEndsAt.toDate() : null,
            expiresAt: premium.expiresAt ? premium.expiresAt.toDate() : null,
            stripeCustomerId: premium.stripeCustomerId || null,
            stripeSubscriptionId: premium.stripeSubscriptionId || null
        };
    } catch (error) {
        console.error('Error getting premium status:', error);
        return null;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

