/**
 * Minimal type declarations for nodemailer
 * Used by the SMTP relay plugin
 */
declare module 'nodemailer' {
  namespace nodemailer {
    interface TransportOptions {
      host?: string;
      port?: number;
      secure?: boolean;
      tls?: {
        rejectUnauthorized?: boolean;
      };
      connectionTimeout?: number;
      socketTimeout?: number;
      logger?: boolean;
      debug?: boolean;
      auth?: {
        user?: string;
        pass?: string;
      };
    }

    interface SendMailOptions {
      from?: string;
      to?: string;
      cc?: string;
      bcc?: string;
      subject?: string;
      text?: string;
      html?: string;
      attachments?: any[];
    }

    interface SentMessageInfo {
      messageId?: string;
      envelope?: any;
      accepted?: string[];
      rejected?: string[];
      response?: string;
    }

    interface Transporter {
      sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
      verify(): Promise<boolean>;
      close(): void;
    }

    function createTransport(options: TransportOptions): Transporter;
  }

  export = nodemailer;
}
