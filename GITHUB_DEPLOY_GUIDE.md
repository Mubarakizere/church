# 🚀 Automated GitHub Deployment Guide (Hostinger)
### Anglican Church of Rwanda — Shyogwe Diocese

With this setup, every time you push code to GitHub (`main` branch), GitHub Actions will **automatically build your frontend with Vite** and **deploy only the compiled files (`dist/`) directly to Hostinger**. You never have to manually zip or upload files again!

---

## 🔑 Step 1: Find your FTP credentials on Hostinger

1. Log in to your [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Select your website (`earshyogwe.com`) and click **Manage**.
3. In the sidebar or search bar, go to **Files** ➔ **FTP Accounts**.
4. You will see:
   - **FTP IP / Host Name** (e.g. `ftp.earshyogwe.com` or something like `195.35.x.x`)
   - **FTP Username** (e.g. `u123456789` or `earshyogw_admin`)
   - **FTP Password** (click *Change Password* if you do not remember it)
   - **Port**: `21`

---

## 🔒 Step 2: Add Secrets to GitHub

1. Open your repository on GitHub:
   👉 **https://github.com/Mubarakizere/church/settings/secrets/actions**
2. Click the green button: **"New repository secret"**.
3. Add the following **3 required secrets**:

| Secret Name | Value Example | Description |
| :--- | :--- | :--- |
| `FTP_SERVER` | `ftp.earshyogwe.com` (or IP from Hostinger) | Hostinger FTP hostname or server IP |
| `FTP_USERNAME` | `u123456789` | Your Hostinger FTP username |
| `FTP_PASSWORD` | `YourFtpPassword123` | Your Hostinger FTP password |

*(Optional Secrets)*:
- `FTP_REMOTE_ROOT`: Default is `public_html/`. If your domain uses a subfolder in Hostinger, you can set `domains/earshyogwe.com/public_html/`.
- `FTP_PROTOCOL`: Default is `ftp`.

---

## ⚡ Step 3: Trigger the First Automated Deployment

Once you have added the secrets in GitHub:
1. Go to the **Actions** tab on GitHub:
   👉 **https://github.com/Mubarakizere/church/actions**
2. Click on **"Deploy Frontend to Hostinger"** on the left menu.
3. Click the **"Run workflow"** button on the right, select branch `main`, and click **Run workflow**.
4. GitHub will:
   - Checkout your code.
   - Install dependencies.
   - Run `npm run build` to create `dist/`.
   - Upload the compiled `dist/` directly to Hostinger's `public_html/`.
5. In 1–2 minutes, your website will be live at **https://earshyogwe.com**!

From now on, **any time you run `git push origin main`**, your live site updates automatically!
