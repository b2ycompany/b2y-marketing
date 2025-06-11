// Documentação:
// Este arquivo conterá todas as funções para interagir com o Firestore.

import { doc, setDoc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./config";

/**
 * Cria ou atualiza o perfil de um usuário na coleção 'users' do Firestore.
 */
export async function createUserProfile(user: User) {
  const userDocRef = doc(db, "users", user.uid);

  try {
    await setDoc(userDocRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date(),
    }, { merge: true });

    console.log("Perfil do usuário salvo no Firestore com sucesso!");

  } catch (error) {
    console.error("Erro ao salvar perfil do usuário no Firestore:", error);
  }
}

/**
 * Salva o Access Token do Facebook para um usuário específico no Firestore.
 * @param {string} uid - O ID do usuário para quem o token pertence.
 * @param {string} token - O Access Token de longa duração do Facebook.
 */
export async function saveFacebookToken(uid: string, token: string) {
  // ATENÇÃO: Em um app de produção real, este token deve ser ENCRIPTADO
  // antes de ser salvo no banco de dados para uma camada extra de segurança.
  
  const userDocRef = doc(db, "users", uid);

  try {
    // Usa updateDoc para adicionar ou atualizar o campo do token no documento do usuário.
    await updateDoc(userDocRef, {
      'connections.facebook.accessToken': token,
      'connections.facebook.connectedAt': new Date(),
    });

    console.log("Token do Facebook salvo com sucesso para o usuário:", uid);
  
  } catch (error) {
    console.error("Erro ao salvar o token do Facebook:", error);
  }
}