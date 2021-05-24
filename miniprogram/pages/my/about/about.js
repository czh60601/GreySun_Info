// pages/my/about/about.js
//获取应用实例
var app = getApp();

Page({
  data: {
    userdata: app.globalData.userdata,
    logosrc:'/images/logo.jpg',
    adrimg:'/images/ico/address.png',
    clockimg: '/images/ico/clock.png',
    phoneimg: '/images/ico/call_.png',
    jtimg: '/images/ico/jtright.png',
    picimg: '/images/ico/pic.png',
    swipers: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000
  },

  calling: function () {
    wx.makePhoneCall({
      phoneNumber: '4000010010', 
      success (res) {
        console.log(res)
      },
      fail: err =>{
        console.error(err)
      }
    })
  },

  getLocation: function (){
    //latitude: 29.863968961781023,
    //longitude: 107.7634180966034,
    wx.openLocation({
      latitude: 39.916527,
      longitude: 116.397128,
      name:"故宫博物院",
      address:"北京市东城区景山前街4号",
      scale: 0,
      success: res =>{
        console.log("[wx] [openLocation] success",res)
      },
      fail: err =>{
        console.error("[wx] [openLocation] error",err)
      }
    })
  },

  onLoad: function (options) {
    const db = wx.cloud.database();
    //获取轮播
    db.collection(app.globalData.CDBName.Swipers).where({type:'news'}).get({
      success: res => {
        this.setData({
            swipers:res.data
          }
        )
        console.log(res)
      },fail: res=> {
        console.error('[数据库] [查找记录] 失败：', err);
      }
    });
  }
})