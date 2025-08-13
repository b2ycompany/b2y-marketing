import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validar o usuário a partir do token de autorização
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Buscar o documento do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Se o documento não existe, retorna um objeto de conexões vazio
      return NextResponse.json({ connections: {} });
    }

    // Retorna apenas o objeto 'connections' que contém as chaves 'facebook', 'google', etc.
    const connections = userDoc.data()?.connections || {};
    return NextResponse.json({ connections });

  } catch (error: any) {
    console.error("Erro ao buscar conexões do usuário:", error.message);
    return NextResponse.json({ error: "Falha ao buscar dados do usuário." }, { status: 500 });
  }
}