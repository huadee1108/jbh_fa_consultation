; layui.extend({
  'ajax': '/app/controller/ajax',
  'api': '/app/controller/api',
  'renders': '/app/controller/renders',
  'verifys': '/app/controller/verifys',
  'setter': '/app/config',
  'store': '/app/controller/store',
  'jsencrypt': '/app/controller/jsencrypt'
}).use(['jquery', 'laytpl', 'verifys', 'api', 'form', 'upload', 'ajax', 'renders', 'setter'], function () {
  var $ = layui.jquery, 
      api = layui.api, 
      ajax = layui.ajax, 
      tpl = layui.laytpl,
      upload = layui.upload, 
      renders = layui.renders,
      form = layui.form;
  form.verify(layui.verifys);
  form.render();

  var parame = api.getParams(); 
  var view = $('body');
  var edit = parame.edit;
  var id = parame.id;
  var fileSrc = layui.setter.debug?layui.api.file.dev:layui.api.file.web;
  var oldPassWord = ''; // 旧密码
  var mode = !edit? 0: 1; // 0 添加 1 编辑
  

  if(!edit){
    create({})
  } else {
    getData()
  }

  function getData(){
    if(!id) {
      // 不存在的id
      return false;
    }
    ajax({ 
      url: '/api/admin/employee/getEmployee', 
      data: { employeeId: parame.id }, 
      callback: function(res){
        create(res.data||{})
      } 
    })

  }

  function create(d){
    d.mode = mode;
    d.status = !d.status?'0':String(d.status); // 默认为离线状态
    oldPassWord = d.employeePwd;
    tpl(pageTpl.innerHTML).render(d, function (html) {
      view.html(html)
      // 初始化数据
      form.val('form-filter', d );
      
      $("#up-pic").prop('src', !d.headImgUrl? '../../../../static/images/upimg.png': fileSrc + d.headImgUrl);

      // 更新头像
      var fileAvatar = upload.render({
        elem: '#up-pic',
        url: api.getApi('upfile'),
        auto: false,
        choose: function (obj) {
            var that = this;
            var files = obj.pushFile();
            obj.preview(function (index, file, result) {
                that.data.file1 = file;
                fileAvatar.upload()
            })
          },
          done: function (res) {
              if (res.ret == 100) {
                  $("#up-pic").prop("src", fileSrc + res.files[0].saveUrl)
                  $("input[name='headImgUrl']").val(res.files[0].saveUrl)
              } else {
                  layer.msg("上传头像失败")
              }
          }, error: function () {

          }
      })

      // 提交表单
      form.on("submit(btn-submit)", function(data){
        var data = data.field;
        if(id) data.id = id;

        delete data.file;
        if(mode==1&&(data.employeePwd===oldPassWord||!data.employeePwd)) delete data.employeePwd; // 编辑室未修改密码，不提交密码字段

        ajax({
          url: '/api/admin/employee/saveEmployee',
          type: 'POST',
          data: data,
          callback: function(res){
            res.ret === 100? renders.msg(res.msg): renders.fail(res.msg); 
            setTimeout(() => {
              if(res.ret === 100){
                var index = top.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                top.layer.close(index); //再执行关闭 
              }
            }, 1000);
          }
        })
        return true;
      })

    })
  }
})