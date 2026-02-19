const ATTIO_API_KEY = process.env.ATTIO_API_KEY;
const ATTIO_BASE = "https://api.attio.com/v2";

async function attio(path, method, body) {
  const res = await fetch(`${ATTIO_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${ATTIO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Attio ${method} ${path} failed (${res.status}): ${err}`);
  }
  return res.json();
}

export async function POST(request) {
  try {
    const { fullName, company, email, painPoint } = await request.json();

    if (!fullName || !company || !email) {
      return new Response(
        JSON.stringify({ error: "fullName, company, and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    const person = await attio(
      "/objects/people/records?matching_attribute=email_addresses",
      "PUT",
      {
        data: {
          values: {
            email_addresses: [email],
            name: [{ first_name: firstName, last_name: lastName, full_name: fullName }],
            ...(painPoint && { description: painPoint }),
          },
        },
      }
    );

    await attio("/objects/companies/records?matching_attribute=name", "PUT", {
      data: {
        values: { name: [{ value: company }] },
      },
    });

    return new Response(
      JSON.stringify({ success: true, recordId: person.data.id.record_id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Attio error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
