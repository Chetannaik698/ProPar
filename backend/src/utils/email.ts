/**
 * Email Utility
 *
 * Send transactional emails (magic-link login, etc.).
 * Falls back to console logging in development when SMTP is not configured.
 *
 * @module utils/email
 */

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Create a nodemailer transporter.
 * In development mode without SMTP config, logs emails to the console.
 */
const createTransporter = () => {
  if (env.SMTP_HOST && env.SMTP_USER) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // In dev, return null — we'll log to console
  return null;
};

const transporter = createTransporter();

/**
 * Check if SMTP transporter is configured and active.
 * Used by controllers to provide helpful feedback to clients in dev mode.
 */
export const isSmtpConfigured = (): boolean => {
  return transporter !== null;
};

/**
 * Send a magic-link email
 *
 * @param to    - Recipient email
 * @param token - Magic-link token
 */
export const sendMagicLinkEmail = async (to: string, token: string): Promise<void> => {
  const magicLink = `${env.FRONTEND_URL}/auth/callback?token=${token}&type=email`;

  const subject = 'Sign in to ProPar';
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #0B0D12; border-radius: 6px;">
            <span style="display: block; width: 10px; height: 10px; background: #2F5DE0; border-radius: 50%;"></span>
          </span>
          <span style="font-size: 18px; font-weight: 600; color: #0B0D12; letter-spacing: -0.01em;">ProPar</span>
        </div>
      </div>

      <h1 style="font-size: 24px; font-weight: 500; color: #0B0D12; margin: 0 0 12px; text-align: center;">
        Sign in to ProPar
      </h1>
      <p style="font-size: 15px; color: #3B3F46; line-height: 1.6; text-align: center; margin: 0 0 28px;">
        Click the button below to securely sign in. This link will expire in 15 minutes.
      </p>

      <div style="text-align: center; margin: 0 0 28px;">
        <a href="${magicLink}"
           style="display: inline-block; background: #0B0D12; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; padding: 14px 32px; border-radius: 999px;">
          Sign in to ProPar
        </a>
      </div>

      <p style="font-size: 13px; color: #8A8F98; text-align: center; line-height: 1.6;">
        If you didn't request this email, you can safely ignore it.
      </p>

      <hr style="border: none; border-top: 1px solid #E7E9EC; margin: 32px 0;" />
      <p style="font-size: 12px; color: #8A8F98; text-align: center;">
        © ${new Date().getFullYear()} ProPar. Think before you send.
      </p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: `"ProPar" <${env.SMTP_FROM || (env.SMTP_USER?.includes('@') ? env.SMTP_USER : 'onboarding@resend.dev')}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Magic link email sent to ${to}`);
  } else {
    // Dev fallback: log the magic link to the console
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('📧 MAGIC LINK EMAIL (dev mode — no SMTP configured)');
    console.log(`   To: ${to}`);
    console.log(`   Link: ${magicLink}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  }
};

/**
 * Send a verification email
 *
 * @param to    - Recipient email
 * @param token - Verification token
 */
export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
  const verifyLink = `${env.FRONTEND_URL}/auth/callback?token=${token}&type=verify`;

  const subject = 'Verify your email for ProPar';
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #0B0D12; border-radius: 6px;">
            <span style="display: block; width: 10px; height: 10px; background: #2F5DE0; border-radius: 50%;"></span>
          </span>
          <span style="font-size: 18px; font-weight: 600; color: #0B0D12; letter-spacing: -0.01em;">ProPar</span>
        </div>
      </div>

      <h1 style="font-size: 24px; font-weight: 500; color: #0B0D12; margin: 0 0 12px; text-align: center;">
        Verify your email
      </h1>
      <p style="font-size: 15px; color: #3B3F46; line-height: 1.6; text-align: center; margin: 0 0 28px;">
        Click the button below to verify your email address and activate your ProPar account. This link will expire in 24 hours.
      </p>

      <div style="text-align: center; margin: 0 0 28px;">
        <a href="${verifyLink}"
           style="display: inline-block; background: #0B0D12; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; padding: 14px 32px; border-radius: 999px;">
          Verify Email Address
        </a>
      </div>

      <p style="font-size: 13px; color: #8A8F98; text-align: center; line-height: 1.6;">
        If you didn't create an account, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #E7E9EC; margin: 32px 0;" />
      <p style="font-size: 12px; color: #8A8F98; text-align: center;">
        © ${new Date().getFullYear()} ProPar. Think before you send.
      </p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: `"ProPar" <${env.SMTP_FROM || (env.SMTP_USER?.includes('@') ? env.SMTP_USER : 'onboarding@resend.dev')}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Verification email sent to ${to}`);
  } else {
    // Dev fallback: log to console
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('📧 VERIFICATION EMAIL (dev mode — no SMTP configured)');
    console.log(`   To: ${to}`);
    console.log(`   Link: ${verifyLink}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  }
};

/**
 * Send a password reset email
 *
 * @param to    - Recipient email
 * @param token - Password reset token
 */
export const sendPasswordResetEmail = async (to: string, token: string): Promise<void> => {
  const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  const subject = 'Reset your password for ProPar';
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #0B0D12; border-radius: 6px;">
            <span style="display: block; width: 10px; height: 10px; background: #2F5DE0; border-radius: 50%;"></span>
          </span>
          <span style="font-size: 18px; font-weight: 600; color: #0B0D12; letter-spacing: -0.01em;">ProPar</span>
        </div>
      </div>

      <h1 style="font-size: 24px; font-weight: 500; color: #0B0D12; margin: 0 0 12px; text-align: center;">
        Reset your password
      </h1>
      <p style="font-size: 15px; color: #3B3F46; line-height: 1.6; text-align: center; margin: 0 0 28px;">
        We received a request to reset your password. Click the button below to choose a new password. This link is valid for 1 hour.
      </p>

      <div style="text-align: center; margin: 0 0 28px;">
        <a href="${resetLink}"
           style="display: inline-block; background: #0B0D12; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; padding: 14px 32px; border-radius: 999px;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 13px; color: #8A8F98; text-align: center; line-height: 1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <hr style="border: none; border-top: 1px solid #E7E9EC; margin: 32px 0;" />
      <p style="font-size: 12px; color: #8A8F98; text-align: center;">
        © ${new Date().getFullYear()} ProPar. Think before you send.
      </p>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: `"ProPar" <${env.SMTP_FROM || (env.SMTP_USER?.includes('@') ? env.SMTP_USER : 'onboarding@resend.dev')}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Password reset email sent to ${to}`);
  } else {
    // Dev fallback: log to console
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('📧 PASSWORD RESET EMAIL (dev mode — no SMTP configured)');
    console.log(`   To: ${to}`);
    console.log(`   Link: ${resetLink}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
  }
};
