# Progressive Web App (PWA) for Seblak Delivery

## Overview

The Seblak Delivery application has been enhanced with Progressive Web App (PWA) capabilities, allowing users to install it on their mobile devices (Android and iOS) and access it offline.

## Features

- **Installable**: Users can add the app to their home screen on both Android and iOS devices
- **Offline Support**: Basic functionality works even without an internet connection
- **Native-like Experience**: Full-screen mode without browser UI when launched from home screen
- **Fast Loading**: Cached resources for improved performance

## How to Install on Mobile Devices

### Android

1. Open the Seblak Delivery website in Chrome, Edge, Firefox, or Samsung Internet Browser
2. Navigate the site for a few seconds
3. A prompt should appear at the bottom of the screen saying "Add Seblak Delivery to Home Screen"
4. Tap "Install" or "Add"
5. If no prompt appears, tap the menu button (three dots) in the top-right corner
6. Select "Add to Home Screen" or "Install App"

### iOS (iPhone/iPad)

1. Open the Seblak Delivery website in Safari (iOS 16.4 or later)
2. Tap the Share button (square with an arrow) at the bottom of the screen
3. Scroll down and tap "Add to Home Screen"
4. Confirm by tapping "Add" in the top-right corner

## Technical Implementation

The PWA implementation includes:

1. **Web App Manifest**: Defines how the app appears when installed
   - Located at: `/manifest.json`

2. **Service Worker**: Enables offline functionality and caching
   - Located at: `/service-worker.js`

3. **App Icons**: SVG icons that scale for all device sizes
   - Located at: `/icons/`

## Development Notes

- The PWA assets are automatically copied to the build directory during the build process
- To modify PWA behavior, edit the service worker file at `client/public/service-worker.js`
- To change app appearance when installed, edit the manifest at `client/public/manifest.json`

## Testing PWA Installation

1. Build and deploy the application
2. Visit the deployed URL on a mobile device
3. Follow the installation instructions above
4. Verify the app launches from the home screen
5. Test offline functionality by enabling airplane mode and launching the app

## Troubleshooting

- If installation doesn't work, ensure you're using a supported browser
- For iOS, make sure you're using Safari and iOS 16.4 or later
- Check browser console for any service worker registration errors