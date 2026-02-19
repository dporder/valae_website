const ATTIO_API_KEY = process.env.ATTIO_API_KEY;
const ATTIO_BASE = "https://api.attio.com/v2";
const ATTIO_LIST_ID = "2207449d-8c89-4f72-8ebb-ed61be1c50a0";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fullName, company, email, painPoint } = req.body;

    if (!fullName || !company || !email) {
      return res.status(400).json({ error: "fullName, company, and email are required" });
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

    try {
      await attio("/objects/companies/records?matching_attribute=domains", "PUT", {
        data: {
          values: {
            name: [{ value: company }],
            domains: [email.split("@")[1]],
          },
        },
      });
    } catch (companyErr) {
      console.warn("Company assert failed (non-fatal):", companyErr.message);
    }

    const recordId = person.data.id.record_id;

    await attio(`/lists/${ATTIO_LIST_ID}/entries`, "PUT", {
      data: {
        parent_record_id: recordId,
        parent_object: "people",
        entry_values: {},
      },
    });

    return res.status(200).json({ success: true, recordId });
  } catch (err) {
    console.error("Attio error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
