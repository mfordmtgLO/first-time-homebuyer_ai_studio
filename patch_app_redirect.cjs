const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  useEffect(() => {
    // Safety timeout to prevent infinite blank screen if Firebase offline or blocked
    const timer = setTimeout(() => {`;

const replacement = `  useEffect(() => {
    // Catch Google Redirect Errors if any
    import("firebase/auth").then(({ getRedirectResult, getAuth }) => {
      getRedirectResult(getAuth()).catch(err => {
        console.error("LO Login Redirect Error:", err);
        alert("Google Sign-In failed: " + (err.message || "Unknown error. Check Google Cloud OAuth settings."));
      });
    });

    // Safety timeout to prevent infinite blank screen if Firebase offline or blocked
    const timer = setTimeout(() => {`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Success patching App.tsx");
} else {
  console.log("Failed to find target block in App.tsx");
}
