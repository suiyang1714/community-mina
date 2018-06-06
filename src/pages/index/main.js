import Vue from 'vue'
import App from './index'

const app = new Vue(App)
app.$mount()

export default {
  config: {
    navigationBarTitleText: '见微精选',
    disableScroll: false,
    enablePullDownRefresh: true
  }
}
