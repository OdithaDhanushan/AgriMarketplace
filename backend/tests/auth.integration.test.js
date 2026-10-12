const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const net = require('node:net');
const mongoose = require('mongoose');
const path = require('node:path');
const { test } = require('node:test');
const Order = require('../models/Order');
const Produce = require('../models/Produce');
const User = require('../models/User');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const backendDirectory = path.join(__dirname, '..');

const getAvailablePort = async () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close((error) => (error ? reject(error) : resolve(port)));
  });
});

const signExpiredToken = (userId, secret) => {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ userId, exp: Math.floor(Date.now() / 1000) - 60 });
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
};

test('registration, login, JWT, profile, and ownership API integration', async (t) => {
  assert.ok(process.env.MONGO_URI, 'MONGO_URI must be configured in backend/.env');

  await mongoose.connect(process.env.MONGO_URI);
  const port = await getAvailablePort();
  const secret = crypto.randomBytes(32).toString('hex');
  const startServer = () => spawn(process.execPath, ['server.js'], {
    cwd: backendDirectory,
    env: { ...process.env, PORT: String(port), JWT_SECRET: secret, NODE_ENV: 'test' },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  let server = startServer();
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const tokens = new Set();
  let testProduceId;
  let testOrderId;

  const request = async (endpoint, { method = 'GET', token, body } = {}) => {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    return { status: response.status, data };
  };

  const waitForServer = async () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (server.exitCode !== null) throw new Error(`Test backend exited with code ${server.exitCode}.`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/health`);
        if (response.ok) return;
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    throw new Error('Timed out waiting for the test backend.');
  };

  const stopServer = async () => {
    if (server.exitCode !== null) return;
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 3000);
      server.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
      server.kill();
    });
  };

  try {
    await waitForServer();

    const unique = crypto.randomBytes(6).toString('hex');
    const farmerData = {
      name: 'Fresh Vegi API Test Farmer',
      email: `fv-test-farmer-${unique}@example.invalid`,
      phone: `test-farmer-${unique}`,
      password: 'Test-Password-4827',
      role: 'Farmer',
      language: 'en',
      location: 'Test Location',
    };
    const otherFarmerData = {
      ...farmerData,
      email: `fv-test-other-farmer-${unique}@example.invalid`,
      phone: `test-other-farmer-${unique}`,
    };
    const buyerData = {
      ...farmerData,
      email: `fv-test-buyer-${unique}@example.invalid`,
      phone: `test-buyer-${unique}`,
      role: 'Buyer',
    };
    const otherBuyerData = {
      ...farmerData,
      email: `fv-test-other-buyer-${unique}@example.invalid`,
      phone: `test-other-buyer-${unique}`,
      role: 'Buyer',
    };

    await t.test('validates registration and rejects duplicate accounts', async () => {
      const missingField = await request('/users/register', { method: 'POST', body: { ...farmerData, phone: '' } });
      assert.equal(missingField.status, 400);

      const invalidEmail = await request('/users/register', { method: 'POST', body: { ...farmerData, email: 'invalid-email' } });
      assert.equal(invalidEmail.status, 400);

      const created = await request('/users/register', { method: 'POST', body: farmerData });
      assert.equal(created.status, 201);
      assert.ok(created.data.token);
      assert.equal(created.data.user.email, farmerData.email);
      assert.equal('password' in created.data.user, false);
      assert.equal('passwordHash' in created.data.user, false);
      const savedUser = await User.findById(created.data.user.id).select('+passwordHash');
      assert.ok(savedUser);
      assert.equal(savedUser.email, farmerData.email);
      assert.notEqual(savedUser.passwordHash, farmerData.password);
      tokens.add(created.data.token);
      farmerData.user = created.data.user;
      farmerData.token = created.data.token;

      const duplicateEmail = await request('/users/register', {
        method: 'POST',
        body: { ...farmerData, email: farmerData.email, phone: `new-${unique}` },
      });
      assert.equal(duplicateEmail.status, 409);
      assert.equal(duplicateEmail.data.code, 'EMAIL_EXISTS');

      const duplicatePhone = await request('/users/register', {
        method: 'POST',
        body: { ...farmerData, email: `fv-test-phone-${unique}@example.invalid` },
      });
      assert.equal(duplicatePhone.status, 409);
      assert.equal(duplicatePhone.data.code, 'PHONE_EXISTS');

      const otherFarmer = await request('/users/register', { method: 'POST', body: otherFarmerData });
      const buyer = await request('/users/register', { method: 'POST', body: buyerData });
      const otherBuyer = await request('/users/register', { method: 'POST', body: otherBuyerData });
      for (const account of [otherFarmer, buyer, otherBuyer]) {
        assert.equal(account.status, 201);
        tokens.add(account.data.token);
      }
      otherFarmerData.user = otherFarmer.data.user;
      otherFarmerData.token = otherFarmer.data.token;
      buyerData.user = buyer.data.user;
      buyerData.token = buyer.data.token;
      otherBuyerData.user = otherBuyer.data.user;
      otherBuyerData.token = otherBuyer.data.token;
    });

    await t.test('checks credentials and rejects missing, invalid, and expired JWTs', async () => {
      const validLogin = await request('/users/login', {
        method: 'POST',
        body: { identifier: farmerData.email, password: farmerData.password },
      });
      assert.equal(validLogin.status, 200);
      assert.equal(validLogin.data.user.id, farmerData.user.id);
      assert.ok(validLogin.data.token);
      tokens.add(validLogin.data.token);

      const phoneLogin = await request('/users/login', {
        method: 'POST',
        body: { identifier: farmerData.phone, password: farmerData.password },
      });
      assert.equal(phoneLogin.status, 200);
      tokens.add(phoneLogin.data.token);

      const invalidPassword = await request('/users/login', {
        method: 'POST',
        body: { identifier: farmerData.email, password: 'Wrong-Password-4827' },
      });
      assert.equal(invalidPassword.status, 401);

      assert.equal((await request('/users/me')).status, 401);
      assert.equal((await request('/users/me', { token: 'not.a.jwt' })).status, 401);
      assert.equal((await request('/users/me', {
        token: signExpiredToken(farmerData.user.id, secret),
      })).status, 401);
      assert.equal((await request('/users/me', { token: validLogin.data.token })).status, 200);
    });

    await t.test('reads and updates only the authenticated profile', async () => {
      const profile = await request('/users/me', { token: farmerData.token });
      assert.equal(profile.status, 200);
      assert.equal(profile.data.user.id, farmerData.user.id);
      assert.equal('passwordHash' in profile.data.user, false);

      const updated = await request('/users/me', {
        method: 'PUT',
        token: farmerData.token,
        body: {
          name: 'Updated API Test Farmer',
          email: farmerData.email,
          phone: farmerData.phone,
          location: 'Updated Location',
          farmName: 'API Test Farm',
          paymentMode: 'Mobile Wallet',
          role: 'Buyer',
          _id: otherFarmerData.user.id,
          passwordHash: 'must-not-be-written',
        },
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.data.user.name, 'Updated API Test Farmer');
      assert.equal(updated.data.user.location, 'Updated Location');
      assert.equal(updated.data.user.farmName, 'API Test Farm');
      assert.equal(updated.data.user.paymentMode, 'Mobile Wallet');
      assert.equal(updated.data.user.role, 'Farmer');
      assert.equal(updated.data.user.id, farmerData.user.id);
      assert.equal('passwordHash' in updated.data.user, false);

      const persisted = await request('/users/me', { token: farmerData.token });
      assert.equal(persisted.data.user.farmName, 'API Test Farm');
      assert.equal((await User.findById(farmerData.user.id)).farmName, 'API Test Farm');

      const duplicateEmail = await request('/users/me', {
        method: 'PUT',
        token: farmerData.token,
        body: { email: otherFarmerData.user.email },
      });
      assert.equal(duplicateEmail.status, 409);

      const invalidPayment = await request('/users/me', {
        method: 'PUT',
        token: farmerData.token,
        body: { paymentMode: 'Unapproved Method' },
      });
      assert.equal(invalidPayment.status, 400);

      const anotherUsersProfile = await request(`/users/${otherFarmerData.user.id}`, { token: farmerData.token });
      assert.equal(anotherUsersProfile.status, 404);
    });

    await t.test('enforces Farmer produce ownership and Buyer order ownership', async () => {
      const producePayload = {
        cropName: 'API Test Carrots',
        quantityKg: 10,
        sellingPricePerKg: 250,
        location: 'Test Location',
      };
      assert.equal((await request('/produce', { method: 'POST', body: producePayload })).status, 401);
      assert.equal((await request('/produce', { method: 'POST', token: buyerData.token, body: producePayload })).status, 403);

      const produce = await request('/produce', { method: 'POST', token: farmerData.token, body: producePayload });
      assert.equal(produce.status, 201);
      assert.equal(produce.data.farmerId, farmerData.user.id);
      testProduceId = produce.data._id;

      const myProduce = await request('/produce/mine', { token: farmerData.token });
      assert.equal(myProduce.status, 200);
      assert.ok(myProduce.data.some((item) => item._id === produce.data._id));
      const otherFarmersProduce = await request('/produce/mine', { token: otherFarmerData.token });
      assert.equal(otherFarmersProduce.data.some((item) => item._id === produce.data._id), false);

      const crossFarmerEdit = await request(`/produce/${produce.data._id}`, {
        method: 'PUT',
        token: otherFarmerData.token,
        body: { quantityKg: 99 },
      });
      assert.equal(crossFarmerEdit.status, 404);

      const orderBody = {
        items: [{ productName: 'API Test Carrots', quantity: 2, pricePerKg: 250 }],
        totalAmount: 500,
        deliveryAddress: 'Test Address',
        paymentMethod: 'Cash on Delivery',
      };
      assert.equal((await request('/orders')).status, 401);
      assert.equal((await request('/orders/verify-otp', {
        method: 'POST',
        body: { orderId: '000000000000000000000001', otpCode: '1234' },
      })).status, 401);
      assert.equal((await request('/orders', { method: 'POST', body: orderBody })).status, 401);
      assert.equal((await request('/orders', { method: 'POST', token: farmerData.token, body: orderBody })).status, 403);

      const order = await request('/orders', { method: 'POST', token: buyerData.token, body: orderBody });
      assert.equal(order.status, 201);
      assert.equal(order.data.order.buyerId, buyerData.user.id);
      testOrderId = order.data.order._id;
      assert.ok(await Order.findById(testOrderId));
      const buyerOrders = await request('/orders', { token: buyerData.token });
      assert.ok(buyerOrders.data.some((entry) => entry._id === order.data.order._id));
      const otherBuyerOrders = await request('/orders', { token: otherBuyerData.token });
      assert.equal(otherBuyerOrders.data.some((entry) => entry._id === order.data.order._id), false);

      const crossBuyerOtp = await request('/orders/verify-otp', {
        method: 'POST',
        token: otherBuyerData.token,
        body: { orderId: order.data.order._id, otpCode: order.data.order.otpCode },
      });
      assert.equal(crossBuyerOtp.status, 404);
    });

    await t.test('deletes only the authenticated user and owned records', async () => {
      const deleted = await request('/users/me', { method: 'DELETE', token: farmerData.token });
      assert.equal(deleted.status, 200);
      assert.equal((await request('/users/me', { token: farmerData.token })).status, 401);
      assert.equal((await request(`/produce/${testProduceId}`)).status, 404);
      assert.equal(await User.exists({ _id: farmerData.user.id }), null);
      assert.equal(await Produce.exists({ _id: testProduceId }), null);

      const otherUserStillExists = await request('/users/me', { token: otherFarmerData.token });
      assert.equal(otherUserStillExists.status, 200);

      const deletedBuyer = await request('/users/me', { method: 'DELETE', token: buyerData.token });
      assert.equal(deletedBuyer.status, 200);
      assert.equal(await User.exists({ _id: buyerData.user.id }), null);
      assert.equal(await Order.exists({ _id: testOrderId }), null);
      assert.equal((await request('/users/me', { token: otherBuyerData.token })).status, 200);
    });

    await t.test('restarts cleanly and accepts the same configured JWT', async () => {
      await stopServer();
      server = startServer();
      await waitForServer();
      const restoredProfile = await request('/users/me', { token: otherFarmerData.token });
      assert.equal(restoredProfile.status, 200);
      assert.equal(restoredProfile.data.user.id, otherFarmerData.user.id);
    });
  } finally {
    for (const token of tokens) {
      try {
        await request('/users/me', { method: 'DELETE', token });
      } catch (error) {
        continue;
      }
    }
    await stopServer();
    await mongoose.disconnect();
  }
});