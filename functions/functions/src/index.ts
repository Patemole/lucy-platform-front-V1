/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//import {onRequest} from "firebase-functions/v2/https";
//import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });



import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// 🔥 Initialisation Firebase Admin avec Firestore en us-east4
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "lucy-prod-a120d",
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // 🔧 Permet d'éviter des erreurs avec les valeurs undefined

console.log("🔥 Projet Firebase utilisé :", admin.app().options.projectId);
console.log("✅ Firebase Admin Initialized (Firestore en us-east4)");

export const updateOnlineUsers = onSchedule("every 1 minutes", async () => {
  console.log("🔄 Début de la mise à jour de onlineUsers...");

  const docRef = db.collection("stats").doc("onlineUsers");

  try {
    console.log("📡 Tentative d'accès au document Firestore...");

    const doc = await docRef.get();
    console.log("📄 Document Firestore récupéré :", doc.exists ? "✅ Existant" : "❌ Non trouvé");

    const data = doc.data();
    console.log("📜 Données actuelles :", data);

    let currentCount = doc.exists && data && typeof data.count === "number" ? data.count : 20;
    console.log(`🔢 Valeur actuelle du compteur: ${currentCount}`);

    // Générer une variation aléatoire entre -3 et +3
    let variation = Math.floor(Math.random() * 7) - 3;
    let newCount = Math.max(10, Math.min(50, currentCount + variation));
    console.log(`🎲 Variation: ${variation}, Nouvelle valeur: ${newCount}`);

    console.log("📝 Tentative de mise à jour du document Firestore...");
    await docRef.set(
      {
        count: newCount,
        updatedAt: admin.firestore.Timestamp.now(), // 🔧 Utilisation alternative si serverTimestamp() pose problème
      },
      { merge: true }
    );

    console.log("✅ Mise à jour réussie !");
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la mise à jour :", error);

    // 🔄 Ajout d'un log d'erreur détaillé
    if (typeof error === 'object' && error && 'code' in error) {
      if (error.code === 7) {
        console.error("🚨 ERREUR PERMISSION_DENIED : Vérifie les permissions IAM et Firestore Rules.");
      }
    }
  }
});