import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignSettings extends Document {
  daily_email_limit: number;
  emails_sent_today: number;
  last_reset_date: Date;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  updatedAt: Date;
}

const CampaignSettingsSchema: Schema = new Schema(
  {
    daily_email_limit: { type: Number, required: true, default: 50 },
    emails_sent_today: { type: Number, required: true, default: 0 },
    last_reset_date: { type: Date, required: true, default: Date.now },
    smtp_host: { type: String },
    smtp_port: { type: Number },
    smtp_user: { type: String },
    smtp_pass: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.CampaignSettings || mongoose.model<ICampaignSettings>('CampaignSettings', CampaignSettingsSchema);
