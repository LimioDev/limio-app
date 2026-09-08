import { TextDecoder, TextEncoder } from "text-encoding";

import "../global.css";

import { Stack } from "expo-router";

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

export default function RootLayout() {
  return <Stack />;
}
