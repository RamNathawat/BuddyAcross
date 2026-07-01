import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_SENDER = process.env.EMAIL_FROM || 'BuddyAcross <noreply@mail.buddyacross.com>';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class EmailService {
  /**
   * Send a transactional email using Resend with rate-limit and error handling
   */
  static async sendEmail(options: SendEmailOptions) {
    if (!resend) {
      console.warn('⚠️ [EmailService] RESEND_API_KEY not configured. Skipping email send:', options.subject);
      return { success: false, error: 'RESEND_API_KEY not set' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_SENDER,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        console.error('❌ [EmailService] Resend API Error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log(`✉️ [EmailService] Email sent successfully! ID: ${data?.id} | Subject: "${options.subject}"`);
      return { success: true, data };
    } catch (err: any) {
      console.error('❌ [EmailService] Exception:', err.message || err);
      throw err;
    }
  }

  /**
   * Helper: Send a test email to verify DNS and API Key configuration
   */
  static async sendTestEmail(recipientEmail: string) {
    return this.sendEmail({
      to: recipientEmail,
      subject: '🎉 BuddyAcross Email Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5;">Email System Verified! 🚀</h2>
          <p>Hi there,</p>
          <p>Your GoDaddy domain <strong>mail.buddyacross.com</strong> has been successfully connected to Resend with full DKIM, SPF, and DMARC authentication.</p>
          <p>You can now send automated notifications without any email rate limits!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Sent from BuddyAcross API</p>
        </div>
      `,
    });
  }
}
