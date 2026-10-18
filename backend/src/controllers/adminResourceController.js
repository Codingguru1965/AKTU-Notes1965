import { Resource } from '../models/Resource.js';
import { Report } from '../models/Report.js';
import { transformStorageUrl } from '../services/storageService.js';

export const getAdminResources = async (req, res, next) => {
  try {
    const { branch, semester, year, resourceType, status, search, page = 1, limit = 15 } = req.query;

    const filter = {};

    if (branch) filter.branch = branch.toUpperCase();
    if (semester) filter.semester = Number(semester);
    if (year) filter.year = Number(year);
    if (resourceType) filter.resourceType = resourceType;
    if (status === 'published') filter.isPublished = true;
    if (status === 'unpublished') filter.isPublished = false;

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^\x24{}()|[\]\\]/g, '\\$&');
      filter['$or'] = [
        { title: { '$regex': sanitized, '$options': 'i' } },
        { subjectName: { '$regex': sanitized, '$options': 'i' } },
        { subjectCode: { '$regex': sanitized, '$options': 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(filter)
    ]);

    const formatted = resources.map(item => ({
      ...item,
      ...transformStorageUrl(item.fileUrl)
    }));

    res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).lean();
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...resource,
        ...transformStorageUrl(resource.fileUrl)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const {
      title,
      resourceType,
      branch,
      year,
      semester,
      subjectCode,
      subjectName,
      fileUrl,
      academicYear,
      regulation,
      description,
      isPublished
    } = req.body;

    const existing = await Resource.findOne({
      subjectCode: subjectCode.toUpperCase(),
      resourceType,
      semester,
      academicYear: academicYear || '',
      regulation: regulation || ''
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A resource for subject ${subjectCode} (${resourceType}, Sem ${semester}) already exists. Please edit existing entry or distinguish with different academic year/regulation.`
      });
    }

    const resource = await Resource.create({
      title,
      resourceType,
      branch: branch.toUpperCase(),
      year,
      semester,
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      fileUrl,
      academicYear: academicYear || '',
      regulation: regulation || '',
      description: description || '',
      isPublished: Boolean(isPublished)
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    const allowed = [
      'title', 'resourceType', 'branch', 'year', 'semester',
      'subjectCode', 'subjectName', 'fileUrl', 'academicYear',
      'regulation', 'description', 'isPublished'
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'branch' || field === 'subjectCode') {
          resource[field] = req.body[field].toUpperCase();
        } else {
          resource[field] = req.body[field];
        }
      }
    });

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    await Report.deleteMany({ resourceId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const togglePublishResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    if (req.body.isPublished !== undefined) {
      resource.isPublished = Boolean(req.body.isPublished);
    } else {
      resource.isPublished = !resource.isPublished;
    }

    await resource.save();

    res.status(200).json({
      success: true,
      message: `Resource is now ${resource.isPublished ? 'published' : 'unpublished'}`,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [total, published, unpublished, byType, byBranch, pendingReports, recentResources] = await Promise.all([
      Resource.countDocuments(),
      Resource.countDocuments({ isPublished: true }),
      Resource.countDocuments({ isPublished: false }),
      Resource.aggregate([
        { '$group': { _id: '$resourceType', count: { '$sum': 1 } } }
      ]),
      Resource.aggregate([
        { '$group': { _id: '$branch', count: { '$sum': 1 } } },
        { '$sort': { count: -1 } }
      ]),
      Report.countDocuments({ status: 'pending' }),
      Resource.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title subjectCode resourceType branch semester isPublished createdAt')
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        published,
        unpublished,
        byType: byType.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        byBranch: byBranch.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        pendingReports,
        recentResources
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('resourceId', 'title subjectCode fileUrl isPublished')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Report.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report status'
      });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report status updated',
      data: report
    });
  } catch (err) {
    next(err);
  }
};
