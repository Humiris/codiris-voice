# How to Create an Apple Developer Account

To distribute your macOS app to others without the "Malware" warning, you need to enroll in the Apple Developer Program.

## Prerequisites
- An **Apple ID** (with two-factor authentication enabled).
- A valid **Credit Card** (to pay the $99 USD/year fee).
- **Legal Entity Documentation** (optional, only if enrolling as a Company/LLC). For individuals, your personal legal name is used.

## Step-by-Step Enrollment Guide

1.  **Go to the Enrollment Page**
    - Visit: [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)

2.  **Sign in with your Apple ID**
    - Click "Start Your Enrollment".
    - Sign in with the Apple ID you want to use for development.

3.  **Select Entity Type**
    - **Individual / Sole Proprietor**: Simplest option. Your personal name will appear as the "Seller" in the App Store and on the certificate.
    - **Company / Organization**: Requires a D-U-N-S Number and legal entity status. Your company name appears as the seller.

4.  **Enter Contact Information**
    - Provide your legal name, phone number, and address.
    - **Important**: This must match your government ID and credit card billing info exactly.

5.  **Verify Identity**
    - You may be asked to verify your identity using a driver's license or passport via the "Apple Developer" app on iOS, or through the website.

6.  **Pay the Annual Fee**
    - The cost is **$99 USD per year** (may vary slightly by region).
    - Check the "Automatic Renewal" box if you don't want your certificates to expire unexpectedly next year.

7.  **Wait for Activation**
    - **Individual** accounts are often activated within **24 hours**.
    - **Company** accounts can take **a few days** as Apple verifies the legal entity.

## What to do AFTER you are approved

Once your account is active, we will need to generate two things:
1.  **Developer ID Application Certificate**: To sign the app.
2.  **App-Specific Password**: To allow the notarization tool to talk to Apple's servers.

### Instructions for when you are ready:

1.  Open **Preocessing** (Applications > Utilities > Keychain Access).
2.  Go to **Certificate Assistant** > **Request a Certificate from a Certificate Authority**.
3.  Save the `.certSigningRequest` file to disk.
4.  Log in to [developer.apple.com/account](https://developer.apple.com/account).
5.  Go to **Certificates, Identifiers & Profiles** > **Certificates**.
6.  Click **(+)** and select **Developer ID Application**.
7.  Upload your `.certSigningRequest`.
8.  Download the resulting `.cer` file and double-click it to install it into your Keychain.

Once you have done this, let me know, and I will run the build script to properly sign and notarize your app!
