import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../../api/send-inquiry';

interface MockResponseData {
  error?: string;
  success?: boolean;
  method?: string;
  message?: string;
}

function createMockResponse() {
  let statusCode = 0;
  let jsonBody: MockResponseData = {};

  const res = {
    setHeader: vi.fn(),
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: unknown) => {
          jsonBody = data as MockResponseData;
        },
        end: vi.fn(),
      };
    },
  };

  return {
    res,
    getStatusCode: () => statusCode,
    getBody: () => jsonBody,
  };
}

describe('API: /api/send-inquiry serverless handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('1. Rejects non-POST requests with 405', async () => {
    const mock = createMockResponse();
    const req = { method: 'GET' };

    await handler(req, mock.res);
    expect(mock.getStatusCode()).toBe(405);
    expect(mock.getBody().error).toBe('Method not allowed');
  });

  it('2. Returns 400 when required fields are missing', async () => {
    const mock = createMockResponse();
    const req = {
      method: 'POST',
      body: { name: 'Dr. Benali' }, // missing company, email, phone
    };

    await handler(req, mock.res);
    expect(mock.getStatusCode()).toBe(400);
    expect(mock.getBody().error).toContain('Missing required fields');
  });

  it('3. Handles inquiry successfully in local/fallback mode when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY;

    const mock = createMockResponse();
    const req = {
      method: 'POST',
      body: {
        name: 'Dr. Karim Benali',
        company: 'Laboratoires Algériens',
        email: 'karim@labo.dz',
        phone: '0550123456',
        interests: ['Excel 9 595', '493 DCI importées'],
        questions: 'Disponibilité du dataset ?',
      },
    };

    await handler(req, mock.res);
    expect(mock.getStatusCode()).toBe(200);
    expect(mock.getBody().success).toBe(true);
    expect(mock.getBody().method).toBe('local_fallback');
  });

  it('4. Dispatches both admin notification and visitor confirmation when RESEND_API_KEY is provided', async () => {
    process.env.RESEND_API_KEY = 're_test_mock_key_123';
    process.env.NOTIFICATION_EMAIL = 'contact@techwise-dz.com';

    // Mock global fetch for Resend API
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_mock_123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const mock = createMockResponse();
    const req = {
      method: 'POST',
      body: {
        name: 'Dr. Karim Benali',
        company: 'Laboratoires Algériens',
        email: 'karim@labo.dz',
        phone: '0550123456',
        interests: ['Fichier Excel 9 595', 'Liste 493 DCI'],
        questions: 'Délai d’obtention ?',
        language: 'fr' as const,
      },
    };

    await handler(req, mock.res);
    expect(mock.getStatusCode()).toBe(200);
    expect(mock.getBody().success).toBe(true);
    expect(mock.getBody().method).toBe('resend');

    // Verify fetch was called twice (1 for admin, 1 for visitor confirmation)
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const firstCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(firstCallBody.to).toContain('contact@techwise-dz.com');
    expect(firstCallBody.subject).toContain('[Lead B2B PharmaSearch]');

    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(secondCallBody.to).toContain('karim@labo.dz');
    expect(secondCallBody.subject).toContain('Confirmation de réception de votre demande');
  });

  it('5. Supports multiple comma- or semicolon-separated admin recipients in NOTIFICATION_EMAIL', async () => {
    process.env.RESEND_API_KEY = 're_test_mock_key_123';
    process.env.NOTIFICATION_EMAIL = 'admin1@techwise-dz.com, admin2@gmail.com; colleague@domain.dz';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_mock_multi' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const mock = createMockResponse();
    const req = {
      method: 'POST',
      body: {
        name: 'Sara Medjani',
        company: 'Pharmalliance',
        email: 'sara@pharmalliance.dz',
        phone: '0550998877',
        interests: ['Scorecards & Benchmarking'],
      },
    };

    await handler(req, mock.res);
    expect(mock.getStatusCode()).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const firstCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(firstCallBody.to).toEqual([
      'admin1@techwise-dz.com',
      'admin2@gmail.com',
      'colleague@domain.dz',
    ]);
  });
});
