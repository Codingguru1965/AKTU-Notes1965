import mongoose from 'mongoose';
import { BRANCHES, RESOURCE_TYPES, SEMESTER_YEAR_MAP } from '../config/constants.js';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: RESOURCE_TYPES,
        message: '{VALUE} is not a valid resource type'
      }
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return BRANCHES.includes(v) || (typeof v === 'string' && v.length >= 2);
        },
        message: props => `${props.value} is not a recognized branch`
      }
    },
    year: {
      type: Number,
      required: [true, 'Academic year (1-4) is required'],
      min: [1, 'Year must be between 1 and 4'],
      max: [4, 'Year must be between 1 and 4']
    },
    semester: {
      type: Number,
      required: [true, 'Semester (1-8) is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8']
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Subject code must be at least 2 characters'],
      maxlength: [25, 'Subject code cannot exceed 25 characters']
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters'],
      maxlength: [120, 'Subject name cannot exceed 120 characters']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    university: {
      type: String,
      trim: true,
      default: 'AKTU',
      maxlength: [100, 'University name cannot exceed 100 characters']
    },
    academicYear: {
      type: String,
      trim: true,
      default: ''
    },
    regulation: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.pre('validate', function (next) {
  if (this.year && this.semester) {
    const expectedYear = SEMESTER_YEAR_MAP[this.semester];
    if (expectedYear !== this.year) {
      this.invalidate('semester', `Semester ${this.semester} belongs to Year ${expectedYear}, not Year ${this.year}`);
    }
  }
  next();
});

resourceSchema.index({ resourceType: 1, branch: 1, semester: 1, isPublished: 1 });
resourceSchema.index({ subjectCode: 1 });
resourceSchema.index({ branch: 1, semester: 1 });

resourceSchema.index({
  title: 'text',
  subjectName: 'text',
  subjectCode: 'text'
});

export const Resource = mongoose.model('Resource', resourceSchema);
