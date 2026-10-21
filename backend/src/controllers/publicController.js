import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Resource } from '../models/Resource.js';
import { Report } from '../models/Report.js';
import { transformStorageUrl } from '../services/storageService.js';
import { BRANCHES, RESOURCE_TYPES, SEMESTERS } from '../config/constants.js';
import { BACKEND_URL } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'AKTU Notes1965 API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

export const getResources = async (req, res, next) => {
  try {
    const { branch, semester, year, resourceType, subjectCode, search, page = 1, limit = 12 } = req.query;

    const filter = { isPublished: true };

    if (branch) {
      filter.branch = branch.toUpperCase();
    }
    if (semester) {
      filter.semester = Number(semester);
    }
    if (year) {
      filter.year = Number(year);
    }
    if (resourceType) {
      filter.resourceType = resourceType;
    }
    if (subjectCode) {
      filter.subjectCode = subjectCode.toUpperCase();
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^\x24{}()|[\]\\]/g, '\\$&');
      filter['$or'] = [
        { title: { '$regex': sanitized, '$options': 'i' } },
        { subjectName: { '$regex': sanitized, '$options': 'i' } },
        { subjectCode: { '$regex': sanitized, '$options': 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(filter)
    ]);

    const formatted = resources.map(item => {
      const transformed = transformStorageUrl(item.fileUrl);
      return {
        ...item,
        fileUrl: transformed.originalUrl,
        downloadUrl: transformed.downloadUrl,
        previewUrl: transformed.previewUrl
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasMore: pageNum * limitNum < total
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isPublished: true
    }).lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found or is currently unpublished.'
      });
    }

    const transformed = transformStorageUrl(resource.fileUrl);
    res.status(200).json({
      success: true,
      data: {
        ...resource,
        fileUrl: transformed.originalUrl,
        downloadUrl: transformed.downloadUrl,
        previewUrl: transformed.previewUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getFilters = async (req, res, next) => {
  try {
    const [branchesInDb, semestersInDb, typesInDb, academicYears] = await Promise.all([
      Resource.distinct('branch', { isPublished: true }),
      Resource.distinct('semester', { isPublished: true }),
      Resource.distinct('resourceType', { isPublished: true }),
      Resource.distinct('academicYear', { isPublished: true, academicYear: { '$ne': '' } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        branches: branchesInDb.length ? branchesInDb : BRANCHES,
        semesters: semestersInDb.length ? semestersInDb.sort((a, b) => a - b) : SEMESTERS,
        resourceTypes: typesInDb.length ? typesInDb : RESOURCE_TYPES,
        academicYears: academicYears.filter(Boolean)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const { branch, semester } = req.query;
    const filter = { isPublished: true };

    if (branch) filter.branch = branch.toUpperCase();
    if (semester) filter.semester = Number(semester);

    const subjects = await Resource.aggregate([
      { '$match': filter },
      {
        '$group': {
          _id: { subjectCode: '$subjectCode', subjectName: '$subjectName' },
          branch: { '$first': '$branch' },
          semester: { '$first': '$semester' },
          resourceCount: { '$sum': 1 }
        }
      },
      {
        '$project': {
          _id: 0,
          subjectCode: '$_id.subjectCode',
          subjectName: '$_id.subjectName',
          branch: 1,
          semester: 1,
          resourceCount: 1
        }
      },
      { '$sort': { subjectName: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (err) {
    next(err);
  }
};

export const reportResource = async (req, res, next) => {
  try {
    const { resourceId, resourceTitle, issueType, description } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    const report = await Report.create({
      resourceId,
      resourceTitle: resourceTitle || resource.title,
      issueType,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping keep AKTU Notes1965 updated!',
      data: { id: report._id }
    });
  } catch (err) {
    next(err);
  }
};

export const downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isPublished: true
    }).lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found or is currently unpublished.'
      });
    }

    // Increment download count in background (non-blocking)
    Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }).catch(() => {});

    // If file is stored locally on disk, send directly with Content-Disposition: attachment
    if (resource.fileUrl && resource.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(resource.fileUrl);
      const filePath = path.resolve(__dirname, '../../uploads', filename);

      if (fs.existsSync(filePath)) {
        const cleanTitle = (resource.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
        const prefix = resource.subjectCode ? `${resource.subjectCode}_` : '';
        const downloadName = `${prefix}${cleanTitle}.pdf`;
        return res.download(filePath, downloadName);
      }
    }

    const transformed = transformStorageUrl(resource.fileUrl);
    let finalUrl = transformed.downloadUrl;

    // If local upload URL without local file, build absolute URL using BACKEND_URL
    if (finalUrl && finalUrl.startsWith('/uploads/')) {
      const base = BACKEND_URL.replace(/\/+$/, '');
      finalUrl = `${base}${finalUrl}`;
    }

    if (!finalUrl) {
      return res.status(404).json({
        success: false,
        error: 'File not available for download.'
      });
    }

    // Redirect user to the actual external file URL
    res.redirect(302, finalUrl);
  } catch (err) {
    next(err);
  }
};
