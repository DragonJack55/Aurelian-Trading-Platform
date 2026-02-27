---
description: Build and deploy the application to Firebase Hosting (aureliantdtrade.it.com)
---

1. Commit and push current changes to GitHub
// turbo
2. git add . && git commit -m "Auto-commit before deployment" && git push origin main

3. Build the production files
// turbo
4. npm run build

5. Deploy to Firebase
// turbo
6. npx firebase-tools deploy --only hosting
