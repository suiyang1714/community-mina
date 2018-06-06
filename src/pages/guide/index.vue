<template lang="pug">
  .container
</template>

<script>
  const service = `https://www.jianweidata.com/data/`
  // const service = `http://139.198.5.92:8080/data/`
  // const service = `http://10.119.1.105:14999/`
  // use Vuex
  import store from '../../store/index'

  export default {
    data () {
      return {
        userInfo: {}
      }
    },
    methods: {
      // logging
      login () {
        return new Promise((resolve) => {
          wx.login({
            success (res) {
              return resolve(res.code)
            }
          })
        })
      },
      // getUserInfo
      async getUserInfo () {
        // calling login API, get Jscode
        const loginCode = await this.login()
        // Verify user identity
        return new Promise((resolve) => {
          // After logging in, get some basic info
          wx.getUserInfo({
            withCredentials: true,
            lang: 'zh_CN',
            success: (userInfoRes) => {
              console.log(userInfoRes.userInfo)
              this.userInfo = userInfoRes.userInfo
              wx.request({
                url: `${service}api/UserWechat/ValidateUser`,
                // url: `${service}api/getUserInfo`,
                header: {
                  'content-type': 'application/json'
                },
                method: `POST`,
                data: {
                  JsCode: loginCode,
                  EncryptedDate: userInfoRes.encryptedData,
                  Iv: userInfoRes.iv
                },
                success: (res) => {
                  wx.hideLoading()
                  wx.showLoading({
                    title: '验证权限'
                  })
                  console.log(res.data)
                  /*
                  * Role 1：admin 2：member 3： common
                  * SessionKey
                  * UserOpenId
                  * */
                  return resolve({
                    Role: res.data.Role,
                    UnionId: res.data.UnionId,
                    SessionKey: res.data.SessionKey,
                    UserOpenId: res.data.UserOpenId,
                    Token: res.data.Token
                  })
                }
              })
            }
          })
        })
      },
      // user permission Func
      userRole () {
        // get the share message
        return new Promise((resolve, reject) => {
          wx.getShareInfo({
            shareTicket: this.shareTicket,
            success: (res) => {
              console.log(res)
              // Validate Group Id
              wx.request({
                url: `${service}api/UserWechat/ValidateGroup`,
                // url: `${service}api/compareGroupMsg`,
                header: {
                  'content-type': 'application/json'
                },
                method: `POST`,
                data: {
                  EncryptedData: res.encryptedData,
                  Iv: res.iv,
                  UserOpenId: store.state.userMsg.UserOpenId,
                  SessionKey: store.state.userMsg.SessionKey,
                  UnionId: store.state.userMsg.UnionId,
                  Role: 3
                },
                success: (res) => {
                  console.log(res)
                  wx.hideLoading()

                  return resolve(res.data)
                }
              })
            }
          })
        })
      }
    },
    async beforeMount () {
      // hideShareBtn
      wx.hideShareMenu({})
      // getUserInfo、getUserPermissions
      const authorize = await this.getUserInfo()
      // assign
      store.state.userMsg = authorize
      // Role 1：admin 2：member 3： common
      switch (store.state.userMsg.Role) {
        case 1:  // admin
        case 2: // member
          wx.redirectTo({
            url: '../index/main'
          })
          break
        case 3: // common
          // shareTicket
          if (this.$root.$mp.appOptions.shareTicket) {
            // options.shareTicket
            this.shareTicket = this.$root.$mp.appOptions.shareTicket
            // Validate
            const authorizeUpdate = await this.userRole()
            store.state.userMsg.Role = authorizeUpdate.Role
            store.state.userMsg.Token = authorizeUpdate.Token
            wx.redirectTo({
              url: '../index/main'
            })
          } else {
            wx.hideLoading()
            // common
            wx.redirectTo({
              url: '../index/main'
            })
          }
          break
      }
    }
  }
</script>

<style >
  page {
    height: 100%;
  }
.container {
  height: 100%;
  background: url("https://www.jianweidata.com/Wxchat/guide.jpg") no-repeat center;
  background-size: cover;
}
</style>
