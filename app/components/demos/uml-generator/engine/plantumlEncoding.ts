import pako from "pako";

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const PLANTUML_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function base64ToPlantUml(base64Str: string): string {
  let result = "";
  for (const ch of base64Str) {
    if (ch === "=") continue;
    const idx = BASE64_ALPHABET.indexOf(ch);
    result += idx >= 0 ? PLANTUML_ALPHABET[idx] : ch;
  }
  return result;
}

function plantUmlToBase64(plantUmlStr: string): string {
  let result = "";
  for (const ch of plantUmlStr) {
    const idx = PLANTUML_ALPHABET.indexOf(ch);
    result += idx >= 0 ? BASE64_ALPHABET[idx] : ch;
  }
  while (result.length % 4 !== 0) result += "=";
  return result;
}

export function plantumlEncode(plantumlText: string): string {
  const utf8Bytes = new TextEncoder().encode(plantumlText);
  const deflated = pako.deflateRaw(utf8Bytes);

  let binary = "";
  for (const byte of deflated) {
    binary += String.fromCharCode(byte);
  }

  return base64ToPlantUml(btoa(binary));
}

export function plantumlDecode(encoded: string): string {
  const base64Str = plantUmlToBase64(encoded);
  const binary = atob(base64Str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const inflated = pako.inflateRaw(bytes);
  return new TextDecoder().decode(inflated);
}

export function plantumlSvgUrl(encoded: string): string {
  return `https://www.plantuml.com/plantuml/svg/${encoded}`;
}

export function plantumlPngUrl(encoded: string): string {
  return `https://www.plantuml.com/plantuml/png/${encoded}`;
}
