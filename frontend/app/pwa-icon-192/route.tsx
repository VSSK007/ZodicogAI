import { renderPwaIcon } from "@/lib/pwaIcon";

export async function GET() {
  return renderPwaIcon(192);
}
