import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');


export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        const data = await resend.emails.send({
            from: 'CoderNest <updates@codernest.agency>',
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
}

export default resend;
