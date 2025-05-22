import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  paintSeed: number;
  floatValue: number;
  price: string;
  inspectLink: string;
  imageUrl: string;
  found: Date;
  lastSeen: Date;
  isAvailable: boolean;
}

const ItemSchema: Schema = new Schema({
  paintSeed: { type: Number, required: true },
  floatValue: { type: Number, required: true },
  price: { type: String, required: true },
  inspectLink: { type: String, required: true },
  imageUrl: { type: String, required: true },
  found: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true }
});

// Create a compound index for unique combinations of paintSeed and floatValue
ItemSchema.index({ paintSeed: 1, floatValue: 1 }, { unique: true });

// Add index for the query in the items API route
ItemSchema.index({ isAvailable: 1, found: -1 });

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema); 