// Documentação do Código:
// Este arquivo inicializa e exporta os serviços do Firebase que usaremos na aplicação.
// Manter a configuração centralizada aqui facilita a manutenção.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase com as chaves diretamente no código, conforme solicitado.
const firebaseConfig = {
  apiKey: "AIzaSyAmu-oHY6DuaJA3mRPz_5KSdz4BBbUXv48",
  authDomain: "b2y-marketing.firebaseapp.com",
  projectId: "b2y-marketing",
  storageBucket: "b2y-marketing.appspot.com",
  messagingSenderId: "995918159529",
  appId: "1:995918159529:web:054ee30ad962fa48c5d3b8"
};

// Inicializa o Firebase de forma segura (impede reinicialização)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };