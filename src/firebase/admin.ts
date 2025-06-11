// Documentação:
// Este arquivo inicializa o Firebase Admin SDK, que nos dá acesso
// privilegiado aos serviços do Firebase a partir do nosso backend (servidor).
// Ele ignora as Regras de Segurança, agindo como um administrador.

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Pega a chave da conta de serviço da variável de ambiente.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
}

// O Firebase Admin só pode ser inicializado uma vez.
// Verificamos se já existe uma instância para evitar erros.
if (!admin.apps.length) {
  admin.initializeApp({
    // O JSON.parse é necessário para converter a string da variável de ambiente
    // de volta para um objeto JSON que o SDK entende.
    credential: admin.credential.cert(JSON.parse(serviceAccountKey))
  });
}

// Exporta uma instância do Firestore com privilégios de administrador.
const adminDb = getFirestore();

export { adminDb };