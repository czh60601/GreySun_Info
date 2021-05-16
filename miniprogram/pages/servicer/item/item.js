// pages/servicer/item/item.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:{
      _id: null,
      name: null,
      headimg: null,
      motto: null,
      medal: null,
      phone: null
    },
    loadinghiden:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.userdata._openid==null){
      app.login();
    }
    this.setData({
      'item._id':options._id
    });

    const db = wx.cloud.database();
    //获取单个记录

    db.collection(app.globalData.CDBName.Servicer).doc(this.data.item._id).get({
      success: res => {
        this.setData({
          item:res.data,
          'item.ismedal': app.globalData.servicerMedal[this.data.item._id] != null,
          loadinghiden: true
        });
      },
      fail: err => {
        console.error('[数据库] [查找记录] 失败：', err)
      }
    });
  },

  click: function (e) {
    let dataId = this.data.item._id;

    // 调用云函数
    wx.cloud.callFunction({
      name: app.globalData.cloudFun.updateMedal,
      data: {
        updateId:dataId,
        type:app.globalData.CDBName.Servicer
      },
      success: res => {
        console.log('[云函数] [updatemedal] 成功', res);
        let ret = res.result;
        if(ret.success){
          //更新全局数据
          if(res.result.ismedal){
            app.globalData.servicerMedal[dataId] = ret.data.runtime;
          }else{
            delete app.globalData.servicerMedal[dataId];
          }
    
          this.setData({
            'item.medal': ret.data.medal,
            'item.ismedal': ret.data.ismedal
          });
        }else{
          console.error('[云函数] [updatemedal] 调用失败', res.error);
        }
      },
      fail: err => {
        console.error('[云函数] [updatemedal] 调用失败', err)
      }
    });
  },

  calling: function(e) {
    wx.makePhoneCall({
      phoneNumber: this.data.item.phone+"",
        success: function() {
        console.log("拨打电话成功！");
      },
      fail: function(e) {
        wx.showToast({
          icon: 'none',
          title: '拨打电话失败！'
        })
        console.log("[拨打电话失败]",e);
      }
    })
    }
})