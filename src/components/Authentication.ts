import { Http, HttpResponse } from '@capacitor-community/http';
import JSEncrypt from 'jsencrypt';

import { ShowSnack } from './App'

import config from '../config.json'

export default function authenticate(
  showSnack: ShowSnack,
  onSuccess: () => void,
  addLog: (s: string) => void
) {
  function reportError(error: any) {
    showSnack(error.toString(), 'error');
  }
  const idInitUrl = 'https://id.tsinghua.edu.cn/do/off/ui/auth/login/form/03a68a36239ff85fe2b1007aeb322549/0'
  const idCheckUrl = 'https://id.tsinghua.edu.cn/do/off/ui/auth/login/check'
  const iptvTicketUrl = 'https://iptv.tsinghua.edu.cn/thauth/roam.php'
  // get password
  Http.get({ url: config.passwordCipherUrl })
    .then(gotPassword).catch(reportError);
  function gotPassword(response: HttpResponse) {
    const passwordCipher: string = response.data;
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(config.privateKey);  // base64 private key
    const password = decrypt.decrypt(passwordCipher);  // RSA/ECB/PKCS1Padding
    if (password === false) {
      showSnack('Password cipher not valid', 'error');
      return;
    }
    // acquire session cookie of id.tsinghua.edu.cn
    Http.get({ url: idInitUrl })
      .then(response => initedID(password)).catch(reportError);
  }
  function initedID(password: string) {
    // get ticket
    Http.post({
      url: idCheckUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: {
        i_user: config.userID,
        i_pass: password,
        i_captcha: ''
      }
    }).then(gotTicket).catch(reportError);
  }
  function gotTicket(response: HttpResponse) {
    const message: string = response.data;
    const match = message.match(/ticket=(.*?)"/);
    if (!match) {
      showSnack('Ticket not found', 'error');
      return;
    }
    const ticket = match[1];
    // acquire cookie of iptv.tsinghua.edu.cn
    Http.get({
      url: iptvTicketUrl,
      params: { ticket: ticket }
    }).then(gotCookie).catch(reportError);
  }
  function gotCookie(response: HttpResponse) {
    const message: string = response.data;
    if (message.search('失败') !== -1) {
      showSnack('Ticket not valid: ' + message, 'error');
    }
    // succeeded
    onSuccess();
    showSnack('Authentication succeeded', 'success');
  }

}