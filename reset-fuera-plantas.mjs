// ============================================================
// RESET AUTOMÁTICO — "Fuera de Plantas"
// ------------------------------------------------------------
// Este script hace exactamente lo mismo que ejecutarReset()
// en tu app (index.html), pero corre en GitHub Actions,
// no en el navegador. Por eso funciona aunque nadie tenga
// la pestaña abierta.
//
// NO modifica tu app actual. Es un proceso completamente
// separado que solo escribe en la misma colección de Firestore.
// ============================================================

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// La credencial se lee desde una variable de entorno (GitHub Secret),
// nunca queda escrita en el código ni en el repositorio.
const credencialJSON = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!credencialJSON) {
  console.error("Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT.");
  process.exit(1);
}

const credencial = JSON.parse(credencialJSON);

const app = initializeApp({
  credential: cert(credencial),
});

const db = getFirestore(app);
const colRef = db.collection("integrantes");

async function ejecutarReset() {
  const snapshot = await colRef.get();

  if (snapshot.empty) {
    console.log("No hay integrantes registrados. Nada que actualizar.");
    return;
  }

  const batch = db.batch();
  snapshot.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      estado: "Fuera de Plantas",
      actualizado: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Reset aplicado a ${snapshot.size} integrante(s) — ${new Date().toISOString()}`);
}

ejecutarReset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error en reset automático:", err);
    process.exit(1);
  });
