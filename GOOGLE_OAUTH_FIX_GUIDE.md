# 🔧 Google OAuth Fix Guide for Vercel Deployment

## 🚨 **Problem Identified**

### **Error 401: invalid_client**
The Google OAuth client is not found because:

1. **Missing `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable**
2. **Google OAuth client not configured for production domain**
3. **Authorized domains missing in Firebase Console**
4. **OAuth client configuration mismatch**

---

## 🔍 **Step-by-Step Diagnosis**

### **1. ✅ Check Current Configuration**

#### **Missing Environment Variable:**
```typescript
// In LoginModal.tsx line 48:
client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID",
```
**Issue:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not set in Vercel.

#### **Current Firebase Config:**
```typescript
// In client.ts - Missing Google OAuth config:
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
// Missing: NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

---

## 🛠️ **Complete Fix Steps**

### **Step 1: Get Google OAuth Client ID**

#### **Firebase Console:**
1. **Go to Firebase Console** → Project Settings → General
2. **Scroll down to "Your apps" section**
3. **Find your Web App** → Click "Config" 
4. **Copy the `clientId` from the config**

#### **Or Google Cloud Console:**
1. **Go to Google Cloud Console** → APIs & Services → Credentials
2. **Find "OAuth 2.0 Client IDs"**
3. **Copy the Web Client ID**

### **Step 2: Add Environment Variables in Vercel**

#### **Required Variables:**
```bash
# Add these in Vercel Dashboard → Settings → Environment Variables:

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# IMPORTANT - Add this missing variable:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### **Step 3: Configure Firebase Authentication**

#### **Enable Google Provider:**
1. **Firebase Console** → Authentication → Sign-in method
2. **Click "Google"** → Enable
3. **Configure settings:**
   - **Enable** toggle: ON
   - **Project public-facing name:** vStudent
   - **Project support email:** your-email@your-domain.com
   - **Authorized domains:** Add `vstudent.in`

### **Step 4: Add Authorized Domains**

#### **In Firebase Console:**
1. **Authentication** → Settings → Authorized domains
2. **Add these domains:**
   ```
   vstudent.in
   www.vstudent.in
   localhost  (for development)
   ```

#### **In Google Cloud Console:**
1. **APIs & Services** → Credentials
2. **Find your OAuth 2.0 Client ID**
3. **Click to edit** → Add to "Authorized JavaScript origins":
   ```
   https://vstudent.in
   http://localhost:3000
   ```

### **Step 5: Configure OAuth Consent Screen**

#### **Google Cloud Console:**
1. **APIs & Services** → OAuth consent screen
2. **Set up:**
   - **Application name:** vStudent
   - **User support email:** your-email@your-domain.com
   - **Developer contact:** your-email@your-domain.com
   - **Scopes:** Add `email`, `profile`, `openid`

---

## 🔧 **Updated Firebase Configuration**

### **Fixed Client Configuration:**
```typescript
// src/lib/firebase/client.ts - ADD THIS:
export function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId || !googleClientId) {
    throw new Error(
      "Missing Firebase env vars. Set NEXT_PUBLIC_FIREBASE_* and NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local (see .env.example).",
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    googleClientId,
  };
}

export function getFirebaseApp() {
  if (getApps().length) return getApps()[0]!;

  const config = getFirebaseConfig();
  
  return initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
}

export function getGoogleClientId() {
  return getFirebaseConfig().googleClientId;
}
```

### **Updated LoginModal:**
```typescript
// src/components/auth/LoginModal.tsx - UPDATE THIS:
import { getGoogleClientId } from "@/lib/firebase/client";

// In the useEffect:
window.google.accounts.id.initialize({
  client_id: getGoogleClientId(), // Use the new function
  callback: window.handleCredentialResponse,
});
```

---

## 🚀 **Vercel Deployment Steps**

### **1. Set Environment Variables:**
```bash
# In Vercel Dashboard → Settings → Environment Variables:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vstudent.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vstudent-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vstudent-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123
```

### **2. Deploy:**
```bash
git add .
git commit -m "fix: add google oauth client id for production"
git push
```

### **3. Verify:**
1. **Open https://vstudent.in**
2. **Click "Sign in with Google"**
3. **Should work** without 401 error

---

## 🔍 **Troubleshooting**

### **If Still Getting 401 Error:**

#### **Check Environment Variables:**
```bash
# In Vercel CLI:
vercel env ls

# Should show NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

#### **Check Firebase Console:**
1. **Authentication** → Sign-in method → Google
2. **Verify it's ENABLED**
3. **Check authorized domains** include `vstudent.in`

#### **Check Google Cloud Console:**
1. **APIs & Services** → Credentials
2. **Verify OAuth client exists**
3. **Check authorized origins** include `https://vstudent.in`

### **Common Issues:**
- **Wrong client ID** → Copy from correct place
- **Missing domain** → Add `vstudent.in` to authorized domains
- **Environment variable not set** → Add in Vercel dashboard
- **CORS issues** → Add correct origins

---

## 🎯 **Expected Result**

### **✅ Working Google Sign-In:**
```
User clicks "Sign in with Google"
→ Google OAuth popup opens
→ User authenticates
→ Token returned to app
→ User signed in successfully
→ Redirected to dashboard
```

### **✅ No More Errors:**
- **No 401 invalid_client**
- **No authorization errors**
- **Smooth authentication flow**
- **Works on production domain**

---

## 📋 **Final Checklist**

### **Before Deploy:**
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set in Vercel
- ✅ Google provider enabled in Firebase
- ✅ `vstudent.in` added to authorized domains
- ✅ OAuth consent screen configured
- ✅ Updated Firebase client config

### **After Deploy:**
- ✅ Test Google sign-in on production
- ✅ Verify no console errors
- ✅ Check user authentication works
- ✅ Confirm redirect flow works

---

## 🚀 **Ready to Deploy!**

After following these steps:

1. **Environment variables** configured correctly
2. **Firebase Authentication** set up properly
3. **Google OAuth client** authorized for domain
4. **Code updated** to use client ID
5. **Production deployment** will work

**Your Google OAuth will work perfectly on vstudent.in!** 🎉
