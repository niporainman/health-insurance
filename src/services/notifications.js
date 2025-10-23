import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function createNotification({ userId, title, message, type = "info", link = null }) {
  if (!userId || !title || !message) {
    throw new Error("Missing required fields: userId, title, or message.");
  }

  try {
    return await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type,// info | success | warning | error
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err;
  }
}

// Send Email
export async function sendEmail(email, name, subject, body) {
  try {
    const res = await fetch(import.meta.env.VITE_SEND_EMAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, subject, body }),
    });

    if (!res.ok) {
      const text = await res.text(); // fallback in case response isn’t JSON
      throw new Error(`Email API error: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

