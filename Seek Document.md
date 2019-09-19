
## Seek 类

#### seek.getAccount
> 返回 <Object> seek 账户信息

#### seek.invokeNativeContract(data,callback)
> 进行合约交易
- data  *<JsonString>* 交易信息
   - 格式化成 JSON 字符串后作为 data 的值

    - 需要传递的 JsonString 包含字段
        - Contract *<String>* 合约地址
        - Method *<String>*
        - Params *<Array>* 
        - GasPrice *<Number>* 
        - GasLimit *<Number>*
- callback *<Function>* 回调函数
    - txid *<String>* 交易成功后 执行回调 callback(txid)
    
#### seek.openComponent(path)
> 打开新 tab,并跳转到对应 seek page 
- path *<String>* Seek 页面 path

#### seek.preExecNativeContract(data)
> 获取合约信息
- data  *<JsonString>* 交易信息
    - 格式化成 JSON 字符串后作为 data 的值

    - 需要传递的 JsonString 包含的字段:
        - Contract *<String>* 合约地址
        - Method *<String>*
        - Params *<Array>* 