import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { mobileEnv } from "../../../env";

export const authClient = createAuthClient({
  baseURL: mobileEnv.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: "{{projectName}}",
      storagePrefix: "{{projectName}}",
      storage: SecureStore,
    }),
  ],
});
