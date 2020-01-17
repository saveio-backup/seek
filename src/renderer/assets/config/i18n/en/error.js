const result = {
  //The status code of the transmission process
  'uploadLoading': 'Wait for the Upload',
  'downloadLoading': 'Wait for the Download',
  'uploadTimeout': 'Upload file timeout!',
  '0':  '',
  '1': 'Task Pause',
  '2': 'Task Start',
  '3': 'Start Sharding',
  '4': 'Sharding to Complete',
  '5': 'Pay on the Chain',
  '6': 'The Payment Chain is Complete',
  '7': 'Submit Whitelist Information',
  '8': 'Submit Whitelist Information Completed',
  '9': 'Find Storage Node',
  '10': 'Find the Storage Node to Complete',
  '11': 'Generate PDP Proof Data',
  '12': 'Start transfering file block data',
  '13': 'Transfer File Block Data Complete',
  '14': 'Wait for the Storage Node to Submit the PDP Proof',
  '15': 'Storage Node Submits PDP Proof Complete',
  '16': 'Register Information to DNS Node',
  '17': 'Register Information to DNS Node Complete',
  '18': 'Start downloading files',
  '19': 'Find nodes for download',
  '20': 'File download in progress',
  '21': 'Download data block',
  '22': 'Data block received',
  '23': 'Pay download fees for blocks of data',
  '24': 'Complete the download fee for the data block',
  '25': 'File download complete, submit sharing information to DNS node',
  '26': 'Task download pay for blocks failed',
  '27': 'Task download checking file',
  '28': 'Task download checking file failed',
  '29': 'Task download checking file done',
  '30': 'Task wait for block confirmed',
  '31': 'Task wait for block confirmed done',
  '40000': 'Incorrect parameter',
  '40001': 'Internal server error',
  '40002': 'Incorrect parameter (missing)',
  '40003': 'Service not instantiated',
  '40004': 'Database initialization failed',
  '40005': 'Contract call failed',
  '40006': 'Insufficient balance',
  '40007': 'No matching account',
  '40008': 'Account already exists',
  '40009': 'There are connected DNS nodes',
  '40010': 'Illegal wallet address',
  '50000': 'Internal error in the chain',
  '50001': 'Get current height failed',
  '50002': 'Failed to get the block',
  '50003': 'Waiting for transaction confirmation timeout',
  '50004': 'Unknown block',
  '50006': 'Unknown contract',
  '50007': 'Unknown contract event',
  '50008': 'Unknown asset',
  '50009': 'Transfer failed',
  '50010': 'Failed to add whitelist',
  '50011': 'Failed to obtain PDP proof parameter',
  '50012': 'Gets a file block data exception',
  '50013': 'Wallet file does not exist',
  '50014': 'Wallet account data does not exist',
  '50015': 'Incorrect password',
  '50016': 'Failed to create account',
  '50017': 'Account export failed',
  '50018': 'Failed to get SessionID',
  '50019': 'File download price is abnormal',
  '50020': 'The mission has reached its limit',
  '50021': 'Not found on file info chain',
  '50022': 'Download denied',
  '50023': 'The main chain requests an exception',
  '50024': 'Task pause failed',
  '50025': 'Failed to retrieve file information from database',
  '50026': 'File Hash not found',
  '50027': 'No DNS connected',
  '50028': 'There is no downloadable data source',
  '50029': 'Failed to obtain information from download node',
  '50030': 'Prepare Channel failed before download',
  '50031': 'File information does not exist',
  '50032': 'Failed to pay for unpaid file blocks',
  '50033': 'Failed to create download file',
  '50034': 'Failed to obtain undownloaded file block',
  '50035': 'Failed to download file block',
  '50036': 'Failed to retrieve file information',
  '50037': 'Failed to write data to file',
  '50038': 'Failed to save block to FS',
  '50039': 'Failed to add request file block',
  '50040': 'Decryption failure',
  '50041': 'File rename failed',
  '50042': 'Download file timeout',
  '50043': 'download file resused',
  '50044': 'Failed to obtain file download price',
  '50045': 'The download task already exists',
  '50046': 'Password decryption error',
  '50047': 'The deleted file Hash is empty',
  '50048': 'No files need to be deleted',
  '50049': 'No permission to delete files',
  '54001': 'Failed to get FS contract configuration',
  '54002': 'Failed to get user space',
  '54003': 'Failed to get file list',
  '54004': 'Update user space failed',
  '54005': 'Cannot undo space with stored files',
  '54006': 'No space to revoke',
  '54007': 'The number of seconds added is too small',
  '54008': 'No permission to update',
  '54009': 'File upload path error',
  '54010': 'The validation period for calculating file charges for uploading is too small',
  '54011': 'Failed to calculate file cost to get file size',
  '54012': 'Failed to calculate file cost',
  '55000': 'DSP initialization failed',
  '55001': 'DSP startup failed',
  '55002': 'DSP stop failed',
  '55010': 'Upload file failed',
  '55011': 'User space expired',
  '55012': 'Lack of user space',
  '55013': 'The URL of the file already exists',
  '55014': 'Failed to delete file',
  '55015': 'Failed to calculate upload cost',
  '55016': 'Failed to get file link',
  '55017': 'File encryption failed',
  '55018': 'File decryption failed',
  '55019': 'Whitelist operation failed',
  '55020': 'Failed to get whitelist',
  '55021': 'Update system configuration failed',
  '55022': 'Upload file already exists',
  '55023': 'Upload pause failed',
  '55024': 'Start upload failed',
  '55025': 'Retry upload failed',
  '55026': 'Download pause failed',
  '55027': 'Start download failed',
  '55028': 'Retry download failed',
  '55029': 'Failed to cancel task',
  '55030': 'Node registration failed',
  '55031': 'Node logout failed',
  '55032': 'Node update failed',
  '55033': 'Node withdrawal failed',
  '55034': 'Node query failed',
  '55040': 'URL registration failed',
  '55041': 'URL binding failed',
  '55050': 'DNS node registration failed',
  '55051': 'DNS node logout failed',
  '55052': 'DNS node update failed',
  '55053': 'DNS node withdrawal failed',
  '55054': 'DNS node exit failed',
  '55055': 'DNS node added mortgage failed',
  '55056': 'DNS node reduces mortgage failure',
  '55057': 'Querying DNS node failed',
  '55058': 'Querying all DNS node information failed',
  '55059': 'Querying a single DNS node failed',
  '55060': 'Querying all DNS node information failed',
  '55061': 'Querying DNS node get ip infomation failed',
  '55062': 'There is not enough time in user space',
  '55063': 'Insufficient storage time for upload Settings',
  '55100': 'No file information found on the chain',
  '55101': 'File does not exist',
  '55102': 'Password decryption error',
  '56000': 'Channel internal error',
  '56001': 'Failed to open channel',
  '56002': 'Closing the channel failed',
  '56003': 'Query channel available balance failed',
  '56004': 'Channel recharge failed',
  '56005': 'Channel withdrawal failed',
  '56006': 'Channel cash amount error',
  '56007': 'Failed to get all channels',
  '56008': 'Route payment failed',
  '56009': 'Cooperation closure failed',
  '56010': 'Channel instantiation is not complete',
  '56011': 'Channel already exists',
  '56012': 'Unable to download without connecting DNS node',
  '56013': 'Dns node no enough,not allow download',
  '56014': 'Channel withdrawal amount is wrong',
  '56015': 'Channel is synchronizing blocks',
  '56016': 'DSP channel open to on dns',
  '58000': 'Task for operation does not exist',
  '59000': 'Database query sharing revenue failed',
  '59001': 'Database statistics share revenue failed',
  '59002': 'Database query fails to adjust space record',
  '59003': 'Database added adjustment space record failed',
  '59004': 'Failed to retrieve file information',
  '59100': 'Reconnect node failed',
  '59101': 'Net proxy disconnected'
}
export default result;