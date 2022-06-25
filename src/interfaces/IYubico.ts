import { SL } from '../types';

export interface IYubico {
  clientId?: string;
  secretKey?: string;
  sl?: SL;
  timeout?: number;
  apiServers?: string[];
}
