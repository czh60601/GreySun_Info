// pages/news/news.js
const app = getApp()

Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    skip: 0,
    news: [],
    swipers:[],
    loadinghiden:false
  },
 
  onQuery: function(){
    const db = wx.cloud.database();

    //获取轮播
    db.collection(app.globalData.CDBName.Swipers).where({type:'news'}).get({
      success: res => {
        this.setData({
            swipers:res.data
          }
        )
        console.log(res.data)
      },fail: res=> {
        console.error('[数据库] [查找记录] 失败：', err);
      }
    });

    //获取点赞列表
    db.collection(app.globalData.CDBName.UserMedal).where({
      _openid:app.globalData._openid,
      type:app.globalData.CDBName.News
    }).get({
      success: res => {
        //数据存在
        if(res.data.length>0){
          app.globalData.newsMedal = res.data[0];
        }else{
          //数据不存在
          db.collection(app.globalData.CDBName.UserMedal).add({
            data: app.globalData.newsMedal = {
            _openid:app.globalData._openid,
            type:app.globalData.CDBName.News
          }
        });
        }
        
        //获取文章列表
        db.collection(app.globalData.CDBName.News)
        .where({}).field({content:false})
        .orderBy("_createTime","desc")
        .skip(this.data.skip).limit(20)
        .get({
          success: res => {
            if(res.data.length==0){
              this.setData({
                loadinghiden: true
              });
              wx.showToast({
                icon:'none',
                title: '香港记者赶来中...',
              });
              return;
            }
            res.data.forEach(function(item){
              item.parsstime = app.getDiffTime(item._createTime,true);
              item.ismedal = app.globalData.newsMedal[item._id] != null;
            });
            if(this.data.skip!=0){
              res.data = this.data.news.concat(res.data);
            }
            this.setData({
              news:res.data,
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
        console.error('[数据库] [查找记录] 失败：', err);
      }
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
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
}
})
