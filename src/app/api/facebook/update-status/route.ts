// Documentação:
// API Route para ATUALIZAR o status de um objeto de marketing (campanha, adset ou ad).

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Validar o usuário
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Pegar os dados do corpo da requisição
    const body = await request.json();
    const { objectId, newStatus } = body;

    if (!objectId || !newStatus) {
      return NextResponse.json({ error: "ID do objeto e novo status são obrigatórios." }, { status: 400 });
    }
    if (newStatus !== 'ACTIVE' && newStatus !== 'PAUSED') {
        return NextResponse.json({ error: "Status inválido. Apenas ACTIVE ou PAUSED são permitidos." }, { status: 400 });
    }

    // 3. Buscar o Access Token do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    // 4. Montar e fazer a chamada POST para a API Graph do Facebook
    // A API da Meta usa o mesmo endpoint do objeto para atualizá-lo.
    const facebookApiUrl = `https://graph.facebook.com/v20.0/${objectId}`;
    
    const updateData = {
      status: newStatus,
      access_token: accessToken,
    };

    const apiResponse = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    const responseData = await apiResponse.json();

    if (responseData.error) {
      throw new Error(`(${responseData.error.code}) ${responseData.error.message}`);
    }

    // 5. Retornar sucesso
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro ao atualizar status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}