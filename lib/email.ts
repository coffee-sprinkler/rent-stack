// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'RentStack <onboarding@resend.dev>';

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your RentStack account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Hi ${name}, welcome to RentStack!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Verify Email</a>
        <p style="color:#888;font-size:12px;margin-top:24px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendApplicationReceivedEmail(
  landlordEmail: string,
  tenantName: string,
  unitNumber: string,
  propertyName: string,
) {
  await resend.emails.send({
    from: FROM,
    to: landlordEmail,
    subject: `New lease application — Unit ${unitNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>New Application Received</h2>
        <p><strong>${tenantName}</strong> has applied for <strong>Unit ${unitNumber}</strong> at ${propertyName}.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Review Application</a>
      </div>
    `,
  });
}

export async function sendApplicationStatusEmail(
  tenantEmail: string,
  tenantName: string,
  status: 'approved' | 'rejected',
  unitNumber: string,
  propertyName: string,
) {
  const approved = status === 'approved';
  await resend.emails.send({
    from: FROM,
    to: tenantEmail,
    subject: `Your application has been ${status}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Application ${approved ? 'Approved 🎉' : 'Rejected'}</h2>
        <p>Hi ${tenantName},</p>
        <p>Your application for <strong>Unit ${unitNumber}</strong> at ${propertyName} has been <strong>${status}</strong>.</p>
        ${approved ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/lease" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Your Lease</a>` : '<p>You may browse other available units on RentStack.</p>'}
      </div>
    `,
  });
}

export async function sendRentDueEmail(
  tenantEmail: string,
  tenantName: string,
  amount: number,
  dueDate: Date,
  unitNumber: string,
) {
  await resend.emails.send({
    from: FROM,
    to: tenantEmail,
    subject: `Rent due in 7 days — Unit ${unitNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Rent Reminder</h2>
        <p>Hi ${tenantName},</p>
        <p>Your rent of <strong>₱${amount.toLocaleString()}</strong> for Unit ${unitNumber} is due on <strong>${dueDate.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/payments" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Payment Details</a>
      </div>
    `,
  });
}
