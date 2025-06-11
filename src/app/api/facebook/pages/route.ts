// Documentação:
// API Route para buscar as páginas de um usuário no Facebook.
// Ela atua como um proxy seguro, usando o token salvo no Firestore.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { headers } from "next/headers";
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Validar o usuário através do Token de ID do Firebase
    const authorization = (await headers()).get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente ou mal formatado." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Buscar o Access Token do Facebook do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Usuário não conectou a conta do Facebook." }, { status: 400 });
    }

    // 3. Chamar a API Graph do Facebook para obter as páginas
    // O campo 'accounts' nos dá as páginas e contas de Instagram conectadas.
    // Pedimos vários campos úteis como nome, foto, categoria e o token de acesso da PRÓPRIA PÁGINA.
    const fields = "name,category,picture{url},access_token";
    const facebookApiUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=${fields}&access_token=${accessToken}`;
    
    const apiResponse = await fetch(facebookApiUrl);
    const apiData = await apiResponse.json();

    if (apiData.error) {
      throw new Error(apiData.error.message);
    }

    // 4. Retornar os dados para o cliente
    return NextResponse.json(apiData.data);

  } catch (error: any) {
    // Tratamento de erros, incluindo tokens de ID expirados
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Token de autenticação expirado. Por favor, faça login novamente.' }, { status: 401 });
    }
    console.error("Erro ao buscar páginas do Facebook:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}