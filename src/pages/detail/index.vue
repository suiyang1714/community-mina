<template lang="pug">
  web-view(:src="reqPdf")
</template>

<script>

// use Vuex
import store from '../../store/index'

// base64
// import { Base64 } from 'js-base64'
export default {

  data () {
    return {
      disclosureKey: null,
      sectorType: null,
      reqPdf: 'https://www.jianweidata.com/data/api/File/FileOpenWeb'
    }
  },
  created () {

  },
  beforeMount () {
    // hideShareBtn
    wx.hideShareMenu({})
    // empty field
    this.disclosureKey = null
    this.sectorType = null
    this.reqPdf = 'https://www.jianweidata.com/data/api/File/FileOpenWeb'
    // query assignment
    this.disclosureKey = this.$root.$mp.query.disclosureKey
    this.sectorType = this.$root.$mp.query.sectorType

    this.reqPdf += `?disclosureKey=${this.disclosureKey}&sectorType=${this.sectorType}&token=${store.state.userMsg.Token}&device=5`
    console.log(this.reqPdf)
  }
}
</script>
