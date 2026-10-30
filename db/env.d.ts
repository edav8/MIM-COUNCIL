declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    OPENAI_API_KEY?: string;
    RESEND_API_KEY?: string;
    FEEDBACK_EMAIL_FROM?: string;
    FEEDBACK_EMAIL_TO?: string;
  }
}
