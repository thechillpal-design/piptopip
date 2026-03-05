import { createClient } from '@supabase/supabase-js';

const PESAPAL_CONFIG = {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || "7uevkJ8S3QCGhwstxv0Gnj19kWaCi+4h",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "YzuyY88DZvgbx5MM1PuHks9VDwc=",
    baseUrl: process.env.PESAPAL_BASE_URL || "https://pay.pesapal.com/v3",
};

// Requires a Service Role Key to bypass RLS during webhook handling
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function getPesapalToken() {
    const res = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            consumer_key: PESAPAL_CONFIG.consumerKey,
            consumer_secret: PESAPAL_CONFIG.consumerSecret,
        }),
    });
    const data = await res.json();
    return data.token;
}

export const handler = async (event) => {
    try {
        // Can receive data via GET or POST depending on how it's sent
        const orderTrackingId = event.queryStringParameters?.OrderTrackingId || JSON.parse(event.body || "{}")?.OrderTrackingId;
        const orderNotificationType = event.queryStringParameters?.OrderNotificationType || JSON.parse(event.body || "{}")?.OrderNotificationType;
        const orderMerchantReference = event.queryStringParameters?.OrderMerchantReference || JSON.parse(event.body || "{}")?.OrderMerchantReference;

        if (!orderTrackingId || !orderNotificationType) {
            return { statusCode: 400, body: "Missing order metadata in IPN" };
        }

        // 1. Authenticate with PesaPal to check transaction status
        const authToken = await getPesapalToken();

        const statusRes = await fetch(
            `${PESAPAL_CONFIG.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                }
            }
        );
        const txData = await statusRes.json();

        // 2. Validate Payment
        if (txData.payment_status_description?.toUpperCase() === 'COMPLETED') {

            // Extract the metadata we sent using the merchant reference pattern:
            // "PIPTOPIP-{TYPE}-{userId}-{timestamp}"
            // e.g., PIPTOPIP-COPYTRADING-d3b...
            if (orderMerchantReference && orderMerchantReference.startsWith("PIPTOPIP-")) {
                const parts = orderMerchantReference.split('-');
                const type = parts[1]; // COPYTRADING, COURSE, ALGORITHM
                const userId = parts[2]; // UUID segment
                // If it's a huge UUID, the split might break if uuid itself has hyphens. We should stitch them back.
                const actualUserId = parts.slice(2, parts.length - 1).join('-');

                /* 
                 * 3. Handle Recurring specifically
                 * As per instructions: Detect when OrderNotificationType === "RECURRING"
                 */
                if (orderNotificationType === "RECURRING" || txData.subscription_transaction_info) {

                    // Here you would extend the specific subscription using subscription_transaction_info
                    await supabase.from('user_purchases').insert({
                        user_id: actualUserId,
                        product_name: "Recurring Copytrading Plan Validation",
                        product_type: "Copytrading",
                        download_url: null
                    });

                } else {
                    // Standard one-time insertions mapping
                    const typeFormatted = type === 'COPYTRADING' ? 'Copytrading' : type === 'COURSE' ? 'Course' : 'Algorithm';
                    await supabase.from('user_purchases').insert({
                        user_id: actualUserId,
                        product_name: txData.description || "Digital Delivery",
                        product_type: typeFormatted,
                        download_url: typeFormatted !== 'Copytrading' ? "https://example.com/secure-download" : null
                    });
                }
            }
        }

        // 4. Respond back to Pesapal to confirm receipt
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderNotificationType: orderNotificationType,
                orderTrackingId: orderTrackingId,
                orderMerchantReference: orderMerchantReference,
                status: 200
            })
        };

    } catch (err) {
        console.error("IPN Parse Error:", err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderNotificationType: "RECURRING",
                orderTrackingId: "",
                orderMerchantReference: "",
                status: 500
            }) // Return 500 per instructions if there was an issue extending
        };
    }
};
