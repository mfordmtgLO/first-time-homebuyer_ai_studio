const admin = require("firebase-admin");
const serviceAccount = require("./firebase-applet-config.json");

// Normally we'd use a real service account key, but let's see if we can just update the role in firestore directly
const fs = require('fs');

