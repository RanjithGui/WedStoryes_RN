import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebaseconfig";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectUri = makeRedirectUri({
    preferLocalhost: false,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "93876598923-ndi6mvpbgrev22tdspenkhgf3v4dg6s2.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    const authenticate = async () => {
      if (response?.type !== "success") return;
      console.log(request?.redirectUri);
      try {
        setLoading(true);
        setError(null);

        const idToken = response.authentication?.idToken;
        if (!idToken) throw new Error("No ID token returned");

        const credential = GoogleAuthProvider.credential(idToken);

        await signInWithCredential(auth, credential);
      } catch (err: any) {
        setError(err.message ?? "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [response]);

  return {
    promptAsync,
    request,
    loading,
    error,
  };
};
