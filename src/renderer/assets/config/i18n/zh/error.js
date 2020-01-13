const result = {
  //The status code of the transmission process
  'uploadLoading': '等待上传',
  'downloadLoading': '等待下载',
  '0':  '',
  '1': '任务暂停',
  '2': '任务开始',
  '3': '正在分片中',
  '4': '分片完成',
  '5': '支付链',
  '6': '支付链完成',
  '7': '提交白名单信息',
  '8': '提交白名单信息完成',
  '9': '查找存储节点',
  '10': '查找存储节点完成',
  '11': '生成PDP证明',
  '12': '开始传输文件块数据',
  '13': '传输文件块数据完成',
  '14': '等待存储节点提交PDP证明',
  '15': '存储节点提交PDP证明完成',
  '16': '将信息注册到DNS节点',
  '17': '注册信息到DNS节点完成',
  '18': '开始下载文件',
  '19': '查找下载节点',
  '20': '文件下载中',
  '21': '下载数据块',
  '22': '数据块接收到',
  '23': '为数据块支付下载费用',
  '24': '完成数据块的下载费用',
  '25': '文件下载完成，提交共享信息到DNS节点',
  '26': '下载任务支付块失败',
  '27': '下载任务校验文件完整性',
  '28': '下载任务校验文件完成性失败',
  '29': '下载任务校验文件完整性完成',
  '30': '任务等待块确认',
  '31': '任务块确认完成',
  '40000': '参数不正确',
  '40001': '内部服务器错误',
  '40002': '参数不完整',
  '40003': '服务不能实例化',
  '40004': '数据库初始化失败',
  '40005': '合约调用失败',
  '40006': '余额不足',
  '40007': '没有匹配的帐户',
  '40008': '帐号已经存在',
  '40009': '有连接的DNS节点',
  '40010': '非法的钱包地址',
  '50000': '链中的内部错误',
  '50001': '获取块高度失败',
  '50002': '获取块失败',
  '50003': '等待交易确认超时',
  '50004': '未知的块',
  '50006': '未知的合约',
  '50007': '未知的合约事件',
  '50008': '位置的资产',
  '50009': '传输失败',
  '50010': '添加白名单失败',
  '50011': '获得PDP证明参数失败',
  '50012': '获取文件块数据异常',
  '50013': '钱包文件不存在',
  '50014': '钱包帐户数据不存在',
  '50015': '密码不正确',
  '50016': '创建帐户失败',
  '50017': '账户导出失败',
  '50018': '获取SessionID失败',
  '50019': '文件下载价格异常',
  '50020': '任务已达上限',
  '50021': '文件信息链上不存在',
  '50022': '下载被拒绝',
  '50023': '主链请求异常',
  '50024': '任务暂停失败',
  '50025': '从数据库获取文件信息失败',
  '50026': '文件Hash未找到',
  '50027': '没有已连接的DNS',
  '50028': '没有可下载的数据源',
  '50029': '从下载节点获取信息失败',
  '50030': '下载前准备Channel失败',
  '50031': '文件信息不存在',
  '50032': '支付未支付的文件块失败',
  '50033': '创建下载文件失败',
  '50034': '获取未下载的文件块失败',
  '50035': '下载文件块失败',
  '50036': '获取文件信息失败',
  '50037': '往文件写数据失败',
  '50038': '往FS节点存文件块失败',
  '50039': '增加请求文件块的任务失败',
  '50040': '解密失败',
  '50041': '文件重命名失败',
  '50042': '下载文件超时',
  '50043': '下载文件被拒绝',
  '50044': '获取文件下载单价失败',
  '50045': '下载任务已存在',
  '50046': '解密密码错误',
  '50047': '删除的文件Hash为空',
  '50048': '没有文件需要删除',
  '50049': '没有权限删除文件',
  '54001': '获取FS合约配置失败',
  '54002': '获取用户空间失败',
  '54003': '获取文件列表失败',
  '54004': '更新用户空间失败',
  '54005': '不能撤销有存储文件的空间',
  '54006': '没有空间可以撤销',
  '54007': '增加的秒数太小',
  '54008': '没有权限更新',
  '54009': '文件上传路径出错',
  '54010': '计算文件费用上传的验证周期太小',
  '54011': '计算文件费用获取文件大小失败',
  '54012': '计算文件费用失败',
  '55000': 'DSP初始化失败',
  '55001': 'DSP启动失败',
  '55002': 'DSP停止失败',
  '55010': '上传文件失败',
  '55011': '用户空间过期',
  '55012': '用户空间不足',
  '55013': '文件的URL已存在',
  '55014': '删除文件失败',
  '55015': '计算上传费用失败',
  '55016': '获取文件链接失败',
  '55017': '文件加密失败',
  '55018': '文件解密失败',
  '55019': '白名单操作失败',
  '55020': '获取白名单失败',
  '55021': '更新系统配置失败',
  '55022': '文件已上传',
  '55023': '暂停上传失败',
  '55024': '继续上传失败',
  '55025': '重试上传失败',
  '55026': '暂停下载失败',
  '55027': '继续下载失败',
  '55028': '重试下载失败',
  '55029': '取消任务失败',
  '55030': '节点注册失败',
  '55031': '节点注销失败',
  '55032': '节点更新失败',
  '55033': '节点提现失败',
  '55034': '节点查询失败',
  '55040': 'URL注册失败',
  '55041': 'URL绑定失败',
  '55050': 'DNS节点注册失败',
  '55051': 'DNS节点注销失败',
  '55052': 'DNS节点更新失败',
  '55053': 'DNS节点提现失败',
  '55054': 'DNS节点退出失败',
  '55055': 'DNS节点添加抵押失败',
  '55056': 'DNS节点减少抵押失败',
  '55057': '查询DNS节点失败',
  '55058': '查询所有DNS节点信息失败',
  '55059': '查询单个DNS节点信息失败',
  '55060': '查询所有DNS节点信息失败',
  '55061': '查询DNS节点获取IP信息失败',
  '55062': '用户空间剩余时间不够',
  '55063': '上传设置的存储时间不够',
  '55100': '链上查不到文件信息',
  '55101': '文件不存在',
  '55102': '解密密码错误',
  '56000': '通道内部错误',
  '56001': '开启通道失败',
  '56002': '关闭通道失败',
  '56003': '查询通道可用余额失败',
  '56004': '通道充值失败',
  '56005': '通道提现失败',
  '56006': '通道提现金额错误',
  '56007': '获取所有通道失败',
  '56008': '路由支付失败',
  '56009': '合作关闭失败',
  '56010': '通道实例化未完成',
  '56011': '通道已存在',
  '56012': '没有连接DNS节点，无法下载',
  '56013': 'DNS节点余额不足，无法下载',
  '56014': '通道提现金额有误',
  '56015': '通道正在同步区块',
  '56016': 'DSP通道在DNS上打开',
  '58000': '操作的任务不存在',
  '59000': '数据库查询分享收益失败',
  '59001': '数据库统计分享收益失败',
  '59002': '数据库查询调整空间记录失败',
  '59003': '数据库添加调整空间记录失败',
  '59004': '获取文件信息失败',
  '59100': '重连节点失败',
  '59101': '网络代理断开连接'
}
export default result;