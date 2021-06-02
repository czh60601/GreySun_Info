// pages/news/item/item.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:{
      avatar: null,
      avatar_img: null,
      _createTime: null,
      content: null,
      des_img: null,
      description: null,
      message: null,
      medal: null,
      title: null,
      view: null,
      _id: null,
      parsstime:null
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
    db.collection(app.globalData.CDBName.News).doc(this.data.item._id).get({
      success: res => {
        let content = app.towxml(res.data.content,'markdown',{
          // theme:'dark',
          events:{
            tap:e => {
              console.log('tap',e);
            },
            change:e => {
              console.log('todo',e);
            }
          }
        });

        res.data.content = content;
        this.setData({
          item: res.data,
          'item.parsstime': app.getDiffTime(res.data._createTime,true),
          'item.ismedal': app.globalData.newsMedal[res.data._id] != null,
          loadinghiden: true
        });

        console.error("TODO:","阅读量增加方案")
        //阅读量增加
        db.collection(app.globalData.CDBName.News).doc(this.data.item._id).update({
          data:{view:++res.data.view},
          success: ret => {
            this.setData({
              'item.view': res.data.view
            })
          },
          fail: error => {
            console.error("[数据库] [更新数据] [阅读量增加] 失败",error)
          }
        })
      },
      fail: err => {
        console.error('[数据库] [查找记录] 失败：', err)
        wx.showToast({
          icon:'error',
          title: '文章不存在,或许已被删除',
        });
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
        type:app.globalData.CDBName.News
      },
      success: res => {
        console.log('[云函数] [updatemedal] 成功', res);
        let ret = res.result;
        if(ret.success){
          //更新全局数据
          if(res.result.ismedal){
            app.globalData.newsMedal[dataId] = ret.data.runtime;
          }else{
            delete app.globalData.newsMedal[dataId];
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
})