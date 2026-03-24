import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@") || email.length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      console.error("[Newsletter] BUTTONDOWN_API_KEY not configured");
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable" },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://api.buttondown.com/v1/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          email_address: email,
          type: "regular",
          tags: ["website"],
        }),
      }
    );

    if (response.status === 201) {
      return NextResponse.json({ success: true });
    }

    if (response.status === 409) {
      // Already subscribed — treat as success
      return NextResponse.json({ success: true });
    }

    const data = await response.json().catch(() => null);
    console.error("[Newsletter] Buttondown error:", response.status, data);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Newsletter] Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
