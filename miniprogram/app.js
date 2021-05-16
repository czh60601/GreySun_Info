//app.js

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(H)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env: 'cloud1-9gei6h8g8d110481',
        traceUser: true,
      })
    }

    this.globalData = {
      userdata: {
        _openid: null,
        hasUserInfo: false,
        cdate:null,
        phonenumber:null,
        userInfo: {
          avatarUrl:'/images/ico/user-unlogin.png',
          city: '',
          country: '',
          gender: 0,
          language: '',
          nickName: '',
          province: ''
        }
      },
      servicerMedal:{},
      newsMedal:{},
      CDBName : {
        UserData : 'userdata',
        Servicer : 'servicer',
        News : 'news',
        UserMedal: 'usermedal',
        Swipers: 'swipers'
      },
      cloudFun:{
        login:'login',
        getServerDate:'getServerDate',
        updateMedal:'updatemedal'
      },
      CloudFilePath : {
        cloudPath : 'cloud://cloud1-9gei6h8g8d110481.636c-cloud1-9gei6h8g8d110481-1305691241/',
        servicerPath : 'servicer/',
        newsPath : 'news/'
      }
    }
  },

  login:function(_userInfo){
    const app = getApp();

    //判断登录状态
    //wx.checkSession({
    //  success: res => {
    //    //session_key 未过期，并且在本生命周期一直有效
    //    console.log(res);
    //  },
    //  fail: res => {
    //    console.log(res);
    //    // session_key 已经失效，需要重新执行登录流程
    //    wx.login({
    //      success: res => {
    //        console.log(res);
    //      },
    //      fail: res => {
    //        console.err(res);
    //      }
    //    }) //重新登录
    //  }
    //});
    
    // 调用云函数
    wx.cloud.callFunction({
      name: app.globalData.cloudFun.login,
      data: {},
      success: res => {
        console.log('[云函数] [login] 成功', res);
        var openid_ = app.globalData.userdata._openid = res.result.userInfo.openId;

        //查找登录信息
        const db = wx.cloud.database();
        db.collection(app.globalData.CDBName.UserData).where({_openid:openid_}).get({
          success: res => {
            console.log('[数据库] [login] 成功', res);
            //用户存在
            if(res.data.length>0){
              app.globalData.userdata = res.data[0];
              app.globalData.userdata.hasUserInfo = true;
            }else{
              //用户不存在
              app.globalData.userdata.hasUserInfo = false;
            }
            console.log('[app] [set] 信息', app.globalData.userdata);
          },
          fail: err => {
            console.error('[数据库] [login] 失败：', err)
          }
        });
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  /* 根据客户端的时间信息得到发表评论的时间格式
  多少分钟前，多少小时前，昨天，月日
  para:
  recordtime-{float}时间截
  yearsFlag-{bool} 是否要年份
  date.formate()方法--格式化日期显示
  */
  getDiffTime:function (recordTime, yearsFlag) {
    if (recordTime) {
      recordTime = new Date(recordTime);
      var minute = 1000 * 60;
      var hour = minute * 60;
      var day = hour * 24;
      var now = new Date();
      var diff = now - recordTime;
      var result = '';

      if (diff < 0) {
        return result;
      }
      var weekR = diff / (7 * day);
      var dayC = diff / day;
      var hourC = diff / hour;
      var minC = diff / minute;
      if (weekR >= 1) {
        var formate = 'MM-dd HH:mm:ss';
        if (yearsFlag) {
          formate = 'yyyy-MM-dd HH:mm:ss';
        }
        return recordTime.Format(formate);
      } else if (dayC == 1 || (hourC < 24 && recordTime.getDate() != now.getDate())) {
        result = '昨天' + recordTime.Format('HH:mm:ss');
        return result;
      } else if (dayC > 1) {
        var formate = 'MM-dd HH:mm:ss';
        if (yearsFlag) {
          formate = 'yyyy-MM-dd HH:mm:ss';
        }
        return recordTime.Format(formate);
      } else if (hourC >= 1) {
        result = parseInt(hourC) + '小时前';
        return result;
      } else if (minC >= 1) {
        result = parseInt(minC) + '分钟前';
        return result;
      } else {
        result = '刚刚';
        return result;
      }
    }
    return '';
  },

  clone:function (obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(this.clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = this.clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
  }
})
