import {logger} from '../lib/logger';

interface UseToolCallActionsOptions {
  sendMessage: (text: string) => Promise<void>;
}

export function useToolCallActions({sendMessage}: UseToolCallActionsOptions) {
  function handleTransferApprove(args: Record<string, unknown>) {
    logger.info('Transfer approved', args);
    sendMessage('Yes, proceed with the transfer.');
  }

  function handleTransferDecline() {
    logger.info('Transfer declined');
    sendMessage('No, cancel the transfer.');
  }

  function handleTransferEdit() {
    logger.info('Transfer edit requested');
    sendMessage('I need to edit the transfer details.');
  }

  function handleBillPaymentApprove(args: Record<string, unknown>) {
    logger.info('Bill payment approved', args);
    sendMessage('Yes, proceed with the bill payment.');
  }

  function handleBillPaymentDecline() {
    logger.info('Bill payment declined');
    sendMessage('No, cancel the bill payment.');
  }

  return {
    handleTransferApprove,
    handleTransferDecline,
    handleTransferEdit,
    handleBillPaymentApprove,
    handleBillPaymentDecline,
  };
}
