const PESAPAL_CONFIG = {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || "7uevkJ8S3QCGhwstxv0Gnj19kWaCi+4h",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "YzuyY88DZvgbx5MM1PuHks9VDwc=",
    baseUrl: process.env.PESAPAL_BASE_URL || "https://pay.pesapal.com/v3",
};

async function getPesapalToken() {
    const res = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            consumer_key: PESAPAL_CONFIG.consumerKey,
            consumer_secret: PESAPAL_CONFIG.consumerSecret,
        }),
    });
    if (!res.ok) throw new Error("Failed to authenticate with PesaPal");
    const data = await res.json();
    return data.token;
}

async function registerIpn(authToken, originUrl) {
    const res = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/URLSetup/RegisterIPN`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            url: `${originUrl}/.netlify/functions/pesapal-ipn`,
            ipn_notification_type: "GET" // Pesapal mostly uses GET for callbacks or POST
        }),
    });
    const data = await res.json();
    return data.ipn_id;
}

export const handler = async (event) => {
    // CORS Handling
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    try {
        const { plan, price, type, email, userId, origin } = JSON.parse(event.body);

        if (!plan || !price || !type || !email || !userId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        const authToken = await getPesapalToken();
        const ipnId = await registerIpn(authToken, origin);

        // PiptoPip specific format reference: type_userId_timestamp
        const reference = `PIPTOPIP-${type.toUpperCase()}-${userId}-${Date.now()}`;

        // Dynamic callback based on product type
        const callbackUrl = `${origin}/dashboard?tab=${type === 'Copytrading' ? 'overview&action=connect' : 'downloads'}&status=success&ref=${reference}`;

        let requestBody = {
            id: reference,
            currency: "USD",
            amount: numericPrice,
            description: `${plan} - ${type}`,
            callback_url: callbackUrl,
            notification_id: ipnId,
            billing_address: {
                email_address: email,
                first_name: "User",
                last_name: userId.substring(0, 5), // Provide partial hash if unknown
                country_code: "US"
            },
        };

        // Inject RECURRING logic for Copytrading explicitly
        if (type === 'Copytrading') {
            const today = new Date();
            const formatPesapalDate = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

            const startStr = formatPesapalDate(today);
            const endDate = new Date(today);
            endDate.setFullYear(today.getFullYear() + 5); // Default 5 year span
            const endStr = formatPesapalDate(endDate);

            requestBody.account_number = userId; // Critical mapping point
            requestBody.subscription_details = {
                start_date: startStr,
                end_date: endStr,
                frequency: "MONTHLY"
            };
        }

        const orderResponse = await fetch(
            `${PESAPAL_CONFIG.baseUrl}/api/Transactions/SubmitOrderRequest`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify(requestBody),
            }
        );

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: orderData.error?.message || "Failed to create payment link" }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                redirect_url: orderData.redirect_url,
                order_reference: reference
            })
        };

    } catch (error) {
        console.error("PesaPal setup error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || "Internal Server Error" })
        };
    }
};
