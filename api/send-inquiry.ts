/**
 * PharmaSearch B2B Lead Capture & Email Dispatcher
 * Serverless handler compatible with Vercel and local environments.
 * Uses Resend REST API (https://api.resend.com/emails) via native fetch.
 */

export interface InquiryRequestBody {
  name: string;
  company: string;
  email: string;
  phone: string;
  interests: string[];
  questions?: string;
  language?: 'fr' | 'ar';
}

export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (data: unknown) => void;
    end: () => void;
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: InquiryRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, company, email, phone, interests = [], questions = '', language = 'fr' } = body || {};

    if (!name || !email || !phone || !company) {
      return res.status(400).json({
        error: 'Missing required fields: name, company, email, and phone are required.',
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.NOTIFICATION_EMAIL || 'contact@techwise-dz.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PharmaSearch B2B <onboarding@resend.dev>';

    // If Resend API Key is configured in environment, dispatch actual emails
    if (resendApiKey) {
      const interestsFormatted = interests.length > 0 ? interests.join(', ') : 'Étude générale du marché';
      const isAr = language === 'ar';

      // 1. Email to TechWise Advisors Admin
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <h2 style="color: #0d9488; margin-top: 0;">🚀 Nouvelle Demande d'Étude B2B PharmaSearch</h2>
          <p>Un professionnel de la santé / entreprise a soumis une demande d'accès aux données :</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Nom & Prénom:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Entreprise / Labo:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${company}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Téléphone:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Centres d'intérêt:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${interestsFormatted}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Questions / Besoins:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${questions || 'Aucune question spécifique renseignée.'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Langue du visiteur:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${language.toUpperCase()}</td></tr>
          </table>
          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Message généré automatiquement depuis la plateforme PharmaSearch DZ.</p>
        </div>
      `;

      // 2. Confirmation Email to the Visitor
      const confirmationHtml = isAr
        ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; direction: rtl; text-align: right;">
          <h2 style="color: #0d9488; margin-top: 0;">تأكيد استلام طلبكم — PharmaSearch DZ</h2>
          <p>مرحباً <strong>${name}</strong>،</p>
          <p>نشكركم على اهتمامكم ببيانات ودراسات السوق الصيدلاني لمنصة <strong>PharmaSearch DZ</strong>.</p>
          <p>لقد تم استلام طلبكم بنجاح المتعلق بـ <strong>${company}</strong>. سيتواصل معكم أحد مستشاري <strong>TechWise Advisors</strong> هاتفياً على الرقم (<strong>${phone}</strong>) أو عبر البريد الإلكتروني في غضون 24 ساعة عمل لتزويدكم بالتفاصيل أو ملف البيانات المطلوب.</p>
          <div style="background-color: #f8fafc; border-radius: 6px; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 13px;">البيانات المطلوبة :</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">${interestsFormatted}</p>
          </div>
          <p>في هذه الأثناء، ندعوكم لمتابعة أخبارنا على صفحتنا الرسمية على لينكد إن :</p>
          <p><a href="https://www.linkedin.com/company/techwiseadvisors" style="display: inline-block; background-color: #0a66c2; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">صفحة TechWise Advisors على LinkedIn</a></p>
          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">مع تحيات فريق TechWise Advisors & PharmaSearch DZ</p>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <h2 style="color: #0d9488; margin-top: 0;">Confirmation de réception de votre demande — PharmaSearch DZ</h2>
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Nous vous remercions pour votre intérêt envers les données de marché et études réglementaires de <strong>PharmaSearch DZ</strong>.</p>
          <p>Nous avons bien enregistré votre demande pour le compte de <strong>${company}</strong>. Un conseiller de <strong>TechWise Advisors</strong> prendra contact avec vous par téléphone au <strong>${phone}</strong> ou par retour d'email dans un délai de 24h ouvrées pour vous transmettre les éléments demandés.</p>
          <div style="background-color: #f8fafc; border-radius: 6px; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 13px;">Données & périmètres sélectionnés :</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">${interestsFormatted}</p>
          </div>
          <p>En attendant notre échange, vous pouvez découvrir nos publications et actualités d'entreprise sur notre page LinkedIn :</p>
          <p><a href="https://www.linkedin.com/company/techwiseadvisors" style="display: inline-block; background-color: #0a66c2; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">Visiter TechWise Advisors sur LinkedIn</a></p>
          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Bien cordialement,<br/><strong>L'équipe TechWise Advisors & PharmaSearch DZ</strong></p>
        </div>
      `;

      // Dispatch both emails in parallel using Resend API
      const [adminRes, visitorRes] = await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            subject: `[Lead B2B PharmaSearch] ${company} - ${name}`,
            html: adminHtml,
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: isAr
              ? 'تأكيد استلام طلبكم — دراسة السوق PharmaSearch DZ'
              : 'Confirmation de réception de votre demande — PharmaSearch DZ',
            html: confirmationHtml,
          }),
        }),
      ]);

      if (!adminRes.ok || !visitorRes.ok) {
        const errText = await adminRes.text();
        console.error('[Resend Error]', errText);
        // Fall back gracefully
        return res.status(200).json({
          success: true,
          method: 'partial',
          message: 'Request logged, confirmation pending delivery.',
        });
      }

      return res.status(200).json({
        success: true,
        method: 'resend',
        message: 'Emails sent successfully to both admin and visitor.',
      });
    }

    // Offline / Local development fallback when RESEND_API_KEY is not configured
    console.log('[Inquiry Received - Local Mode]:', { name, company, email, phone, interests, questions });
    return res.status(200).json({
      success: true,
      method: 'local_fallback',
      message: 'Inquiry received in local development mode.',
    });
  } catch (error) {
    console.error('Error handling inquiry submission:', error);
    return res.status(500).json({ error: 'Internal server error while processing inquiry.' });
  }
}
