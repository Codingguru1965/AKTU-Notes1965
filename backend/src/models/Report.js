import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    resourceTitle: {
      type: String,
      default: ''
    },
    issueType: {
      type: String,
      enum: ['broken_link', 'incorrect_content', 'outdated_syllabus', 'other'],
      default: 'broken_link'
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Report = mongoose.model('Report', reportSchema);
