import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const leftSensor = parseFloat(url.searchParams.get("leftSensor") || "0");
  const rightSensor = parseFloat(url.searchParams.get("rightSensor") || "0");
  const x = parseFloat(url.searchParams.get("x") || "0");
  const y = parseFloat(url.searchParams.get("y") || "0");

  const mistakes: string[] = [];
  if (leftSensor === rightSensor) mistakes.push("Both sensors agree; adjust motors gently.");
  if (leftSensor > rightSensor) mistakes.push("Robot may be drifting left; slow the left motor.");
  if (rightSensor > leftSensor) mistakes.push("Robot may be drifting right; slow the right motor.");

  return NextResponse.json({ leftSensor, rightSensor, position: { x, y }, mistakes });
}
