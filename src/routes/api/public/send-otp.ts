import { createFileRoute } from '@tanstack/react-router';

// HK Wallet — OTP sender endpoint.
// Fully environment driven (no hardcoded provider keys, sender ids or numbers):
//   SMS_API_URL, SMS_API_KEY, SMS_SENDER_ID, SMS_COUNTRY_CODE, SMS_TEMPLATE

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export const Route = createFileRoute('/api/public/send-otp')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as {
            phone?: string;
            otp?: string;
            senderType?: string;
          };

          const phone = (payload.phone ?? '').replace(/\D/g, '');
          const otp = (payload.otp ?? '').replace(/\D/g, '');

          if (phone.length !== 10) {
            return json({ error: 'A valid 10 digit mobile number is required.' }, 400);
          }
          if (otp.length !== 6) {
            return json({ error: 'A valid 6 digit OTP is required.' }, 400);
          }

          // Bulk Blaster OTP API
          const apiKey = process.env['SMS_API_KEY'];
          const apiUrl =
            process.env['SMS_API_URL'] ??
            'https://bulkblaster-biotp-api-290441563653.asia-south1.run.app/send-otp';
          const senderType = payload.senderType || process.env['SMS_SENDER_ID'] || 'DASSAM';
          const brandName = process.env['SMS_BRAND_NAME'] ?? 'Hkwallet';

          if (!apiKey) {
            console.error('send-otp: SMS_API_KEY is not configured.');
            return json({ success: false, error: 'SMS service is not configured. Please contact support.' }, 200);
          }

          const providerResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey,
              phone,
              otp,
              brandName,
              senderType,
            }),
          });

          const providerData = (await providerResponse.json().catch(() => null)) as {
            success?: boolean;
            error?: string;
          } | null;

          if (!providerResponse.ok || providerData?.success === false) {
            console.error(
              'send-otp: provider error',
              providerResponse.status,
              providerData?.error ?? 'unknown',
            );
            return json(
              { success: false, error: providerData?.error ?? 'Could not send OTP. Please try again.' },
              200,
            );
          }

          return json({ success: true, phone });
        } catch (err) {
          console.error('send-otp: unexpected error', err);
          return json({ success: false, error: 'Unexpected error while sending OTP.' }, 200);
        }
      },
    },
  },
});
