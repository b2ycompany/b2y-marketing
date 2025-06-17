import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Nosso UID de usuário
  
  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?error=Google-Auth-Failed', request.url));
  }
  
  try {
    // Troca o código de autorização por tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    // Salva os tokens no documento do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(state);
    await userDocRef.update({
      'connections.google.accessToken': access_token,
      'connections.google.refreshToken': refresh_token,
      'connections.google.expiryDate': expiry_date,
      'connections.google.connectedAt': new Date(),
    });

    console.log("Tokens do Google salvos com sucesso para o usuário:", state);

    // Redireciona de volta para a página de configurações com sucesso
    return NextResponse.redirect(new URL('/settings?success=google-connected', request.url));

  } catch (error: any) {
    console.error("Erro no callback do Google:", error.message);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, request.url));
  }
}