// Firebase Initialization & Config
// IMPORTANT: Replace the values below with your Firebase project config from the Firebase Console.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if user has updated the config
const isConfigConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let auth = null;
let db = null;

if (isConfigConfigured) {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("Firebase initialized successfully.");
    } catch (e) {
        console.error("Firebase initialization error:", e);
    }
} else {
    console.warn("Firebase is not configured! Falling back to localStorage mock mode.");
}

// Wrapper Functions for Auth & DB to use in app.js
window.vuelinaDb = {
    isConfigured: isConfigConfigured,

    async loginWithGoogle() {
        if (!isConfigConfigured) {
            // Mock Login
            return {
                uid: 'mock-g-' + Date.now(),
                email: 'google.mock@example.com',
                photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
                displayName: 'Google User'
            };
        }
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    },

    async logout() {
        if (!isConfigConfigured) return true;
        try {
            await auth.signOut();
            return true;
        } catch (error) {
            console.error("Logout Error:", error);
            throw error;
        }
    },

    onAuthStateChanged(callback) {
        if (!isConfigConfigured) {
            // Wait a tick and call with whatever is in localStorage
            setTimeout(() => {
                const user = JSON.parse(localStorage.getItem('vuelina_user') || 'null');
                callback(user);
            }, 100);
            return () => {}; // Unsubscribe mock
        }
        return auth.onAuthStateChanged(callback);
    },

    async saveUserData(uid, data) {
        if (!isConfigConfigured) {
            localStorage.setItem('vuelina_user_data', JSON.stringify(data));
            return;
        }
        try {
            await db.collection('users').doc(uid).set(data, { merge: true });
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    },

    async getUserData(uid) {
        if (!isConfigConfigured) {
            try {
                return JSON.parse(localStorage.getItem('vuelina_user_data') || '{}');
            } catch {
                return {};
            }
        }
        try {
            const doc = await db.collection('users').doc(uid).get();
            return doc.exists ? doc.data() : {};
        } catch (error) {
            console.error("Error fetching user data:", error);
            return {};
        }
    }
};
