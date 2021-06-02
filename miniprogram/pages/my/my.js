//pages/my/my.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userdata: app.globalData.userdata,
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  getUserProfile:function() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('[WX] [getUserProfile] 成功',res);
        app.globalData.userdata.userInfo = res.userInfo;

        //添加用户信息
        const db = wx.cloud.database();
        db.collection(app.globalData.CDBName.UserData).add({
          data: {
            _createTime:db.serverDate(),
            userInfo: app.globalData.userdata.userInfo
          },
          success: res => {
            app.globalData.userdata.hasUserInfo = true;
            this.setData({
              userdata: app.globalData.userdata
            });
            console.log('[数据库] [新增记录] 成功，记录: ', res)
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
          }
        });
      },
      fail: err => {
        console.error('[WX] [getUserProfile] 失败', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    if(app.globalData.userdata._openid==null){
      app.login();
    }
    this.setData({
      userdata: app.globalData.userdata,
    });
  },

  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);

      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false,
        userInfo: e.detail.userInfo
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  getPhoneNumber: function(e) {
    console.log(e.detail)
    console.log(e.detail.errMsg)

    const test = true;
    if(test){
      e.detail.iv = '73a1305b-b646-11eb-a27b-5254004a0d1c' //加密算法的初始向量
      e.detail.encryptedData = {
        "phoneNumber": "13580006666", //用户绑定的手机号（国外手机号会有区号）
        "purePhoneNumber": "13580006666", //没有区号的手机号
        "countryCode": "86", //区号
        "watermark":
        {
            "appid":"wxd390cb776f540463",
            "timestamp": Date.now()
        }
      };//包括敏感数据在内的完整用户信息的加密数据
    }
    console.log(e.detail.iv) //加密算法的初始向量
    console.log(e.detail.encryptedData)//包括敏感数据在内的完整用户信息的加密数据

    if(e.detail.iv != undefined && undefined!= e.detail.encryptedData){
      app.globalData.userdata.phonenumber = e.detail.encryptedData.phoneNumber;
      
      const db = wx.cloud.database();
      db.collection(app.globalData.CDBName.UserData).where({_openid:app.globalData.userdata._openid}).update({
        data:{
          phonenumber:this.data.userdata.phonenumber,
          success: res => {
            this.setData({
              'userdata.phonenumber':app.globalData.userdata.phonenumber
            });
          },
          fail: err => {
            console.error('[数据库] [新增记录] 失败：', err)
          }
        }
      });
    }
  },

  handleContact (e) {
    console.log(e.detail)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userdata: app.globalData.userdata,
    });
  }
})