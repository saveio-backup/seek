<template>
  <div
    id="import-account"
    class="account-wrap"
  >
    <div class="account-box">
      <h2 class="account-title">Import Account</h2>
      <ul class="account-type ft14">
        <li>
          <a
            :class="{'account-select':importWay == 0}"
            @click="importWay = 0"
          >Keystore File</a>
        </li>
        <li>
          <a
            :class="{'account-select':importWay == 1}"
            @click="importWay = 1"
          >Private Key</a>
        </li>
      </ul>
      <div class="el-form loading textarea">
        <div v-if="importWay == 0">
          <el-form @submit.native.prevent>
            <el-form-item label="Keystore File:">
              <el-input
                type="textarea"
                v-model="data.Wallet"
                cols="30"
                rows="10"
                placeholder="Key"
                class="grey-theme"
              >
              </el-input>
              <div class="tr mb20 input-opeation"><a
                  @click='importWallet'
                  class="light-blue ft14 cursor-pointer cursor-click user-no-select"
                >Select Keystore File</a></div>
            </el-form-item>
            <el-form-item label="Wallet Password:">
              <el-input
                v-model="data.Password"
                placeholder="Input Wallet Password"
                type="password"
                :rows="2"
                class="grey-theme"
                show-password
                @keyup.enter.native='importAccount'
              ></el-input>
            </el-form-item>
          </el-form>
          <!-- <p
					 class="light-blue ft14 cursor-pointer text-right mt10 mb50"
					 @click="importWay = 1"
					>Import the account with the private key(WIF)</p> -->
        </div>
        <div v-if="importWay ==1">
          <el-form
            ref='privatekeyform'
            :model='privateKeyForm'
            :rules='privateKeyRules'
          >
            <el-form-item
              label="PrivateKey"
              prop='PrivateKey'
            >
              <el-input
                v-model="privateKeyForm.PrivateKey"
                placeholder="Input/Import privatekey here"
                class="grey-theme"
              ></el-input>
              <div class="tr"><a
                  @click='importPrivateKey'
                  class="light-blue ft14 cursor-pointer user-no-select cursor-click input-opeation"
                >Select Private Key File</a></div>
            </el-form-item>
            <el-form-item
              label="User Name"
              prop='Label'
            >
              <el-input
                v-model="privateKeyForm.Label"
                placeholder="Input User Name"
                class="grey-theme"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="Wallet Password"
              prop='Password'
            >
              <el-input
                v-model="privateKeyForm.Password"
                placeholder="Input New Wallet Password"
                show-password
                type="password"
                class="grey-theme"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="Confirm Wallet Password"
              prop='Confirm'
            >
              <el-input
                v-model="privateKeyForm.Confirm"
                @keyup.enter.native='importAccount'
                show-password
                type="password"
                class="grey-theme"
                placeholder="Confirm Your Wallet Password"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div>
          <el-button
            @click="importAccount"
            class="import-button account-button"
            type="primary"
          >Import</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const { ipcRenderer } = require("electron");
export default {
  data() {
    let validatePassword = (rule, value, callback) => {
      if (this.privateKeyForm.Password === this.privateKeyForm.Confirm) {
        callback();
      } else {
        callback(new Error("Inconsistent passwords filled in twice"));
      }
    };
    return {
      switchToggle: {
        loading: null
      },
      importWay: 0, // 0 Wallet 1 PrivateKey
      privateKeyForm: {
        PrivateKey: "",
        Label: "",
        Password: "",
        Confirm: ""
      },
      privateKeyRules: {
        PrivateKey: [
          {
            required: true,
            message: "please fill your Private Key",
            trigger: "blur"
          }
        ],
        Label: [
          {
            required: true,
            message: "please fill your name",
            trigger: "blur"
          }
        ],
        Password: {
          // validator: validatePassword,
          message: "please fill your password",
          required: true,
          trigger: ["blur", "input"]
        },
        Confirm: {
          validator: validatePassword,
          required: true,
          trigger: ["blur"]
        }
      },
      data: {
        Wallet: "",
        Password: ""
      }
    };
  },
  methods: {
    importWallet() {
      ipcRenderer.send("open-wallet-dialog");
      ipcRenderer.once("selected-wallet", (event, content) => {
        this.data.Wallet = content;
      });
    },
    importPrivateKey() {
      ipcRenderer.send("open-file-dialog");
      ipcRenderer.once("selected-file", (event, content) => {
        this.privateKeyForm.PrivateKey = content;
      });
    },
    importAccount() {
      switch (this.importWay) {
        case 0:
          this.importAccountWithWalletFile();
          break;
        case 1:
          this.importAccountWithPrivateKey();
        default:
          break;
      }
    },
    importAccountWithWalletFile() {
      if (this.switchToggle.loading) return;
      this.switchToggle.loading = this.$loading({
        lock: true,
        text: "Importing",
        target: ".loading"
      });
      this.$axios
        .post(this.$api.account + "/import/walletfile", this.data)
        .then(res => {
          if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
            const result = res.data.Result;
            for (let key in result) {
              window.localStorage.setItem(key, result[key]);
            }
            window.location.href = location.origin + location.pathname; // success login link to home page
          } else if ((res.data.Error = 50015)) {
            this.switchToggle.loading.close();
            this.switchToggle.loading = null;
            this.$message.error("Account not exit or Wrong Password");
          } else {
            this.switchToggle.loading.close();
            this.switchToggle.loading = null;
            this.$message.error(res.data.Desc);
          }
        })
        .catch(err => {
          this.switchToggle.loading.close();
          this.switchToggle.loading = null;
          this.$message.error("Login Error!");
          console.error(err);
        });
    },
    importAccountWithPrivateKey() {
      if (this.switchToggle.loading) return;
      this.$refs.privatekeyform.validate(valid => {
        if (valid) {
          this.switchToggle.loading = this.$loading({
            lock: true,
            text: "Importing",
            target: ".loading"
          });
          this.$axios
            .post(this.$api.account + "/import/privatekey", this.privateKeyForm)
            .then(res => {
              const data = res.data;
              if (data.Desc === "SUCCESS") {
                const result = res.data.Result;
                for (let key in result) {
                  window.localStorage.setItem(key, result[key]);
                }
                window.location.href = location.origin + location.pathname; // success login link to home page
              } else {
                this.switchToggle.loading.close();
                this.switchToggle.loading = null;
                this.$message.error(data.Desc || "Login Error!");
              }
            })
            .catch(() => {
              this.switchToggle.loading.close();
              this.switchToggle.loading = null;
              this.$message.error("Login Error!");
            });
        }
      });
    }
  }
};
</script>
<style lang="scss">
#import-account {
  margin: 0px auto;
  .account-type {
    width: 500px;
    margin: 0 auto 40px;
    display: flex;
    justify-content: space-around;
    li {
      width: 120px;
      height: 18px;
      a {
        color: rgba(32, 32, 32, 0.4);
        position: relative;
        cursor: pointer;
        user-select: none;
        &:hover {
          opacity: 1;
          color: #2f8ff0;
        }
        &:active {
          opacity: 0.7;
        }
        &::before {
          content: "";
          display: block;
          width: 40px;
          height: 2px;
          background: #2f8ff0;
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          transition: all 0.3s ease;
        }
        &.account-select {
          color: #2f8ff0;
          &::before {
            transform: translateX(-50%) scaleX(1);
          }
        }
      }
    }
  }
  .import-button {
    margin-top: 80px;
  }
  // .el-form .el-input__inner {
  // 	background: #EDEFF4;
  // 	border: 0;
  // 	border-radius: 2px;
  // }
  .el-form textarea {
    padding: 15px;
    font-size: 14px;
    text-align: left;
    height: 130px;
    background: #edeff4;
    border-radius: 2px;
    color: rgba(32, 32, 32, 0.7);
    word-break: break-all;
    border: 0;
    word-break: break-all;
    transition: all 0.3s ease;
    &:focus {
      background: #e0e2e6;
    }
  }
  .input-opeation {
    position: absolute;
    top: -10px;
    right: 0;
  }
}
</style>
