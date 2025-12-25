import type { Handler, HandlerEvent } from '@netlify/functions';

const STATSIG_API_URL = 'https://statsigapi.net/console/v1';
const API_VERSION = '20240601';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type CreateExperimentBody = {
  readonly name: string;
  readonly hypothesis?: string;
};

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.STATSIG_CONSOLE_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'STATSIG_CONSOLE_KEY not configured' }),
    };
  }

  const body = parseBody(event.body);

  if (!body) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  if (!body.name) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing name parameter' }),
    };
  }

  const response = await fetch(`${STATSIG_API_URL}/experiments`, {
    method: 'POST',
    headers: {
      'STATSIG-API-KEY': apiKey,
      'STATSIG-API-VERSION': API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: body.name,
      idType: 'userID',
      hypothesis: body.hypothesis ?? '',
      groups: [
        { name: 'control', size: 50, parameterValues: { variant: 'control' } },
        { name: 'test', size: 50, parameterValues: { variant: 'test' } },
      ],
    }),
  });
  
  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: response.status,
      headers: corsHeaders,
      body: JSON.stringify({ error: data.message ?? 'Failed to create experiment', details: data }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(data.data),
  };
};

const parseBody = (body: string | null): CreateExperimentBody | null => {
  try {
    return JSON.parse(body ?? '{}');
  } catch {
    return null;
  }
};