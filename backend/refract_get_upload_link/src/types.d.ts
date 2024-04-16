
export interface APIEvent {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: any;
  queryStringParameters: any;
  requestContext: RequestContext;
  pathParameters: any;
  body: string;
  isBase64Encoded: boolean;
}


export interface RequestContext {
  accountId: string;
  apiId: string;
  domainName: string;
  domainPrefix: string;
  http: Http;
  requestId: string;
  routeKey: string;
  stage: string;
  time: string;
  timeEpoch: number;
  authorizer: Authorizer;
}

export interface Http {
  method: string;
  path: string;
  protocol: string;
  sourceIp: string;
  userAgent: string;
}


export interface Context {
  callbackWaitsForEmptyEventLoop: boolean;
  functionVersion: string;
  functionName: string;
  memoryLimitInMB: string;
  logGroupName: string;
  logStreamName: string;
  invokedFunctionArn: string;
  awsRequestId: string;
}


export interface Authorizer {
  jwt: {
    claims: {
      aud: string;
      azp: string;
      exp: string;
      iat: string;
      iss: string;
      scope: string;
      sub: string;
    },
    scopes?: any;
  }
}
