<template>
  <div id="expand">
    <div class="content">
      <div class="space-header">
        <div class="space-progress">
          <div class="theme-font-blue bold mb10 ft14 user-no-select">Used: {{util.bytesToSize(space.Used * 1024)}} / {{util.bytesToSize((space.Used + space.Remain) *1024)}}</div>
          <el-progress
            :stroke-width="30"
            :percentage="takeSpace"
          ></el-progress>
        </div>
        <el-button
          ref='getspace'
          @click="openExpandDialog"
        >Storage</el-button>
      </div>
      <p class="theme-font-blue bold mt40 mb10 ft14 user-no-select">Space Adjust Record</p>
      <div class="space-record">
        <el-table
          :data='Records'
          border
          ref='recordTable'
          empty-text='No Data'
          height='100%'
        >
          <el-table-column label='Size'>
            <template slot-scope="scope">
              <div>
                {{util.bytesToSize(scope.row.Size * 1024)}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label='Expired At'>
            <template slot-scope="scope">
              <div>
                {{ $dateFormat.formatTimeByTimestamp(scope.row.ExpiredAt * 1000)}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label='Cost'>
            <template slot-scope="scope">
              <div>
                <div>
                  {{parseFloat(scope.row.CostFormat)}} SAVE
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-dialog
        center
        width='600px'
        :close-on-click-modal='false'
        :visible.sync="expandDialogVisible"
      >
        <div slot="title">
          <h2>Storage</h2>
          <div class="dialog-title-border"></div>
        </div>
        <div class="loading-content">
          <div class="adjust">
            <div class="adjust-item">
              <div class="adjust-title bold ft14 tl theme-font-blue-40">Space Size:</div>
            </div>
            <!-- <h3 class="theme-font-blue transparent bold ft12">Space Size:</h3> -->
            <div class="adjust-item">
              <p class="adjust-title theme-font-blue ft14">Current:</p>
              <div class="adjust-info">
                <p class="theme-font-blue ft14 mr20">{{util.bytesToSize( (space.Used + space.Remain)*1024)}}</p>
                <p class="theme-font-blue-40 ft14 ml20">{{util.bytesToSize(space.Used *1024)}} / {{util.bytesToSize( (space.Used + space.Remain)*1024)}}</p>
              </div>
            </div>
            <div class="adjust-item">
              <div class="adjust-title theme-font-blue ft14">Adjust to:</div>
              <div class="adjust-info">
                <el-input-number
                ref="spaceNumberInput"
                  class="number grey-theme"
                  v-model="adjustSize"
                  :precision='0'
                  :min='minSize'
                  @focus="$refs.spaceNumberInput.select()"
                  @blur="userSpaceCost"
                ></el-input-number>
                <!-- @change="setSizeValue" -->
                <el-select
                  class="sizeunit"
                  @change="userSpaceCost"
                  v-model="sizeUnit"
                >
                  <el-option
                    label="MB"
                    :value="sizeRange['MB']"
                  >

                  </el-option>
                  <el-option
                    label="GB"
                    :value="sizeRange['GB']"
                  ></el-option>
                </el-select>
              </div>
            </div>
          </div>
          <div class="adjust">
            <div class="adjust-item">
              <div class="adjust-title  theme-font-blue-40 bold ft14 tl">Space Date:</div>
            </div>
            <div class="adjust-item">
              <p class="adjust-title theme-font-blue ft14">Expiry Date:</p>
              <div class="adjust-info">
                <p class="theme-font-blue">{{expired_old}}</p>
              </div>
            </div>
            <div class="adjust-item">
              <div class="adjust-title theme-font-blue ft14">Adjust to:</div>
              <div class="adjust-info">
                <el-date-picker
                  v-model="expired"
                  @change='setDateValue'
                  :picker-options="pickerOptions"
                  type="date"
                  placeholder="Choose Date"
                >
                </el-date-picker>
              </div>
            </div>
          </div>
          <div class="adjust">
            <div class="adjust-item">
              <p class="adjust-title theme-font-blue ft14">{{cost.TransferType === 2?'Pledge Refund':'Pledge Payment'}}:</p>
              <div class="adjust-info theme-font-blue ft14">
                <div v-if="cost.TransferType !== 2">
                  {{cost.FeeFormat?parseFloat(parseFloat(cost.FeeFormat).toFixed(3)):0}} SAVE
                </div>
                <div v-if="cost.TransferType === 2">
                  {{cost.RefundFormat?parseFloat(parseFloat(cost.RefundFormat).toFixed(3)):0}} SAVE
                </div>
              </div>
            </div>
            <div class="adjust-item">
              <p class="adjust-title theme-font-blue ft14"></p>
              <div class="adjust-info theme-font-blue-40 ft14">
                <span class="mr10">Available</span> {{mainCount?parseFloat(mainCount).toFixed(3):0}} SAVE
              </div>
            </div>
          </div>
          <div class="adjust">
            <div class="adjust-item">
              <div class="adjust-title theme-font-blue ft14">Wallet Password:</div>
              <div class="adjust-info theme-font-blue-40 ft14 mr20">
                <el-input
                  v-model="Password"
                  @keyup.enter.native='setUserSpace'
                  placeholder="Please Input Wallet Password"
                  class="grey-theme"
                  show-password
                  type="password"
                ></el-input>
              </div>
            </div>
          </div>
          <div slot="footer">
            <el-button @click="expandDialogVisible = false">Cancel</el-button>
            <el-button
              type="primary"
              class="primary"
              @click="setUserSpace"
            >Update</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import util from "../../../assets/config/util";
const _NOW = new Date();
// const nextDay = new Date(now.setDate(now.getDate() + 1));
// nextDay.setHours(23);
// nextDay.setMinutes(59);
// nextDay.setSeconds(59);
export default {
  mounted() {
    this.hasUploadedFile();
    this.getUserSpaceRecords();
    // getUserSpaceRecords
    let element = this.$refs.recordTable.bodyWrapper;
    this.addListenScroll(element, 100, this.getUserSpaceRecords);
  },
  data() {
    // const expired =
    // 	this.$dateFormat.formatTimeByTimestamp(
    // 		this.$store.state.Filemanager.space.ExpiredAt * 1000
    // 	) || this.$dateFormat.formatTimeByTimestamp(now.getTime());
    return {
      util,
      sizeUnit: 1048576,
      sizeRange: {
        MB: 1024,
        GB: 1048576
      },
      Password: "",
      adjustSize: 1,
      switchToggle: { loadSwitch: true, loading: "" },
      submitToggle: true, // commit toggle
      expired: "",
      isUploadedFile: true, // has user uploaded file in save
      pickerOptions: {
        disabledDate: date => {
          // (this.space.ExpiredAt * 1000)
          const now = new Date().getTime();
          if (this.isUploadedFile) {
            return (
              date.getTime() + 86399000 - this.space.ExpiredAt * 1000 <= 0 ||
              date.getTime() + 86399000 - now <= 0
            );
          } else {
            return date.getTime() + 86399000 - now <= 0;
          }
        }
      },
      addInfo: {
        Addr: window.localStorage.getItem("Address"),
        Size: {
          Type: 0,
          Value: "1"
        },
        Second: {
          Type: 0,
          Value: "0"
        }
      },
      cost: {},
      expandDialogVisible: false,
      Records: [],
      limit: 20,
      mockRecords: [
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        },
        {
          Size: 20480,
          ExpiredAt: 1558600673,
          Cost: 276480027
        },
        {
          Size: 10240,
          ExpiredAt: 1558597073,
          Cost: 110592036
        }
      ]
    };
  },
  watch: {
    expandDialogVisible: function() {
      // update adjustSize when open dialog
      this.adjustSize = Math.ceil(
        (this.space.Remain + this.space.Used) / this.sizeUnit
      );
    },
    sizeUnit: function() {
      console.log("Watch sizeUnit!!!");
      if (this.isUploadedFile) {
        this.adjustSize = Math.max(
          this.minSize,
          Math.ceil((this.space.Remain + this.space.Used) / this.sizeUnit)
        );
        this.userSpaceCost();
      }
    }
  },
  computed: {
    minSize() {
      if (this.isUploadedFile) {
        return Math.ceil((this.space.Remain + this.space.Used) / this.sizeUnit);
      } else {
        return 0;
      }
    },
    expired_old() {
      if (this.$store.state.Filemanager.space.ExpiredAt) {
        this.expired = new Date(
          this.$store.state.Filemanager.space.ExpiredAt * 1000
        );
      } else {
        this.expired = new Date(_NOW.getTime());
      }
      return (
        this.$dateFormat.formatTimeByTimestamp(
          this.$store.state.Filemanager.space.ExpiredAt * 1000
        ) || this.$dateFormat.formatTimeByTimestamp(_NOW)
      );
    },
    space() {
      return this.$store.state.Filemanager.space;
    },
    takeSpace: function() {
      if (this.space.Used > 0) {
        return Math.max(
          0.5,
          (this.space.Used / (this.space.Remain + this.space.Used)) * 100
        );
      } else {
        return 0;
      }
    },
    mainCount: function() {
      return this.$store.state.Wallet.mainCount;
    }
  },
  methods: {
    async hasUploadedFile() {
      let addr = this.$api.getFileList + "0/0/0";
      let result = await this.$axios.get(addr);
      let data = result.data;
      if (data.Error === 0 && data.Result.length) {
        this.isUploadedFile = true;
      } else {
        this.isUploadedFile = false;
      }
    },
    addListenScroll(element, distance, callback) {
      element.addEventListener("scroll", function() {
        /* 				console.log(`element.scrollTop is: ${element.scrollTop},
				element.clientHeight is ${element.clientHeight},
				distance is ${distance},
				element.scrollHeight is ${element.scrollHeight}
				`); */
        if (
          element.scrollTop + element.clientHeight + distance >=
          element.scrollHeight
        ) {
          console.log("scroll Toggle");
          callback();
        }
      });
    },
    getUserSpaceRecords(amount) {
      if (!this.switchToggle.loadSwitch && !amount) return;
      this.switchToggle.loadSwitch = false;
      let addr = null;
      if (amount) {
        addr =
          this.$api.userspacerecords +
          localStorage.getItem("Address") +
          "/0/" +
          amount;
      } else {
        addr =
          this.$api.userspacerecords +
          localStorage.getItem("Address") +
          "/" +
          this.Records.length +
          "/" +
          this.limit;
      }
      this.$axios(addr)
        .then(res => {
          if (res.data.Error === 0) {
            if (res.data.Result.Records.length > 0) {
              if (amount) {
                this.Records = res.data.Result.Records;
                this.switchToggle.loadSwitch = true;
              } else {
                this.Records = this.Records.concat(res.data.Result.Records);
                this.switchToggle.loadSwitch = true;
              }
              return;
            } else {
              this.switchToggle.loadSwitch = false;
              return;
            }
          } else {
            this.switchToggle.loadSwitch = true;
            return;
          }
        })
        .catch(err => {
          console.error(err);
          this.switchToggle.loadSwitch = true;
        });
    },
    openExpandDialog() {
      this.Password = "";
      this.expandDialogVisible = true;
    },
    setUserSpaceCheckRes() {
      if (this.Password.length === 0) {
        this.$message("Please input wallet password");
        return false;
      }
      return true;
    },
    setUserSpace() {
      if (!this.submitToggle) return;
      const checkRes = this.setUserSpaceCheckRes();
      if (!checkRes) return;
      this.submitToggle = false;
      this.switchToggle.loading = this.$loading({
        lock: true,
        text: "Upgrading",
        target: ".loading-content"
      });
      this.setDateValue(this.expired, "fixed");
      this.setSizeValue();
      // const addr = this.addInfo.Second.Value >= 0 ? "add" : "revoke";
      this.$axios
        .post(this.$api.userspace + "set", {
          Addr: this.addInfo.Addr,
          Second: {
            Value: Math.abs(this.addInfo.Second.Value),
            Type: this.addInfo.Second.Type
          },
          Size: {
            Value: Math.abs(this.addInfo.Size.Value),
            Type: this.addInfo.Size.Type
          },
          Password: this.Password
        })
        .then(res => {
          if (res.data.Error === 0) {
            this.expandDialogVisible = false;
            this.$message({
              message: "Adjust Successed!",
              type: "success"
            });
            this.$store.dispatch("setSpace");
            this.getUserSpaceRecords(this.Records.length + 1);
            this.setDateValue(); // no param  rest date.Type = 0
            this.cost = {};
          } else if (res.data.Error === 50015) {
            this.$message({
              message: "The password is incorrect.",
              type: "error"
            });
          } else {
            this.$message({
              message: `Error: ${res.data.Error}, Adjust Error, please check your expiry date or wallet.`,
              type: "error"
            });
          }
          this.submitToggle = true;
          this.switchToggle.loading.close();
        })
        .catch(err => {
          console.error(err);
          this.submitToggle = true;
          this.switchToggle.loading.close();
        });
    },
    userSpaceCost() {
      this.setSizeValue();
      this.$axios
        .post(this.$api.userspace + "cost", {
          Addr: this.addInfo.Addr,
          Second: {
            Value: Math.abs(this.addInfo.Second.Value),
            Type: this.addInfo.Second.Type
          },
          Size: {
            Value: Math.abs(this.addInfo.Size.Value),
            Type: this.addInfo.Size.Type
          }
        })
        .then(res => {
          if (res.data.Error === 0) {
            this.cost = res.data.Result;
          } else {
            this.cost.Fee = 0;
            this.cost.FeeFormat = 0;
            this.cost.TransferType = 1;
          }
        });
    },
    setSizeValue() {
      // this.addInfo.Size.Value = this.adjustSize;
      if (
        this.adjustSize * this.sizeUnit -
          (this.space.Remain + this.space.Used) ===
        0
      ) {
        this.addInfo.Size.Value = this.adjustSize * this.sizeUnit;
        this.addInfo.Size.Type = 0;
      } else if (
        this.adjustSize * this.sizeUnit -
          (this.space.Remain + this.space.Used) >
        0
      ) {
        this.addInfo.Size.Value =
          this.adjustSize * this.sizeUnit -
          (this.space.Remain + this.space.Used);
        this.addInfo.Size.Type = 1;
      } else {
        this.addInfo.Size.Value =
          this.space.Remain + this.space.Used - this.adjustSize * this.sizeUnit;
        this.addInfo.Size.Type = 2;
      }
    },
    setDateValue(e, opt) {
      if (!e) {
        this.addInfo.Second.Type = 0;
        return;
      }
      console.log("expired: ", this.expired);
      console.log("before e is :", e);
      if (!opt) {
        console.log("!opt");
        e = new Date(new Date(e).getTime() + 86399000);
        this.expired = e;
      }
      console.log("e is:", e);
      this.addInfo.Second.Value = Math.floor(
        (e.getTime() - new Date(this.expired_old).getTime()) / 1000
      );
      if (this.addInfo.Second.Value === 0) {
        this.addInfo.Second.Type = 0;
      } else if (this.addInfo.Second.Value > 0) {
        this.addInfo.Second.Type = 1;
      } else {
        this.addInfo.Second.Type = 2;
      }
      this.userSpaceCost();
    }
  }
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$grey: #ccc;
#expand {
  height: 100%;
  & > .content {
    height: 100%;
    padding: 0 50px 10px;
    display: flex;
    flex-direction: column;
    background: #f9f9fb;
    .space-header {
      padding-top: 30px;
      display: flex;
      align-items: flex-end;
      .space-progress {
        .el-progress-bar__outer,
        .el-progress-bar__inner {
          border-radius: 0px;
        }
        width: 100%;
        .el-progress {
          width: 100%;
        }
      }
      // .el-button {
      // height: 40px;
      // }
    }
    .space-record {
      display: flex;
      flex: 1;
      flex-direction: column;
      .el-table {
        color: $theme-font-blue;
        font-weight: bold;
        thead th {
          background: #f9f9fb;
          color: #1b1e2f;
          // font-weight: bold;
        }
      }
    }
  }
  .el-dialog__body {
    padding: 20px 60px;
  }
  .adjust {
    border-bottom: solid 1px #ebecef;
    margin-bottom: 20px;
    padding-bottom: 20px;
    .el-input-number__increase,
    .el-input-number__decrease {
      // display: none;
    }
  }
  .adjust-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 15px 0;
    .adjust-title {
      font-size: 14px;
      width: 160px;
      padding-right: 30px;
      text-align: right;
    }
    .adjust-info {
      flex: 1;
      width: 200px;
      display: flex;
      align-items: center;
      .sizeunit {
        width: 100px;
        margin: 0 20px;
      }
    }
  }
}
</style>
