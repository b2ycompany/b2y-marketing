import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

// A sua inicialização do cliente OAuth2 está perfeita.
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
    // A sua troca de código por tokens está perfeita.
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    // Salva os tokens no documento do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(state);

    // AQUI ESTÁ A CUSTOMIZAÇÃO: Usando .set() com { merge: true }
    // Isto garante que o código funcionará mesmo que o documento ou o campo 'connections' não existam.
    await userDocRef.set({
      connections: {
        google: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiryDate: expiry_date,
          connectedAt: new Date(),
        }
      }
    }, { merge: true });

    console.log("Tokens do Google salvos com sucesso para o usuário:", state);

    // O seu redirecionamento de sucesso está perfeito.
    return NextResponse.redirect(new URL('/settings?success=google-connected', request.url));

  } catch (error: any) {
    console.error("Erro no callback do Google:", error.message);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, request.url));
  }
}