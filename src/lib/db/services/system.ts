import { systemSettings, type SystemSettingsSchemaType } from '../schemas';
import { SingletonDB } from './base';

export const SystemService = new SingletonDB<SystemSettingsSchemaType>(
    systemSettings,
);