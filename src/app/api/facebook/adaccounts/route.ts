// Documentação:
// API Route para buscar as Contas de Anúncio de um usuário no Facebook.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { headers } from "next/headers";
import admin from 'firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authorization = (await headers()).get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    // A chamada de API é para o endpoint 'me/adaccounts'
    const fields = "name,account_id,account_status,currency";
    const facebookApiUrl = `https://graph.facebook.com/v20.0/me/adaccounts?fields=${fields}&access_token=${accessToken}`;
    
    const apiResponse = await fetch(facebookApiUrl);
    const apiData = await apiResponse.json();

    if (apiData.error) {
      throw new Error(apiData.error.message);
    }

    return NextResponse.json(apiData.data);

  } catch (error: any) {
    console.error("Erro ao buscar contas de anúncio:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}