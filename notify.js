// api/notify.js — Vercel endpoint for FCM push from frontend
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { credential } = require("firebase-admin");

function getDB() {
  if (!getApps().length) {
    initializeApp({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

const LOGO = "https://res.cloudinary.com/diepkkeyu/image/upload/v1773517119/404042723_763352762472137_4889753537613967821_n_p3hhjh.jpg";

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://rebranding-gamma.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { title, body, accId } = req.body || {};
    if (!title) return res.status(400).json({ error: "title required" });

    const db = getDB();

    // 1. Write to Firestore notifications (for in-app listeners)
    const id = "notif_" + Date.now();
    await db.collection("notifications").doc(id).set({
      id, title, body: body || "",
      accId: accId || null,
      createdAt: new Date().toISOString(),
      read: false
    });

    // 2. Send FCM push to all tokens
    const snap = await db.collection("fcm_tokens").get();
    const tokens = [];
    snap.forEach(doc => {
      if (doc.data().token) tokens.push(doc.data().token);
    });

    if (tokens.length > 0) {
      const messaging = getMessaging();
      for (let i = 0; i < tokens.length; i += 500) {
        await messaging.sendEachForMulticast({
          tokens: tokens.slice(i, i + 500),
          notification: { title, body: body || "" },
          data: accId ? { accId } : {},
          android: { priority: "high" },
          apns: { payload: { aps: { sound: "default", badge: 1 } } },
          webpush: {
            headers: { Urgency: "high" },
            notification: { title, body: body || "", icon: LOGO }
          }
        });
      }
    }

    return res.status(200).json({ ok: true, tokens: tokens.length });
  } catch (e) {
    console.error("notify error:", e.message);
    return res.status(500).json({ error: e.message });
  }
};
