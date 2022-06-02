export type MessageData = {
  type:
    | 'delete-rows'
    | 'insert-simple'
    | 'insert-corrupted'
    | 'insert-transaction'
    | 'insert-corrupted-transaction'
    | 'nested-transaction'
    | 'reset'
    | 'select';
  payload: any;
};

export type ResponseMessage = {
  type: 'success' | 'error';
  actionType: MessageData['type'];
  payload: any;
};
