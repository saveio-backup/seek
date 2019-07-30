const result = {
  //The status code of the transmission process
  '0': {
    'en': ''
  },
  '1': {
    'en': 'Task Pause'
  },
  '2': {
    'en': 'Task continue'
  },
  '3': {
    'en': 'Start Sharding'
  },
  '4': {
    'en': 'Sharding to Complete'
  },
  '5': {
    'en': 'Pay on the Chain'
  },
  '6': {
    'en': 'The Payment Chain is Complete'
  },
  '7': {
    'en': 'Submit Whitelist Information'
  },
  '8': {
    'en': 'Submit Whitelist Information Completed'
  },
  '9': {
    'en': 'Find Storage Node'
  },
  '10': {
    'en': 'Find the Storage Node to Complete'
  },
  '11': {
    'en': 'Generate PDP Proof Data'
  },
  '12': {
    'en': 'Start Transferring File Block Data'
  },
  '13': {
    'en': 'Transfer File Block Data Complete'
  },
  '14': {
    'en': 'Wait for the Storage Node to Submit the PDP Proof'
  },
  '15': {
    'en': 'Storage Node Submits PDP Proof Complete'
  },
  '16': {
    'en': 'Register Information to DNS Node'
  },
  '17': {
    'en': 'Register Information to DNS Node Complete'
  },
  '18': {
    'en': ''
  },
  '19': {
    'en': ''
  },
  '20': {
    'en': ''
  },
  '40000': {
    'en': 'Incorrect parameter'
  },
  '40001': {
    'en': 'Internal server error'
  },
  '40002': {
    'en': 'Incorrect parameter (missing)'
  },
  '40003': {
    'en': 'Service not instantiated'
  },
  '40004': {
    'en': 'Database initialization failed'
  },
  '40005': {
    'en': 'Contract call failed'
  },
  '40006': {
    'en': 'Insufficient balance'
  },
  '40007': {
    'en': 'No matching account'
  },
  '40008': {
    'en': 'Account already exists'
  },
  '50000': {
    'en': 'Internal error in the chain'
  },
  '50001': {
    'en': 'Get current height failed'
  },
  '50002': {
    'en': 'Failed to get the block'
  },
  '50003': {
    'en': 'Waiting for transaction confirmation timeout'
  },
  '50004': {
    'en': 'Unknown block'
  },
  '50005': {
    'en': 'Unknown transaction'
  },
  '50006': {
    'en': 'Unknown contract'
  },
  '50007': {
    'en': 'Unknown contract event'
  },
  '50008': {
    'en': 'Unknown asset'
  },
  '50009': {
    'en': 'Transfer failed'
  },
  '50010': {
    'en': 'Failed to add whitelist'
  },
  '50011': {
    'en': 'Failed to obtain PDP proof parameter'
  },
  '50012': {
    'en': 'Gets a file block data exception'
  },
  '50013': {
    'en': 'Wallet file does not exist'
  },
  '50014': {
    'en': 'Wallet account data does not exist'
  },
  '50015': {
    'en': 'Incorrect password'
  },
  '50016': {
    'en': 'Failed to create account'
  },
  '50017': {
    'en': 'Account export failed'
  },
  '50018': {
    'en': 'Failed to get SessionID'
  },
  '50019': {
    'en': 'File download price is abnormal'
  },
  '50020': {
    'en': 'The mission has reached its limit'
  },
  '50021': {
    'en': 'Not found on file info chain'
  },
  '50022': {
    'en': 'Download denied'
  },
  '50023': {
    'en': 'The main chain requests an exception'
  },
  '50024': {
    'en': 'Task pause failed'
  },
  '54001': {
    'en': 'Failed to get FS contract configuration'
  },
  '54002': {
    'en': 'Failed to get user space'
  },
  '54003': {
    'en': 'Failed to get file list'
  },
  '54004': {
    'en': 'Update user space failed'
  },
  '54005': {
    'en': 'Cannot undo space with stored files'
  },
  '54006': {
    'en': 'No space to revoke'
  },
  '54007': {
    'en': 'The number of seconds added is too small'
  },
  '54008': {
    'en': 'No permission to update'
  },
  '55000': {
    'en': 'DSP initialization failed'
  },
  '55001': {
    'en': 'DSP startup failed'
  },
  '55002': {
    'en': 'DSP stop failed'
  },
  '55010': {
    'en': 'Upload file failed'
  },
  '55011': {
    'en': 'User space expired'
  },
  '55012': {
    'en': 'Lack of user space'
  },
  '55013': {
    'en': 'The URL of the file already exists'
  },
  '55014': {
    'en': 'Failed to delete file'
  },
  '55015': {
    'en': 'Failed to calculate upload cost'
  },
  '55016': {
    'en': 'Failed to get file link'
  },
  '55017': {
    'en': 'File encryption failed'
  },
  '55018': {
    'en': 'File decryption failed'
  },
  '55019': {
    'en': 'Whitelist operation failed'
  },
  '55020': {
    'en': 'Failed to get whitelist'
  },
  '55021': {
    'en': 'Update system configuration failed'
  },
  '55022': {
    'en': 'Upload file already'
  },
  '55023': {
    'en': 'Upload pause failed'
  },
  '55024': {
    'en': 'Continue upload failed'
  },
  '55025': {
    'en': 'Retry upload failed'
  },
  '55026': {
    'en': 'Download pause failed'
  },
  '55027': {
    'en': 'Continue download failed'
  },
  '55028': {
    'en': 'Retry download failed'
  },
  '55030': {
    'en': 'Node registration failed'
  },
  '55031': {
    'en': 'Node logout failed'
  },
  '55032': {
    'en': 'Node update failed'
  },
  '55033': {
    'en': 'Node withdrawal failed'
  },
  '55034': {
    'en': 'Node query failed'
  },
  '55040': {
    'en': 'URL registration failed'
  },
  '55041': {
    'en': 'URL binding failed'
  },
  '55050': {
    'en': 'DNS node registration failed'
  },
  '55051': {
    'en': 'DNS node logout failed'
  },
  '55052': {
    'en': 'DNS node update failed'
  },
  '55053': {
    'en': 'DNS node withdrawal failed'
  },
  '55054': {
    'en': 'DNS node exit failed'
  },
  '55055': {
    'en': 'DNS node added mortgage failed'
  },
  '55056': {
    'en': 'DNS node reduces mortgage failure'
  },
  '55057': {
    'en': 'Querying DNS node failed'
  },
  '55058': {
    'en': 'Querying all DNS node information failed'
  },
  '55059': {
    'en': 'Querying a single DNS node failed'
  },
  '55060': {
    'en': 'Querying all DNS node information failed'
  },
  '55061': {
    'en': 'Querying DNS node get ip infomation failed'
  },
  '55062': {
    'en': 'There is not enough time in user space'
  },
  '56000': {
    'en': 'Channel internal error'
  },
  '56001': {
    'en': 'Failed to open channel'
  },
  '56002': {
    'en': 'Closing the channel failed'
  },
  '56003': {
    'en': 'Query channel available balance failed'
  },
  '56004': {
    'en': 'Channel recharge failed'
  },
  '56005': {
    'en': 'Channel withdrawal failed'
  },
  '56006': {
    'en': 'Channel cash amount error'
  },
  '56007': {
    'en': 'Failed to get all channels'
  },
  '56008': {
    'en': 'Route payment failed'
  },
  '56009': {
    'en': 'Cooperation closure failed'
  },
  '56010': {
    'en': 'Channel instantiation is not complete'
  },
  '56011': {
    'en': 'Channel already exists'
  },
  '56012': {
    'en': 'Unable to download without connecting DNS node'
  },
  '56013': {
    'en': 'Dns node no enough,not allow download'
  },
  '56014': {
    'en': 'Channel withdrawal amount is wrong'
  },
  '56015': {
    'en': 'Channel is synchronizing blocks'
  },
  '58000': {
    'en': 'Task for operation does not exist'
  },
  '59000': {
    'en': 'Database query sharing revenue failed'
  },
  '59001': {
    'en': 'Database statistics share revenue failed'
  },
  '59002': {
    'en': 'Database query fails to adjust space record'
  },
  '59003': {
    'en': 'Database added adjustment space record failed'
  },
}
module.exports = result;