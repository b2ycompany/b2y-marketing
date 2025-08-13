import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Validar o usuário
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    const accessToken = userData?.connections?.facebook?.accessToken;
    const userIdOnFacebook = userData?.connections?.facebook?.userId;

    // 2. Revogar as permissões na Meta (o jeito certo de desconectar)
    if (accessToken && userIdOnFacebook) {
      const url = `https://graph.facebook.com/v20.0/${userIdOnFacebook}/permissions?access_token=${accessToken}`;
      await axios.delete(url);
    }

    // 3. Remover os dados de conexão do Firestore
    // Usamos FieldValue.delete() para apagar completamente o campo 'facebook'
    await userDocRef.update({
      'connections.facebook': admin.firestore.FieldValue.delete()
    });

    return NextResponse.json({ success: true, message: "Conta do Facebook desconectada com sucesso." });

  } catch (error: any) {
    console.error("Erro ao desconectar conta:", error.response?.data || error.message);
    return NextResponse.json({ error: "Falha ao desconectar a conta." }, { status: 500 });
  }
}