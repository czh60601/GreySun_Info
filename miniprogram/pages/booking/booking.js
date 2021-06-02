// pages/my/booking/booking.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userdata: app.globalData.userdata,
    bookingData:{
      latitude:null,
      longitude:null,
      address_name:"点击选择地址",
      address_info:"详细地址",
      addressed:false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  getLocation: function (){
    const that = this;

    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          'bookingData.latitude': res.latitude,
          'bookingData.longitude': res.longitude,
          'bookingData.address_name': res.name,
          'bookingData.address_info': res.address,//将解析后的地址进行存储
          'bookingData.addressed':true
        });
      },
      fail: err =>{
        console.error(err)
      }
    })
  },

  submit: function(option){
    let update = option.detail.value;
  console.log(this.data.errn,this.data.errp,!this.data.errn || !this.data.errp)
    if(this.data.errn != false || false != this.data.errp){
      wx.showToast({
        title: '请输入完整信息',
        icon: 'error'
      })
      return;
    }

    const db = wx.cloud.database();
    update._createTime = db.serverDate();
    db.collection(app.globalData.CDBName.Booking).add({
      data: update,
      success: res => {
        wx.showToast({
          title: '预约完成',
          icon: 'success'
        });
        console.log('[数据库] [新增记录] 成功，记录: ', res)
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err)
      }
    });
  },

  goTypeChange: function(option){
    if(option.detail.value==0){//专车接送
      if(!this.data.bookingData.addressed){
        this.setData({
          'bookingData.latitude': 39.916527,
          'bookingData.longitude': 116.397128,
          'bookingData.address_name':"输入地名",
          'bookingData.address_info':"详细地址",
        });
      }
    }else{
      //this.setData({//自行前往
      //  'bookingData.latitude': 39.916527,
      //  'bookingData.longitude': 116.397128,
      //  'bookingData.address_name':"故宫博物院",
      //  'bookingData.address_info':"北京市东城区景山前街4号",
      //});
    }
  },

  nameChange: function(option){
    const value = option.detail.value;
    const regex = /^(?:[\u4e00-\u9fa5]+)(?:·[\u4e00-\u9fa5]+)*$|^[a-zA-Z0-9]+\s?[\.·\-()a-zA-Z]*[a-zA-Z]+$/
    if(regex.test(value)){
      this.setData({
        errn:false
      });
    }else{
      wx.showToast({
        title: '请输入姓名',
        icon: 'error'
      })
      this.setData({
        errn:true
      });
    }
  },

  pnoChange: function(option){
    const value = option.detail.value;
    const regex = /^1[3-9]\d{9}$/;
    if(regex.test(value)){
      this.setData({
        errp:false
      });
    }else{
      wx.showToast({
        title: '请输入11位有效手机号',
        icon: 'error'
      })
      this.setData({
        errp:true
      });
    }
  }
})