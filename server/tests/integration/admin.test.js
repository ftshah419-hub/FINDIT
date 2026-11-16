const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_findit_admin_2026';

const connectDB = require('../../src/config/db');
const { disconnectDB } = require('../../src/config/db');
const app = require('../../src/server');
const {
  User,
  Category,
  Item,
  Claim,
  AIMatch,
  ActivityLog,
  SystemSetting,
  Report,
} = require('../../src/models');

let server;
let port;
let adminToken;
let userToken;
let adminUser;
let regularUser;
let testCategory;
let testFoundItem;
let testClaim;

const request = async (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: `/api/v1${path}`,
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

describe('FINDIT Admin Module Integration Test Suite', () => {
  before(async () => {
    // Connect to database
    await connectDB();

    // Start server on ephemeral port
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });

    // Clean & Setup database
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      AIMatch.deleteMany({}),
      ActivityLog.deleteMany({}),
      SystemSetting.deleteMany({}),
      Report.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(6);
    const pwd = await bcrypt.hash('Secret@123', salt);

    adminUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'admin.test@campus.edu',
      password: pwd,
      role: 'ADMIN',
      isActive: true,
    });

    regularUser = await User.create({
      name: 'Alex Chen',
      email: 'alex.test@campus.edu',
      password: pwd,
      role: 'USER',
      isActive: true,
    });

    adminToken = jwt.sign(
      { userId: adminUser._id, role: 'ADMIN', email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { userId: regularUser._id, role: 'USER', email: regularUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    testCategory = await Category.create({
      name: 'Test Electronics',
      description: 'Test category description',
      isActive: true,
      createdBy: adminUser._id,
    });

    testFoundItem = await Item.create({
      reportedBy: regularUser._id,
      categoryId: testCategory._id,
      title: 'Found Apple Watch Ultra',
      description: 'Titanium orange band found in sports gym',
      type: 'FOUND',
      location: { depot: 'Athletics & Recreation Hub', room: 'Gym 1' },
      status: 'APPROVED',
    });

    testClaim = await Claim.create({
      itemId: testFoundItem._id,
      claimantId: regularUser._id,
      claimDescription: 'Purchased watch on Amazon with matching receipt.',
      status: 'PENDING',
    });
  });

  after(async () => {
    if (server) server.close();
    await disconnectDB();
    process.exit(0);
  });

  test('1. Security: Unauthenticated request should be rejected with 401', async () => {
    const res = await request('/admin/dashboard');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.errorCode, 'UNAUTHORIZED');
  });

  test('2. Security: Regular USER role cannot access admin endpoints (403 Forbidden)', async () => {
    const res = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.errorCode, 'FORBIDDEN');
  });

  test('3. Dashboard: Admin access returns aggregated statistics and charts', async () => {
    const res = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.metrics);
    assert.ok(res.body.data.charts);
    assert.strictEqual(typeof res.body.data.metrics.totalUsers, 'number');
  });

  test('4. User Management: List users returns paginated records with counts', async () => {
    const res = await request('/admin/users?page=1&limit=10', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.users));
    assert.ok(res.body.data.pagination);
    assert.strictEqual(res.body.data.users.length >= 2, true);
  });

  test('5. User Management: Admin cannot suspend their own account', async () => {
    const res = await request(`/admin/users/${adminUser._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false, reason: 'Accidental self-lock' },
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('6. User Management: Suspend and Reactivate a regular user', async () => {
    // Suspend
    const suspendRes = await request(`/admin/users/${regularUser._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false, reason: 'Policy audit' },
    });
    assert.strictEqual(suspendRes.status, 200);
    assert.strictEqual(suspendRes.body.data.isActive, false);

    // Reactivate
    const reactivateRes = await request(`/admin/users/${regularUser._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: true },
    });
    assert.strictEqual(reactivateRes.status, 200);
    assert.strictEqual(reactivateRes.body.data.isActive, true);
  });

  test('7. Item Moderation: Approve and Reject lost/found reports', async () => {
    const pendingItem = await Item.create({
      reportedBy: regularUser._id,
      categoryId: testCategory._id,
      title: 'Unreviewed Blue Umbrella',
      description: 'Found near cafeteria',
      type: 'FOUND',
      status: 'PENDING',
    });

    // Reject requires reason
    const badReject = await request(`/admin/items/${pendingItem._id}/review`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'REJECTED' },
    });
    assert.strictEqual(badReject.status, 400);

    // Approve item
    const approveRes = await request(`/admin/items/${pendingItem._id}/review`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'APPROVED' },
    });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.data.status, 'APPROVED');
  });

  test('8. Categories: Create, uniqueness check, and deactivation', async () => {
    // Create
    const createRes = await request('/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: 'Musical Instruments', description: 'Guitars, violins' },
    });
    assert.strictEqual(createRes.status, 201);
    const catId = createRes.body.data._id;

    // Duplicate rejection
    const dupRes = await request('/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: 'Musical Instruments' },
    });
    assert.strictEqual(dupRes.status, 409);

    // Soft deactivation
    const updateRes = await request(`/admin/categories/${catId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false },
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.isActive, false);
  });

  test('9. Activity Logs: Audit events are logged and exportable as CSV', async () => {
    const listRes = await request('/admin/activity-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.data.logs.length > 0);

    const exportRes = await request('/admin/activity-logs/export', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(exportRes.status, 200);
    assert.ok(typeof exportRes.body === 'string');
    assert.ok(exportRes.body.includes('Timestamp,Action,Actor Name'));
  });

  test('10. System Settings: Retrieve and update configuration', async () => {
    const getRes = await request('/admin/settings', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(getRes.status, 200);
    assert.ok(Array.isArray(getRes.body.data));

    const updateRes = await request('/admin/settings/aiMatchingThreshold', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { value: 90 },
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.value, 90);
  });
});
