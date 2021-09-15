// Assign fetch function for nodejs imports
// This allows CogSourceUrl to be used without configuration inside nodejs environments
import fetch from 'node-fetch';
import { SourceHttp } from './http.source.js';

SourceHttp.fetch = fetch as any;

export { SourceHttp } from './http.source.js';
export { FsHttp } from './http.fs.js';
