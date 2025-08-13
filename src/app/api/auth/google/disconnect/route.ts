import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

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
    
    // 2. Remover os dados de conexão do Google do Firestore
    // Usamos FieldValue.delete() para apagar completamente o campo 'google'
    await userDocRef.update({
      'connections.google': admin.firestore.FieldValue.delete()
    });

    // Nota: A revogação do token do Google é mais complexa e pode ser adicionada no futuro se necessário.
    // Por agora, remover a conexão do nosso lado é suficiente para a funcionalidade da app.

    return NextResponse.json({ success: true, message: "Conta do Google desconectada com sucesso." });

  } catch (error: any) {
    console.error("Erro ao desconectar conta do Google:", error.message);
    return NextResponse.json({ error: "Falha ao desconectar a conta." }, { status: 500 });
  }
}