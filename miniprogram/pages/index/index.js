// pages/index/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    imgbgOpacity: 1,
    swipers: [],
    setting: {
      latitude: "39.916527",//中心纬度
      longitude: "116.397128",//中心经度
      scale:"13", //缩放级别，取值范围为3-20
      markers:[{
        id: 1,
        latitude: "39.916527",//中心纬度
        longitude: "116.397128",//中心经度
        iconPath: '/images/ico/location.png',
        width: 40,//标注图标宽度
        height: 40,//标注图标高度
        anchor: {x: 0.5,y: 1}, //经纬度在标注图标的锚点，默认底边中点{x: .5, y: 1}
        callout: {
          content: '故宫博物院',
          color: '#ff0000',
          fontSize: 12,
          borderWidth: 1,
          borderRadius: 5,
          borderColor: '#000000',
          bgColor: '#fff',
          padding: 2,
          display: 'ALWAYS',
          textAlign: 'center',
          anchorY:20
        }
      }], //标记点
    }
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.userdata._openid==null){
      app.login();
    }

    const db = wx.cloud.database();
    //获取轮播
    db.collection(app.globalData.CDBName.Swipers).where({}).get({
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

    //测试数据添加
    console.error('TODO：', '快速测试代码片段');

  },

  //监听屏幕滚动 判断上下滚动  
  onPageScroll: function (ev) {
    let imgbgOpacity = this.data.imgbgOpacity;

    if(ev.scrollTop > 0){
      if(ev.scrollTop>this.data.scrollTop){
        imgbgOpacity = imgbgOpacity - 0.1<0?0:imgbgOpacity - 0.1;
      }else{
        imgbgOpacity = imgbgOpacity + 0.1;
      }
    }else{
      imgbgOpacity = 1
    }
    this.data.scrollTop = ev.scrollTop
    this.setData({
      imgbgOpacity:imgbgOpacity
    })
  },
  onShareAppMessage() {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '自定义转发标题'
        })
      }, 2000)
    })
    return {
      title: '自定义转发标题',
      path: '/page/user?share=123',
      promise 
    }
  }
})