// Documentação:
// API Route para LISTAR as campanhas de uma conta de anúncios específica.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // 1. Validar o usuário
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Pegar o adAccountId dos parâmetros da URL
    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');

    if (!adAccountId) {
      return NextResponse.json({ error: "ID da Conta de Anúncios é obrigatório." }, { status: 400 });
    }

    // 3. Buscar o Access Token do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    // 4. Montar e fazer a chamada GET para a API Graph do Facebook
    // Pedimos campos úteis como nome, status, objetivo e o status efetivo.
    const fields = "name,status,objective,effective_status,created_time";
    const facebookApiUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns?fields=${fields}&access_token=${accessToken}`;

    const apiResponse = await fetch(facebookApiUrl);
    const responseData = await apiResponse.json();

    if (responseData.error) {
      throw new Error(`(${responseData.error.code}) ${responseData.error.message}`);
    }

    // 5. Retornar a lista de campanhas
    return NextResponse.json(responseData.data);

  } catch (error: any) {
    console.error("Erro ao listar campanhas:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}