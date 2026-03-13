# 🚀 Vercel Environment Setup Guide

## ✅ **Required Environment Variables for Production**

Add these in **Vercel Dashboard → Settings → Environment Variables**:

### **Firebase Configuration:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourApiKeyHere
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vstudent.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vstudent-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vstudent-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123

# IMPORTANT - Missing variable causing Google OAuth error:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

### **Firebase Admin (for server-side):**
```bash
FIREBASE_PROJECT_ID=vstudent-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@vstudent-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## 🔧 **Where to Get These Values**

### **1. Firebase Console → Project Settings → General:**
- **API Key:** `apiKey`
- **Auth Domain:** `authDomain`
- **Project ID:** `projectId`
- **Storage Bucket:** `storageBucket`
- **Messaging Sender ID:** `messagingSenderId`
- **App ID:** `appId`

### **2. Google Cloud Console → APIs & Services → Credentials:**
- **Google Client ID:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- **Service Account Email:** `FIREBASE_CLIENT_EMAIL`
- **Private Key:** `FIREBASE_PRIVATE_KEY`

---

## 🚨 **Critical Fix for Google OAuth**

### **The Problem:**
Your app was failing because `NEXT_PUBLIC_GOOGLE_CLIENT_ID` was missing in Vercel environment.

### **The Solution:**
1. **Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID`** in Vercel environment variables
2. **Configure Firebase Authentication** → Enable Google provider
3. **Add authorized domain** `vstudent.in` in Firebase Console

---

## 🎯 **Step-by-Step Vercel Setup**

### **1. Go to Vercel Dashboard:**
1. **Your Project** → Settings → Environment Variables
2. **Add each variable** with Production, Preview, Development environments

### **2. Add All Variables:**
Copy and paste these with your actual values:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourActualPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

### **3. Save and Deploy:**
1. **Click "Save"** for each variable
2. **Trigger new deployment** or wait for automatic deploy
3. **Test the application** on production URL

---

## 🔍 **Firebase Console Configuration**

### **Authentication Setup:**
1. **Firebase Console** → Authentication → Sign-in method
2. **Click "Google"** → Enable
3. **Settings:**
   - **Enable:** ON
   - **Project public-facing name:** vStudent
   - **Project support email:** your-email@vstudent.in
   - **Authorized domains:** Add `vstudent.in`

### **Authorized Domains:**
1. **Authentication** → Settings → Authorized domains
2. **Add:**
   ```
   vstudent.in
   www.vstudent.in
   localhost (for development)
   ```

---

## ✅ **Code Fixes Applied**

### **1. Updated Firebase Client:**
```typescript
// src/lib/firebase/client.ts
export function getGoogleClientId() {
  return getFirebaseConfig().googleClientId;
}

// Now properly loads NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

### **2. Updated LoginModal:**
```typescript
// src/components/auth/LoginModal.tsx
import { getGoogleClientId } from "@/lib/firebase/client";

// Uses proper client ID instead of fallback
window.google.accounts.id.initialize({
  client_id: getGoogleClientId(),
  callback: window.handleCredentialResponse,
});
```

---

## 🚀 **Deploy and Test**

### **After Setting Environment Variables:**
```bash
# Deploy changes
git add .
git commit -m "fix: add google oauth environment variables"
git push

# Or trigger manual deploy in Vercel dashboard
```

### **Test Google Sign-In:**
1. **Open https://vstudent.in**
2. **Click "Sign in with Google"**
3. **Should work** without 401 error
4. **Check browser console** for any errors

---

## 🎯 **Expected Result**

### **✅ Working Authentication:**
- **No more 401 invalid_client errors**
- **Google OAuth popup opens correctly**
- **User authentication succeeds**
- **Redirect to dashboard works**
- **All Firebase features functional**

### **✅ Production Ready:**
- **Environment-based configuration**
- **Secure credential handling**
- **Proper domain authorization**
- **Type-safe implementation**

---

## 📋 **Final Checklist**

### **Before Deploy:**
- ✅ All 10 environment variables set in Vercel
- ✅ Google provider enabled in Firebase Console
- ✅ `vstudent.in` added to authorized domains
- ✅ OAuth consent screen configured
- ✅ Code fixes deployed

### **After Deploy:**
- ✅ Test Google sign-in on production
- ✅ Verify no console errors
- ✅ Check user authentication flow
- ✅ Confirm all features work

---

## 🎉 **Success!**

After following this guide:

1. **Environment variables** properly configured
2. **Google OAuth** working on production
3. **Firebase Authentication** fully functional
4. **All features** working on vstudent.in

**Your vStudent app will work perfectly in production!** 🚀
