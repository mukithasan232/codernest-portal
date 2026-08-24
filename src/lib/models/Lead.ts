import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  service_type: string;
  status: 'pending' | 'emailed' | 'failed' | 'replied';
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    service_type: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'emailed', 'failed', 'replied'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
