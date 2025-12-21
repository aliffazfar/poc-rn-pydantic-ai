import {ApiConfig, AppConfig} from '../config';

export const APP_NAME = AppConfig.name;
export const APP_DESCRIPTION = AppConfig.description;
export const CURRENCY = AppConfig.currency;
export const API_BASE_URL = ApiConfig.baseUrl;

export const BANKING_ACTIONS = {
  CONFIRM_TRANSFER: 'confirm_transfer',
  CANCEL_TRANSFER: 'cancel_transfer',
  EDIT_TRANSFER: 'edit_transfer',
} as const;