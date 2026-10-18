import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Resource } from '../models/Resource.js';

describe('Public API Tests - AKTU Notes1965', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('AKTU Notes1965 API');
  });

  test('GET /api/resources returns published resources only', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Verify all returned resources are published
    const allPublished = res.body.data.every(r => r.isPublished === true);
    expect(allPublished).toBe(true);
  });

  test('GET /api/resources?branch=CSE filters resources by branch', async () => {
    const res = await request(app).get('/api/resources?branch=CSE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach(item => {
      expect(item.branch).toBe('CSE');
    });
  });

  test('GET /api/resources?semester=3 filters resources by semester', async () => {
    const res = await request(app).get('/api/resources?semester=3');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach(item => {
      expect(item.semester).toBe(3);
    });
  });

  test('GET /api/resources?resourceType=Notes filters by type', async () => {
    const res = await request(app).get('/api/resources?resourceType=Notes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach(item => {
      expect(item.resourceType).toBe('Notes');
    });
  });

  test('GET /api/resources?search=Data Structures performs keyword search', async () => {
    const res = await request(app).get('/api/resources?search=Data%20Structures');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const hasMatch = res.body.data.some(r =>
      r.title.includes('Data Structures') || r.subjectName.includes('Data Structures') || r.subjectCode.includes('KCS301')
    );
    expect(hasMatch).toBe(true);
  });

  test('GET /api/resources with pagination returns pagination metadata', async () => {
    const res = await request(app).get('/api/resources?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/resources returns empty array when no records match', async () => {
    const res = await request(app).get('/api/resources?search=NonExistentSubjectXYZ999');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  test('GET /api/resources rejects invalid query parameters with 400', async () => {
    const res = await request(app).get('/api/resources?semester=99');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/filters returns available filter options', async () => {
    const res = await request(app).get('/api/filters');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.branches)).toBe(true);
    expect(Array.isArray(res.body.data.resourceTypes)).toBe(true);
  });

  test('GET /api/subjects returns subjects filtered by branch', async () => {
    const res = await request(app).get('/api/subjects?branch=CSE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/reports submits a valid broken link report', async () => {
    const resource = await Resource.findOne({ isPublished: true });
    expect(resource).toBeDefined();

    const res = await request(app).post('/api/reports').send({
      resourceId: resource._id.toString(),
      issueType: 'broken_link',
      description: 'The download link returned 404 in test'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });
});
