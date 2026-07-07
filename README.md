# 🌍 NGO Donation Platform

A secure, transparent, and responsive full-stack web application designed to bridge the gap between passionate donors and Non-Governmental Organizations (NGOs). This platform empowers verified organizations to host fundraising campaigns while providing donors with a seamless, trustworthy interface to contribute to causes they care about.

---

## 🚀 Key Features

* **Dual Authentication System:** Dedicated, secure registration and login portals for both individual Donors and NGO Organizations.
* **Dynamic Campaign Management:** Verified organizations can easily create, edit, update, and manage their targeted fundraising campaigns.
* **Interactive Discovery Dashboard:** Users can browse active campaigns, view detailed organization profiles, and explore specific organizational impacts.
* **Transparent Donation Tracking:** A clear interface allowing donors to select campaigns and complete secure contributions.
* **Rich Media Integration:** Robust support for uploading and displaying campaign banners and organization verification documents.
* **Fully Responsive UI:** Built completely with dynamic EJS templates for a smooth experience across both desktop and mobile layouts.

---

## 🛠️ Tech Stack

* **Frontend:** EJS (Embedded JavaScript), HTML5, CSS3, JavaScript (ES6+)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose for robust data modeling)
* **File Handling:** Multer (for managing secure multi-format image uploads)

---

## 📁 Repository Structure

```text
├── middileware/          # Custom route guards, authentication, and validation logic
├── models/               # Mongoose Data Schemas (Campaign, Donation, User, Auth)
├── routes/               # Express Router split by feature (authRoutes, campaignRoutes)
├── views/                # Dynamic EJS Templates (dashboard, login, register, campaign details, etc.)
├── server.js             # Main application entry point and server configuration
├── upload.js             # Multer setup for handling image and asset uploads
├── testdb.js             # Utility script to verify database connectivity
├── package.json          # Project metadata, scripts, and production dependencies
└── package-lock.json     # Locked dependency tree for consistent builds
