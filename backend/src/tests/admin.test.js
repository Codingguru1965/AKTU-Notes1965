import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Resource } from '../models/Resource.js';
import { Admin } from '../models/Admin.js';
import { COOKIE_NAME } from '../config/env.js';

describe('Admin Authentication & Resource CRUD Tests', () => {
  const testAdminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@example.com';
  const testAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'TestPassSecure123!';
  let adminCookie = '';
  let createdResourceId = '';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (createdResourceId) {
      await Resource.findByIdAndDelete(createdResourceId);
    }
    await disconnectDB();
  });

  test('POST /api/admin/login fails with invalid credentials', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: testAdminEmail,
      password: 'WrongPassword123!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid email or password');
  });

  test('POST /api/admin/login succeeds with valid credentials and sets cookie', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: testAdminEmail,
      password: testAdminPassword
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.admin).toBeDefined();
    expect(res.body.admin.email).toBe(testAdminEmail);

    // Extract cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));
    expect(tokenCookie).toBeDefined();
    adminCookie = tokenCookie.split(';')[0];
  });

  test('GET /api/admin/me returns admin profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/admin/me')
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.admin.email).toBe(testAdminEmail);
  });

  test('GET /api/admin/me rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/admin/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/admin/stats returns dashboard analytics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBeGreaterThan(0);
    expect(res.body.data.published).toBeDefined();
  });

  test('POST /api/admin/resources creates a new resource with valid data', async () => {
    const newResource = {
      title: 'Cloud Computing Architecture Comprehensive Notes',
      resourceType: 'Notes',
      branch: 'CSE',
      year: 4,
      semester: 7,
      subjectCode: 'KOE072',
      subjectName: 'Cloud Computing',
      fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/cloud.pdf',
      academicYear: '2024-25',
      regulation: 'CBCS',
      description: 'Detailed study notes for cloud virtualization, hypervisors, and AWS/Azure models.',
      isPublished: true
    };

    const res = await request(app)
      .post('/api/admin/resources')
      .set('Cookie', [adminCookie])
      .send(newResource);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    createdResourceId = res.body.data._id;
  });

  test('POST /api/admin/upload successfully uploads a PDF file', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 test document content %%EOF');
    const res = await request(app)
      .post('/api/admin/upload')
      .set('Cookie', [adminCookie])
      .attach('file', pdfBuffer, 'sample-unit1-notes.pdf');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fileUrl).toMatch(/^\/uploads\//);
    expect(res.body.data.filename).toBeDefined();
  });

  test('POST /api/admin/resources creates resource with /uploads/ URL and university field', async () => {
    const localUploadResource = {
      title: 'Local Uploaded Discrete Structures Comprehensive Notes',
      resourceType: 'Notes',
      branch: 'CSE',
      year: 2,
      semester: 3,
      subjectCode: 'KCS303',
      subjectName: 'Discrete Structures',
      fileUrl: '/uploads/sample-unit1-notes.pdf',
      university: 'AKTU',
      academicYear: '2024-25',
      regulation: 'CBCS',
      isPublished: true
    };

    const res = await request(app)
      .post('/api/admin/resources')
      .set('Cookie', [adminCookie])
      .send(localUploadResource);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.university).toBe('AKTU');
    expect(res.body.data.fileUrl).toBe('/uploads/sample-unit1-notes.pdf');

    // Clean up
    await Resource.findByIdAndDelete(res.body.data._id);
  });

  test('POST /api/admin/resources rejects invalid year-semester combination with 400', async () => {
    const invalidResource = {
      title: 'Invalid Year Semester Combination Resource',
      resourceType: 'Notes',
      branch: 'CSE',
      year: 1, // Year 1 only supports semesters 1 and 2
      semester: 6, // Semester 6 is in Year 3!
      subjectCode: 'KCS601',
      subjectName: 'Software Engineering',
      fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/invalid.pdf'
    };

    const res = await request(app)
      .post('/api/admin/resources')
      .set('Cookie', [adminCookie])
      .send(invalidResource);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/admin/resources rejects unapproved storage domains with 400', async () => {
    const unapprovedDomainResource = {
      title: 'Malicious External Storage Resource',
      resourceType: 'Notes',
      branch: 'CSE',
      year: 2,
      semester: 3,
      subjectCode: 'KCS301',
      subjectName: 'Data Structures',
      fileUrl: 'https://untrusted-unknown-file-host.xyz/file.pdf'
    };

    const res = await request(app)
      .post('/api/admin/resources')
      .set('Cookie', [adminCookie])
      .send(unapprovedDomainResource);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('PATCH /api/admin/resources/:id updates resource', async () => {
    const res = await request(app)
      .patch(`/api/admin/resources/${createdResourceId}`)
      .set('Cookie', [adminCookie])
      .send({
        title: 'Cloud Computing Architecture Comprehensive Notes (Updated 2025)'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Updated 2025');
  });

  test('PATCH /api/admin/resources/:id/publish toggles publish status', async () => {
    const res = await request(app)
      .patch(`/api/admin/resources/${createdResourceId}/publish`)
      .set('Cookie', [adminCookie])
      .send({ isPublished: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isPublished).toBe(false);

    // Verify unpublished resource is not returned in public API!
    const publicRes = await request(app).get(`/api/resources/${createdResourceId}`);
    expect(publicRes.status).toBe(404);
  });

  test('DELETE /api/admin/resources/:id deletes resource with confirmation', async () => {
    const res = await request(app)
      .delete(`/api/admin/resources/${createdResourceId}`)
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get(`/api/admin/resources/${createdResourceId}`)
      .set('Cookie', [adminCookie]);

    expect(checkRes.status).toBe(404);
    createdResourceId = null; // Cleaned up
  });

  test('POST /api/admin/logout successfully clears cookie', async () => {
    const res = await request(app).post('/api/admin/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
