// pages/servicer/servicer.js
const app = getApp()

Page({
  data: {
    skip: 0,
    list: [],
    loadinghiden:false
  },

  onQuery: function() {
    const db = wx.cloud.database();
    
    //获取点赞列表
    db.collection(app.globalData.CDBName.UserMedal).where({
      _openid:app.globalData._openid,
      type:app.globalData.CDBName.Servicer
    }).get({
      success: res => {
        //数据存在
        if(res.data.length>0){
          app.globalData.servicerMedal = res.data[0];
        }else{
          app.globalData.servicerMedal = {
            _openid:app.globalData._openid,
            type:app.globalData.CDBName.Servicer
          };
          //数据不存在
          db.collection(app.globalData.CDBName.UserMedal).add({
            data: app.globalData.servicerMedal
          });
        }
        //获取多个记录
        db.collection(app.globalData.CDBName.Servicer)
        .where({})
        .skip(this.data.skip).limit(20)
        .get({
          success: res => {
            if(res.data.length==0){
              this.setData({
                loadinghiden: true
              });
              wx.showToast({
                icon:'none',
                title: '正在面试新人...',
              });
              return;
            }

            res.data.forEach(function(item){
              item.ismedal = app.globalData.servicerMedal[item._id] != null;
            });
            if(this.data.skip!=0){
              res.data = this.data.list.concat(res.data);
            }
            this.setData({
              list:res.data,
              loadinghiden: true,
              skip: res.data.length + this.data.skip
            });
            wx.stopPullDownRefresh();
          },
          fail: err => {
            icon: 'none',
            console.error('[数据库] [查找记录] 失败：', err);
            wx.stopPullDownRefresh();
          }
        });
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [查找记录] 失败：', err);
      }
    })
  },

  onLoad: function (options) {
    if(app.globalData.userdata._openid==null){
      app.login();
    }
    this.data.skip = 0;
    this.onQuery();
  },

  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    this.setData({
      loadinghiden: false
    });
    this.data.skip = 0;
    this.onQuery();
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    this.setData({
      loadinghiden: false
    });
    this.onQuery();
  },

  click: function (e) {
    let dataId = e.currentTarget.dataset._id;
    let index = e.currentTarget.dataset.index;

    //用于刷新页面内容
    let flushkey = `list[${index}].medal`;
    let flushkey2 =  `list[${index}].ismedal`;

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
            [flushkey]: ret.data.medal,
            [flushkey2]: ret.data.ismedal
          });
        }else{
          console.error('[云函数] [updatemedal] 调用失败', res.error);
        }
      },
      fail: err => {
        console.error('[云函数] [updatemedal] 调用失败', err)
      }
    });
  }

})