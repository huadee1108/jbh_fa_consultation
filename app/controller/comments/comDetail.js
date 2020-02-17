/* 
 * 留言详情
*/
layui.extend({
    'ajax': '../../../controller/ajax',
    'api': '../../../controller/api',
    'renders': '../../../controller/renders',
    'verifys': '../../../controller/verifys',
    'setter': '../../../config',
    'store': '../../../controller/store',
    'jsencrypt': '../../../controller/jsencrypt'
  }).use(['element', 'jquery', 'laytpl', 'api', 'form', 'flow', 'ajax', 'laydate', 'upload', 'renders', 'layedit', 'verifys'], function () {
      var form = layui.form,
          tpl = layui.laytpl,
          $ = layui.jquery,
          element = layui.element,
          api = layui.api,
          laydate = layui.laydate,
          renders = layui.renders,
          verifys = layui.verifys,
          layedit = layui.layedit,
          flow = layui.flow,
          ajax = layui.ajax;
  
      var getTpl = commentsCheck.innerHTML,
          view = $("#comments-check-view");
      var recordid = '';
      var userName = api.getUserInfo().employeeName;
  
      if (api.getParams().id) {
          var rApi = [
              {
                  url: "/admin/chat/getOldChatRecord", data: { chatid: api.getParams().id, row: 20 }, key: 'comments', retKey: function (a) {
                      a.dataList = a.dataList.reverse();
                      return a;
                  }
              }
          ];
          ajax({
              url: rApi,
              callback: create
          });
      } else {
          create({});
      }
  
      function create(data) {
          var comments = data.comments;
          recordid = comments.dataList[0].id;
          tpl(getTpl).render({}, function (html) {
              view.html(html);
              var html = "";
              $(comments.dataList).each(function (i, v) {
                  if (v.whoMsg == 1) {
                      html += `<div class="customer float_left">
                      <div><span class="name_color">${v.name ? v.name : ''}</span><span class='ml-10'>${v.createDate}</span>
                      <span><input lay-skin="primary" type="checkbox" name="ques" value="" /></span></div>
                      <div style="float:left;margin-top:6px"><img src="${v.headUrl ? v.headUrl : ''}" alt="" style="width:32px;height:32px;border-radius:50%"></div>
                      <div class="user_content mt-10">${v.content}</div>
                  </div>`;
                  } else {
                      html += `<div class="system float_right">
                      <div class="text_r"><span><input lay-skin="primary" type="checkbox" name="answ" value="" /></span><span>${v.createDate}</span><span class="name_color ml-10">${v.name ? v.name : ''}</span></div>
                      <div style="float:right;margin-top:6px"><img src="${v.headUrl ? api.getFileHost()+v.headUrl : ''}" alt="" style="width:32px;height:32px;border-radius:50%"></div>
                      <div class="sys_content mt-10">${v.content}</div>
                  </div>`
                  }
              })
              $('#chain').html(html);
              if (comments.dataList.length < 20) {
                  $('.getMore').text('没有更多了');
                  $('.getMore').css('cursor', '');
                  $('body').off("click", ".getMore");
              }
              $(document).scrollTop();
              $("body,html").animate({ scrollTop: 2000000 });
              // //往上滚加载更多
              // $(window).scroll(function () {
              //     if ($(document).scrollTop() <= 0) {
              //         var html = "";
              //         ajax({
              //             url: '/chat/getOldChatRecord',
              //             data: { chatid: api.getParams().id, row: 20, recordid: recordid },
              //             traditional: true,
              //             type: 'GET',
              //             callback: function (res) {
              //                 if (res.dataList.length != 0) {
              //                     $(res.dataList.reverse()).each(function (i, v) {
              //                         if (v.whoMsg == 1) {
              //                             html += `<div class="customer float_left">
              //                             <div><span class="name_color">${v.name}</span><span class='ml-10'>${v.createDate}</span></div>
              //                             <div class="user_content mt-10">${v.content}</div>
              //                         </div>`;
              //                         } else {
              //                             html += `<div class="system float_right">
              //                             <div class="text_r"><span>${v.createDate}</span><span class="name_color ml-10">${v.name}</span></div>
              //                             <div class="sys_content mt-10">${v.content}</div>
              //                         </div>`
              //                         }
              //                     })
              //                     recordid = res.dataList[0].id;
              //                     $('#chain').prepend(html);
              //                     $(document).scrollTop(320);
              //                 } else {
              //                     $(window).unbind('scroll');
              //                 }
              //             }
              //         })
              //     }
              // });
              //点击加载更多
              $('body').on('click', '.getMore', function (params) {
                  var str = '';
                  if ($('.getMore').html() == '没有更多了') return false;
                  ajax({
                      url: '/admin/chat/getOldChatRecord',
                      data: { chatid: api.getParams().id, row: 20, recordid: recordid },
                      traditional: true,
                      type: 'GET',
                      callback: function (res) {
                          if (res.dataList.length != 0) {
                              $(res.dataList.reverse()).each(function (i, v) {
                                  if (v.whoMsg == 1) {
                                      str += `<div class="customer float_left">
                                      <div><span class="name_color">${v.name ? v.name : ''}</span><span class='ml-10'>${v.createDate}</span>
                                      <span><input lay-skin="primary" type="checkbox" name="ques" value="" /></span></div>
                                      <div style="float:left;margin-top:6px"><img src="${v.headUrl ? v.headUrl : ''}" alt="" style="width:32px;height:32px;border-radius:50%"></div>
                                      <div class="user_content mt-10">${v.content}</div>
                                  </div>`;
                                  } else {
                                      str += `<div class="system float_right">
                                      <div class="text_r"><span><input lay-skin="primary" type="checkbox" name="answ" value="" /></span><span>${v.createDate}</span><span class="name_color ml-10">${v.name ? v.name : ''}</span></div>
                                      <div style="float:right;margin-top:6px"><img src="${v.headUrl ? api.getFileHost()+v.headUrl : ''}" alt="" style="width:32px;height:32px;border-radius:50%"></div>
                                      <div class="sys_content mt-10">${v.content}</div>
                                  </div>`
                                  }
                              })
                              recordid = res.dataList[0].id;
                              $('#chain').prepend(str);
                              form.render();
                              $(document).scrollTop();
                              $("body,html").animate({ scrollTop: 1300 });
                          } else {
                              $('.getMore').text('没有更多了');
                              $('.getMore').css('cursor', '');
                              $('body').off("click", ".getMore");
                          }
                      }
                  })
              })
  
              //发送
              form.on('submit(send)', function (data) {
                  var obj = {};
                  obj.content = $('._content').val();
                  obj.chatid = api.getParams().id;
                  if (obj.content == '') {
                      renders.fail('回复内容不能为空');
                      return false;
                  }
                  $.ajax({
                      url: api.getApi('/admin/chat/sendMsg'),
                      data: obj,
                      crossDomain: true,
                      type: 'POST',
                      success: function (res) {
                          if (res.ret == 100) {
                              // renders.msg(res.msg, {
                              //     end: function () {
                              //         var index = parent.layer.getFrameIndex(window.name);
                              //         parent.layer.close(index);
  
                              //     }
                              // });
                              var date = new Date();
                              var contents =  $('._content').val();
                              var time = api.dateFtt("yyyy-MM-dd hh:mm:ss",date);
                              var str = `<div class="system float_right">
                                  <div class="text_r"><span><input lay-skin="primary" type="checkbox" name="answ"<span>${time}</span><span class="name_color ml-10">${userName}</span></div>
                                  <div style="float:right;margin-top:6px"><img src="${api.getUserInfo().headImgUrl ? api.getFileHost()+api.getUserInfo().headImgUrl : ''}" alt="" style="width:32px;height:32px;border-radius:50%"></div>
                                  <div class="sys_content mt-10">${contents}</div>
                              </div>`;
                              $('#chain').append(str);
                              form.render();
                              $('._content').val('');
                              $('._content').focus();
                            //   $(document).scrollTop(10000000000);
                              $(document).scrollTop();
                                $("body,html").animate({ scrollTop: 10000000 });
                          } else {
                              renders.fail(res.msg);
                          }
                      }
                  })
                  return false;
              })

              //发送通知
              form.on('submit(sendMsg)', function (data) {
                var obj = {};
                obj.chatid = api.getParams().id;
                var question = '';
                var answer = '';
                $("input:checkbox[name='ques']:checked").each(function (i, v) {
                    question += (i+1) + '.' + $(this).parent().parent().next().next().html() + '\r\n';
                });
                $("input:checkbox[name='answ']:checked").each(function (i, v) {
                    if (i == 0) {
                        answer = $(this).parent().parent().next().next().html()
                    } else {
                        answer += ';' + $(this).parent().parent().next().next().html();
                    }
                });
                if (question == '' || answer == '') {
                    renders.fail('请至少勾选一条留言和回复');
                    return false;
                }
                
                obj.question = question;
                obj.answer = answer;
                $.ajax({
                    url: api.getApi('/admin/chat/sendInform'),
                    data: obj,
                    crossDomain: true,
                    type: 'POST',
                    success: function (res) {
                        if (res.ret == 100) {
                            renders.msg(res.msg);
                        }
                    }
                })
                return false;
            })
  
              //表单初始数据渲染
              form.val('commentsForm', comments);
              form.render();
          });
  
  
      }
  
  })