<template lang="pug">
  .container
    .container__header
      .hideButton(v-if="userMsg.Role == 1 && shareControl")
        button(@click="toggleAdminModal")  2018 copyright 见微数据
      .hideButton(v-else-if="userMsg.Role != 1 && shareControl")
        | 2018 copyright 见微数据
      .shareBtn(v-if="allowShare && shareControl")
        button(open-type="share", @click="shareControlFn",open-gid="groupName") 转发
      img(src="https://www.jianweidata.com/Wxchat/banner_img3.png", mode="widthFix")
      .search__block
        .search__block--bg
          h1.search--name 精选研究
          .search__box
            input.search__box--text(placeholder-style="color: #A9A9A9", value="", v-model="searchTxt", placeholder="搜索", confirm-type="search", @confirm="searchCommunityDocument")
            button.search__box--btn(@click="searchCommunityDocument")
    // search result
    .container__docList(v-if="searchResult.length !== 0")
      .docList__item(v-for="(item, index) in searchResult", href="", v-bind:key="index")
        .item__header
          .item__header--icon(style="background-image: url(http://p7d8ojsvf.bkt.clouddn.com/icon_pdf.png)")
          a.item__header--title(:href="'../detail/main?sectorType=14&disclosureKey=' + item.Source.EncryptionKey")
            text(v-for="(itemI, indexI) in item.Source.Title", v-if="item.Source.Title.length > 1", v-bind:key="indexI", :class="itemI.Style == 1 ? 'highLight' : ''") {{ itemI.Str }}
            text(v-for="(itemV, indexV) in item.Source.Title", v-if="item.Source.Title.length === 1", v-bind:key="indexV",) {{ item.Source.Title[0] }}
        .item__meta
          <!--.item__meta&#45;&#45;date {{ item.Source.PublishDate | momentDate }}-->
          .item__meta--date {{ item.Source.PublishDate }}
          .item__meta--scroll(@click="slideToggle(index, 'searchResult')", :class="!item.slide ? 'icon-up' : 'icon-down'") {{ !item.slide ? '收起' : '展开' }}
        .item__content(v-if="!item.slide")
          .item__content--preview(v-for="(abstract, indexs) in item.IOSHighlight.Content", v-bind:key="indexs")
            text.item__content--paragraph(v-for="(paragraph, Indexs) in abstract.Fragments", :class="paragraph.Style == 1 ? 'highLight' : ''",  v-bind:key="Indexs") {{ paragraph.Str }}
    // latest document
    .container__docList(v-if="searchResult.length === 0", )
      .docList__item(v-for="(item, index) in latestDocument", href="", v-bind:key="index")
        .item__header
          .item__header--icon(style="background-image: url(http://p7d8ojsvf.bkt.clouddn.com/icon_pdf.png)")
          a.item__header--title(:href="'../detail/main?sectorType=14&disclosureKey=' + item.Source.EncryptionKey") {{ item.Source.Title }}
        .item__meta
          <!--.item__meta&#45;&#45;date {{ item.Source.PublishDate | momentDate }}-->
          .item__meta--date {{ item.Source.PublishDate }}
          .item__meta--scroll(@click="slideToggle(index, 'latestDocument')", :class="item.slide ? 'icon-up' : 'icon-down'") {{ item.slide ? '收起' : '展开' }}
        .item__content(v-if="item.slide")
          .item__content--preview(v-for="(abstract, indexs) in item.Highlight.Content", v-bind:key="indexs")
            text.abstract {{ abstract }}
      modal(v-if='flgAdminModalVisibility', title='管理后台', confirm-text='提交', cancel-text='取消', @cancel='cancelAdminModal', @confirm='confirmAdminModal')
        input(type='text', placeholder='请输入管理员密码...', auto-focus='', @confirm='confirmAdminModal')
</template>

<script>
const service = `https://www.jianweidata.com/data/`
// const service = `http://139.198.5.92:8080/data/`
// const service = `http://10.119.1.105:14999/`
const communityUrl = `https://www.jianweidata.com/data/api/TestSearch/SearchCommunityDocument`
const latestUrl = `https://www.jianweidata.com/data/api/TestSearch/RetrieveLatestDocument`

// use Vuex
import store from '../../store/index'
export default {
  data () {
    return {
      userInfo: {},
      searchResult: [],
      latestDocument: [],
      searchTxt: null,
      pageNum1: 1,
      pageNum2: 1,
      refreshType: 'latestDocument',
      userMsg: {
        Role: null,
        UnionId: null,
        SessionKey: null,
        UserOpenId: null,
        Token: null
      },
      flgAdminModalVisibility: false,
      allowShare: false,
      adminKeyInput: '',
      shareControl: true
    }
  },
  // 下拉刷新
  onPullDownRefresh: async function () {
    if (this.searchTxt !== null && this.searchTxt !== '') {
      this.searchTxt = null
      await this.searchCommunityDocument()
      wx.stopPullDownRefresh()
    } else {
      this.pageNum1 = 1
      await this.fetchLatestDocument(true)
      wx.stopPullDownRefresh()
    }
    console.log('下拉刷新')
  },
  // 上拉触底刷新
  onReachBottom () {
    this.scrolltolower(`${this.refreshType}`)
  },
  methods: {
    // 打开模态窗
    toggleAdminModal () {
      this.flgAdminModalVisibility = true
    },
    // 关闭模态窗
    cancelAdminModal () {
      console.log('取消了')
      this.flgAdminModalVisibility = false
    },
    // 确认
    confirmAdminModal (e) {
      console.log('确定了')
      console.log()
      this.flgAdminModalVisibility = false
      if (e.mp.detail && e.mp.detail.value === 'factminr') {
        wx.showToast({
          title: '密码正确',
          icon: 'success',
          duration: 2000
        })
        this.allowShare = true
      } else {
        wx.showToast({
          title: '密码错误',
          icon: 'none',
          duration: 2000
        })
      }
    },
    // input content
    adminKeyInputFun (e) {
      console.log(e)
      this.adminKeyInput = e.map.detail.value
    },
    // 上拉刷新
    async scrolltolower (type) {
      console.log(`调起刷新`)
      if (type === 'latestDocument') {
        // 拉取最新文档
        this.pageNum1 += 1
        await this.fetchLatestDocument()
      } else if (type === 'searchResult') {
        // 搜索结果
        this.pageNum2 += 1
        await this.searchCommunityDocument('refresh')
      }
    },
    // slideToggle
    slideToggle (index, type) {
      if (type === 'latestDocument') {
        if (!this.latestDocument[index].slide) {
          this.$set(this.latestDocument[index], 'slide', true)
        } else {
          this.latestDocument[index].slide = !this.latestDocument[index].slide
        }
      } else {
        if (!this.searchResult[index].slide) {
          this.$set(this.searchResult[index], 'slide', true)
        } else {
          this.searchResult[index].slide = !this.searchResult[index].slide
        }
      }
    },
    // 搜索
    async searchCommunityDocument (type) {
      this.refreshType = 'searchResult'
      // 清空搜索页码
      if (type !== 'refresh') {
        this.pageNum2 = 1
      }
      wx.showLoading({
        title: `加载中`
      })
      // 搜索内容为空，默认拉取最新文档
      if (this.searchTxt === null || this.searchTxt === '') {
        console.log(`输入内容为空,拉取最新内容`)
        this.refreshType = 'latestDocument'
        this.pageNum1 = 1
        this.searchResult = []
        return await this.fetchLatestDocument(true)
      } else if (this.searchTxt !== null || this.searchTxt !== '') {
        // 搜索社群文档
        return new Promise(resolve => {
          wx.request({
            url: communityUrl,
            header: {'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'POST',
            data: {
              query: `${this.searchTxt}`,
              label: '',
              titleMust: '',
              titleShould: '',
              titleMustNot: '',
              contentMust: '',
              contentShould: '',
              contentMustNot: '',
              isSimpleQuery: true,
              sort: 2,
              pageNum: `${this.pageNum2}`,
              pageSize: 1,
              searchType: 1,
              sector: 14,
              device: 5,
              isLockedAsset: false,
              nearMode: 0,
              token: `YE3xksETGD3DrapcL5zJH0N%2fNMIUzqvHPwL5%2ft%2bl2o7jk7hnbjWE5Q7LGXuTB65ivM%2bcYj3yWXYCaH5tDS%2fzBrwvyAtmfhcNZaXU%2bNVMaTXZj5RMLuTxKQ%3d%3d`
            },
            success: (res) => {
              if (type === 'refresh') {
                res.data.Hits.forEach(item => {
                  const highlightTitle = []
                  item.Source.Title = item.Source.Title.split(this.searchTxt)
                  if (item.Source.Title.length > 1) {
                    item.Source.Title.forEach((item, index) => {
                      item = {
                        Str: item,
                        Style: 2
                      }
                      highlightTitle.push(item)
                      if (index % 2 === 0) {
                        highlightTitle.push({
                          Str: this.searchTxt,
                          Style: 1
                        })
                      }
                    })
                    item.Source.Title = highlightTitle
                  }
                  console.log(item)
                  this.searchResult.push(item)
                })
              } else {
                res.data.Hits.forEach(item => {
                  const highlightTitle = []
                  item.Source.Title = item.Source.Title.split(this.searchTxt)
                  if (item.Source.Title.length > 1) {
                    item.Source.Title.forEach((item, index) => {
                      item = {
                        Str: item,
                        Style: 2
                      }
                      highlightTitle.push(item)
                      if (index % 2 === 0) {
                        highlightTitle.push({
                          Str: this.searchTxt,
                          Style: 1
                        })
                      }
                    })
                    item.Source.Title = highlightTitle
                  }
                })
                this.searchResult = res.data.Hits
              }
              console.log(this.searchResult)
              wx.hideLoading()
              this.searchResult.forEach(item => {
                item.Source.PublishDate = item.Source.PublishDate.replace(/T\w+:\w+:\w+/g, '')
              })
              return resolve(this.searchResult)
            },
            fail: (res) => {
              console.log(res)
            }
          })
        })
      }
    },
    // 拉取最新文档
    fetchLatestDocument (refresh) {
      wx.showLoading({
        title: `加载中`
      })
      return new Promise(resolve => {
        wx.request({
          url: latestUrl,
          header: {'Content-Type': 'application/json'},
          method: 'POST',
          data: {
            query: '',
            label: '',
            titleMust: '',
            titleShould: '',
            titleMustNot: '',
            contentMust: '',
            contentShould: '',
            contentMustNot: '',
            isSimpleQuery: true,
            sort: 2,
            pageNum: `${this.pageNum1}`,
            pageSize: 1,
            searchType: 1,
            sector: 14,
            device: 5,
            isLockedAsset: false,
            nearMode: 0,
            token: 'YE3xksETGD3DrapcL5zJH0N%2fNMIUzqvHPwL5%2ft%2bl2o7jk7hnbjWE5Q7LGXuTB65ivM%2bcYj3yWXb8bXKkW1Cnw1pZIl8N6AaSVbZ%2bd8nPtIMSgGO3ovGUjw%3d%3d'
          },
          success: (res) => {
            if (refresh) {
              this.latestDocument = []
            }
            res.data.Hits.forEach(item => this.latestDocument.push(item))
            wx.hideLoading()
            this.latestDocument.forEach(item => {
              item.Source.PublishDate = item.Source.PublishDate.replace(/T\w+:\w+:\w+/g, '')
            })
            return resolve(this.latestDocument)
          },
          fail: (res) => {
            return resolve(res)
          }
        })
      })
    },
    shareControlFn () {
      this.shareControl = false
      setTimeout(() => {
        this.shareControl = true
      }, 2000)
    }
  },
  async beforeMount () {
    this.userMsg = store.state.userMsg
    // 拉取最新文档
    await this.fetchLatestDocument()
    console.log(this.latestDocument)
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.hideShareMenu({})
  },
  update () {
    console.log(store.state.shareControl)
    this.shareControl = store.state.shareControl
  },
  // 分享卡片内容
  onShareAppMessage: (resMessage) => {
    console.log(`这是通过：${resMessage.from}`)
    // 分享卡片内容
    return {
      title: '首页分享',
      // imageUrl: 'http://brianlee.cn/wp-content/uploads/2017/08/70246.jpg',
      path: 'pages/guide/main',
      success: async (res) => {
        // 检测 SessionKey 是否过期
        const checkSessionKey = () => {
          return new Promise((resolve) => {
            wx.checkSession({
              success: function () {
                // session_key 未过期，并且在本生命周期一直有效
                return resolve({
                  success: true
                })
              },
              fail: function () {
                // session_key 已经失效，需要重新执行登录流程
                return resolve({
                  success: false
                })
              }
            })
          })
        }
        // session_key 已经失效，需要重新执行登录流程
        const login = () => {
          return new Promise((resolve) => {
            wx.login({
              success (res) {
                return resolve({
                  jsCode: res.code
                })
              }
            })
          })
        }
        // 转发成功，向后台发送openGId
        console.log(res.shareTickets)
        if (resMessage.from === `button`) {
          const isDue = await checkSessionKey()
          console.log(isDue)
          let JsCode = null
          if (!isDue) {
            store.state.userMsg.SessionKey = null
            JsCode = await login()
          }
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: (res) => {
              console.log(res)
              console.log('已成功获取到加密信息')
              wx.request({
                url: `${service}api/UserWechat/ValidateGroup`,
                header: {
                  'content-type': 'application/json'
                },
                method: `POST`,
                data: {
                  EncryptedData: res.encryptedData,
                  Iv: res.iv,
                  UserOpenId: store.state.userMsg.UserOpenId,
                  UnionId: store.state.userMsg.UnionId,
                  SessionKey: store.state.userMsg.SessionKey,
                  JsCode: JsCode,
                  Role: 1
                },
                success: (res) => {
                  console.log(res.data)
                  if (res.data.success === 'true') {
                    console.log('openGId 已成功存入数据库')
                  }
                }
              })
            },
            fail: (res) => {
              console.log(res)
            }
          })
        }
      },
      fail: (res) => {
        // 转发失败
        console.log(res)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.container {
  /*display: flex;*/
  /*flex-direction: column;*/
  /*height: 100%;*/
  &__header{
    background-color: #eaeaef;
    .hideButton {
      font-size: 24rpx;
      color: #333;
      height: 48rpx;
      text-align: center;
      background-color: #fff;
      button {
        font-size: 24rpx;
        height: 48rpx;
        line-height: 48rpx;
        background-color: #fff;
        &::after {
          display: none;
        }
      }
    }
    .shareBtn {
      background-color: #fff;
      padding: 20rpx;
      button {
        color: #e5423e;
        font-size: 24rpx;
        height: 48rpx;
        line-height: 48rpx;
        background-color: #eaeaef;
        width: 80%;
        margin: 0 auto;
        &::after {
          display: none;
        }
      }
    }
    img {
      width: 100%;
      display: block;
    }
    .search__block {
      /*padding: 0 23rpx;*/
      &--bg {
        height: 213rpx;
        background: url("https://www.jianweidata.com/Wxchat/banner_img2.png") no-repeat;
        background-size: 100% 100%;
        margin-top: -46rpx;
        box-sizing: border-box;
        padding: 18rpx;
      }
      .search--name {
        font-size: 32rpx;
        text-align: center;
        height: 88rpx;
        line-height: 88rpx;
      }
      .search__box {
        width: 646rpx;
        /*height: 56rpx;*/
        margin: 0 auto;
        border: 1px solid #e5423e;
        font-size: 24rpx;
        display: flex;
        &--text {
          /*width: 534rpx;*/
          flex: 1;
          padding: 0 30rpx;
          box-sizing: border-box;
          height: auto;
          color: #A9A9A9;
          &:focus {
            font-weight: normal;
            color: red;
          }
        }
        &--btn {
          width: 112rpx;
          height: 56rpx;
          background: url("https://www.jianweidata.com/Wxchat/icon_search.png") no-repeat center;
          background-size: 30rpx 30rpx;
          &::after {
            display: none;
          }
        }
      }
    }
  }
  &__docList {
    /*flex: 1;*/
    background-color: #fff;
    overflow-x: hidden;
    /*overflow-y: scroll;*/
    .docList__item {
      border-bottom: 2rpx solid #dbdbdb;
      padding: 16rpx 30rpx;
      .item {
        &__header {
          display: flex;
          &--icon {
            width: 44rpx;
            height: 54rpx;
            background-size: 100% 100%;
            margin-right: 30rpx;
          }
          &--title {
            flex: 1;
            line-height: 54rpx;
            font-size: 30rpx;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            .highLight {
              color: #e53935;
            }
          }
        }
        &__meta {
          display: flex;
          justify-content: space-between;
          font-size: 26rpx;
          margin-top: 10rpx;
          &--date {
            color: #999999;
          }
          &--scroll {
            color: #666666;
            &.icon-down {
              background: url("https://www.jianweidata.com/Wxchat/icon_down.png") no-repeat left center;
              background-size: 29rpx 26rpx;
              padding-left: 36rpx;
              color: #e53935;
            }
            &.icon-up {
              background: url("https://www.jianweidata.com/Wxchat/icon_up.png") no-repeat left center;
              background-size: 29rpx 26rpx;
              padding-left: 36rpx;
            }
          }
        }
        &__content {
          font-size: 28rpx;
          color: #666666;
          transition: height 1s linear;
          &--preview {
            margin-top: 10rpx;
            line-height: 40rpx;
            font-size: 0rpx;
            border-bottom: 2rpx dashed #f2f2f2;
            &:last-child {
              border-bottom: none;
            }
            text {
              word-break: break-all;/* 安卓机上text文本不换行问题 */
              font-size: 28rpx;
              display: inline;
              letter-spacing: normal;/* 设置字母、字间距为0 */
              word-spacing: normal; /* 设置单词、字段间距为0 */
            }
            .highLight {
              color: #e53935
            }
          }
        }
      }
    }
  }
}
</style>
