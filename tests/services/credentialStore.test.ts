import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { CredentialStore } from '../../src/services/credentialStore.js';

const TEST_FILE_PATH = path.resolve(process.cwd(), 'scratch/test_user_credentials.json');

function cleanupTestFile() {
  if (fs.existsSync(TEST_FILE_PATH)) {
    fs.unlinkSync(TEST_FILE_PATH);
  }
}

test('CredentialStore - save, retrieve, check and delete credentials', () => {
  cleanupTestFile();
  const store = new CredentialStore(TEST_FILE_PATH);

  assert.equal(store.hasCredentials('user123'), false);
  assert.equal(store.getCredentials('user123'), null);

  const savedRecord = store.saveCredentials('user123', 'testuser', 'csrf_val', 'session_val');
  assert.equal(savedRecord.userId, 'user123');
  assert.equal(savedRecord.username, 'testuser');

  assert.equal(store.hasCredentials('user123'), true);
  const creds = store.getCredentials('user123');
  assert.deepEqual(creds, {
    csrfToken: 'csrf_val',
    sessionCookie: 'session_val',
  });

  const record = store.getUserRecord('user123');
  assert.equal(record?.username, 'testuser');
  assert.ok(record?.updatedAt);

  const deleted = store.deleteCredentials('user123');
  assert.equal(deleted, true);
  assert.equal(store.hasCredentials('user123'), false);
  assert.equal(store.deleteCredentials('user123'), false);

  cleanupTestFile();
});

test('CredentialStore - handles invalid or empty JSON file gracefully', () => {
  cleanupTestFile();
  const dir = path.dirname(TEST_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TEST_FILE_PATH, 'INVALID_JSON', 'utf-8');

  const store = new CredentialStore(TEST_FILE_PATH);
  assert.equal(store.hasCredentials('user123'), false);
  assert.equal(store.getCredentials('user123'), null);

  // Saving should overwrite invalid file cleanly
  store.saveCredentials('user123', 'testuser', 'csrf', 'sess');
  assert.equal(store.hasCredentials('user123'), true);

  cleanupTestFile();
});
