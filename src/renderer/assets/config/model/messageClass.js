import errorCode from './../i18n/error.js';
import { Message } from "element-ui";

class MessageClass {
  constructor() {
    this.messageinstace = {}
  }
  
  message(response) {
    if(response.config && response.config.message) {
            
    } else {
      if(response.data.Error === 0) {
        return;
      } else {
        this.messageError(response);
        return;
      }
    }
  }

  messageError(response) {
    Message.error({
      message: response.data.Error && errorCode[response.data.Error] && errorCode[response.data.Error]['en'] || response.data.Desc || ''
    })
  }
}
export default new MessageClass();