const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({
  // 该参数从 wx-server-sdk 1.7.0 开始支持，默认为 true，指定 false 后可使得 doc.get 在找不到记录时不抛出异常
  throwOnNotFound: false,
});

exports.main = async (event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext();

  const openid =  wxContext.OPENID;
  const updateId = event.updateId;
  const type = event.type;
  const runtime = Date.now();

  try {
    const result = await db.runTransaction(async transaction => {
      let usermedal = await transaction.collection('usermedal').where({
          _openid:openid,
          type:type
        }).get();
      usermedal = usermedal.data[0];

      let originalData = await transaction.collection(type).doc(updateId).get();
      originalData = originalData.data;

      let ismedal;

      console.log(`transaction succeeded[originalData,usermedal]`, originalData,usermedal);

      if (originalData && usermedal) {
        ismedal = usermedal[originalData._id] != null;
        const updateData = {};
        //是否点赞
        if(ismedal){
          originalData.medal--;
          updateData[updateId] = db.command.remove();
        }else{
          originalData.medal++;
          updateData[updateId] = runtime;
        }

        const usermedalRes = await transaction.collection('usermedal').where({
          _openid:openid,
          type:type
        }).update({
          data: updateData
        });

        const dataRes = await transaction.collection(type).doc(updateId).update({
          data: {
            medal: originalData.medal
          }
        });

        console.log(`transaction succeeded[usermedalRes,dataRes]`, usermedalRes,dataRes);

        // 会作为 runTransaction resolve 的结果返回
        return {
          medal: originalData.medal,
          ismedal: !ismedal,
          runtime: runtime
        }
      } else {
        // 会作为 runTransaction reject 的结果出去
        await transaction.rollback('undefind user or data');
      }
    });

    console.log(`transaction succeeded[result]`, result);

    return {
      success: true,
      data: result
    }
  } catch (e) {
    console.error(`transaction error`, e);

    return {
      success: false,
      data:{},
      error: e
    }
  }
}