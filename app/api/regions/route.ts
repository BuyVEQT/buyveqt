import { NextResponse } from "next/server";
import { buildRegionsPayload } from "@/lib/data/payloads";

export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await buildRegionsPayload());
}
