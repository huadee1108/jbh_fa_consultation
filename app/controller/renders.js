; layui.define(['api', 'store', 'jsencrypt', 'ajax', 'form', 'upload', 'table','tree'], function (exports) {
  var $ = layui.jquery,
      ajax = layui.ajax,
      api = layui.api,
      upload = layui.upload,
      table = layui.table,
      form = layui.form;

  // 下载模板文件
  $(document).on('click', '.j-down-temp', function () {
    var form = $('<form method="GET"></form>');
    form.attr("action", $(this).data().href)
    form.appendTo(document.body);
    form.submit()
    form.remove()
  })

  exports('renders',{
    /* 
     * layer 的封装
     * 在容器 #Lay_app_body 居中
     * 支持 px、%
    */
    con: function(opt){
        var defaults = {
            type: 2,
            maxmin: 1,
            area: ['90%','90%']
        }
        for(var i in defaults){
            if(typeof opt[i] == 'undefined'){
                opt[i] = defaults[i]
            }
        }
        if(opt.type == 2 ){
            if(opt.content.indexOf('/app/')<0){
                opt.content = (top === self ? '/app/' : top.layui.setter.base) + opt.content
            }
        }
        if(!opt.offset){
            var area = opt.area;
            var rect = top.document.querySelector('#LAY_app_body') == null ? top.document.body.getBoundingClientRect() : top.document.querySelector('#LAY_app_body').getBoundingClientRect();
            var newW = !area[0].match(/%/) ? parseInt(area[0]) : ~~(rect.width * (parseInt(area[0])/100));
            var newH = !area[0].match(/%/) ? parseInt(area[1]) : ~~(rect.height * (parseInt(area[1])/100)); 
            var newL = ~~((rect.width - newW) / 2 + rect.left);
            var newT = ~~((rect.height - newH < 0 ? 0 : rect.height - newH)/2 + rect.top);
            opt.area = [newW+'px',newH+'px'];
            opt.offset = [newT+ 'px', newL + 'px'];
        }
        return top.layer.open(opt)
    },
    /* 
     * layer.msg 成功提示窗口
     * 在当前窗口弹出
     * 
    */
    msg: function(tips,opt,callback){
      var defaults = {
        "time": 1200,
        "icon": 1
      }
      if(opt instanceof Function) opt = { end: opt };
      if(opt instanceof Object) opt = opt||{};
      opt = opt||{};
      for (var i in defaults) {
        if (typeof opt[i]=='undefined') {
          opt[i] = defaults[i]
        }
      }
      layer.msg(tips,opt,callback)
    },
    /* 
     * 错误提示窗
     * @ param tips: 提示文本
     * @ param end: 窗口关闭回调
    */
    fail: function(tips,end){
        this.msg(tips,{icon: 2, end: end})
    },
  /*
   * 渲染laydate 普通的组件
   * 严格的html结构
   * 依赖 laydate
   * 根据data-type传入类型渲染不同类型的时间组件 默认date
   * 类型： year month date time datetime
  */
    date: function(){
        lay('.laydate').each(function () {
            var format = $(this).data('type');
            layui.laydate.render({
                elem: this,
                type: format ==undefined?'date':format
            })
        })
    },
    /* 
     * 渲染laydate type=range的组件
     * 严格的html结构
     * 依赖 laydate
    */
    dateRange: function(){
        lay('.date-range .date-range-item').each(function () {
            var that = this;
            var ele = $(this).parents('.date-range');
            layui.laydate.render({
                elem: this,
                range: 1,
                btns: ['confirm'],
                done: function (value, date, endDate) {
                    ele.find('input[name="' + that.dataset.start + '"]').val(date.year + '-' + date.month + "-" + date.date);
                    ele.find('input[name="' + that.dataset.end + '"]').val(endDate.year + '-' + endDate.month + '-' + endDate.date);
                }
            })
        })
    },
    /* 
     * 动态分部 动态部门
     * @param opt.view : 视图容器
     * @param opt.url: 接口地址
     * @prram opt.data: 请求参数
    */
    company: function(opt){
        var that = this;
        form.on('select(province)', function(){
            opt.view.find('input[name="companyId"]').val("")
        })
        $(document).click(function (e) { $(".u-sel-tree-wrap.u-sel").removeClass("u-sel") });
        opt.view.find('.u-sel-tree').off('click').on('click', function (e) {
            e.stopPropagation();
            $(this).parent().toggleClass("u-sel");
        })
        $(".u-sel-tree-list").on("click", function(e){ e.stopPropagation();})
        var view = opt.view;
        if(opt.data == undefined){
            view.find(".u-sel-tree-list").html("<li class='pad-5 fc-grey'>没有选项</li>")
            return false;
        } 
        ajax({
            url: "/structure/getOrganizationalStructureByCondition",
            data: opt.data,
            callback: function (res) { 
                view.find(".u-sel-tree-list").html("");
                view.find('input[name="companyName"]').val('')
                var data = JSON.stringify(res.data);
                data = data.replace(/companyName/g, 'name');
                data = data.replace(/childs/g, 'children');
                data = JSON.parse(data);
                if (data.childs == null && data.id == null) {
                    view.find(".u-sel-tree-list").html("<li class='pad-5 fc-grey'>没有选项</li>")
                    return false;
                }
                layui.tree({
                    elem: view.find(".u-sel-tree-list")[0],
                    nodes: [data],
                    click: function (node) {
                        view.find("input[name=companyName]").val(node.name);
                        view.find("input[name=companyId]").val(node.id);
                        view.find('select[name="positionName"]').html("");
                        view.find('select[name="groupId"]').html("");
                        view.find('select[name="teamId"]').html("");
                        if(opt.query) opt.query.companyId = node.id;
                        opt.callback&&opt.callback(opt.query)
                        // 联动的下一级： 部门
                        if (view.find('select[name="departmentId"]').length == 1){
                            that.select('/department/getDepartmentsByCondition', { "provinceCode": opt.data.provinceCode, "companyId": node.id }, 'select[name="departmentId"]', { id: 'id', name: "departmentName" })
                        }
                        else if (view.find('select[name="sectorId"]').length == 1) { 
                            view.find('select[name="sectorId"]').html(""); 
                            that.select('/department/getDepartmentsByCondition', { "provinceCode": opt.data.provinceCode, "companyId": node.id }, 'select[name="sectorId"]', { id: 'id', name: "departmentName" })
                        }
                    }
                })
            }
        }) 
    },
    /* 
     * 动态部门结构
     * @param opt.elem : tree选择器或dom
     * @praam opt.lay: 点击监听 lay-filter
    */
    department: function(opt){
        $(document).click(function (e) { $(".u-eletree-wrap.u-sel").removeClass("u-sel") });
        opt.view.find('.u-eletree').off('click').on('click', function (e) {
            e.stopPropagation();
            $(this).parent().toggleClass("u-sel");
        })
        var el = layui.eleTree.render({
            elem: opt.elem,
            data: [],
            renderAfterExpand: 1,
            lazy: true,
        })
        $(".u-eletree-list").on("click", function (e) { e.stopPropagation(); })
        opt.view.find("input.u-eletree").on('click', function(){
            var companyId = opt.view.find('input[name="companyId"]').val();
            if (companyId == '') {
                opt.view.find(opt.elem).html("<li class='pad-10'>没有选项</li>")
                return false;
            }
            ajax({
                url: "/structure/getDepartmentStructure",
                data: { "companyId": companyId },
                callback: function (res) {
                    var data = JSON.stringify(res.dataList);
                    data = data.replace(/departmentName/g, 'label');
                    data = data.replace(/childs/g, 'children');
                    data = JSON.parse(data);
                    data = addNodeName(data);
                    el.reload({
                        elem: opt.elem,
                        data: data,
                        renderAfterExpand: 1,
                        lazy: true,
                        load: function (data, callback) {
                            if (data.hasOwnProperty("groupDescribe")) {
                                ajax({
                                    url: '/Team/getTeamsByCondition',
                                    data: { companyId: companyId, state: 0, groupId: data.id },
                                    callback: function (res) {
                                        var team = res.data.list;
                                        team = JSON.stringify(team).replace(/teamName/g, 'label');
                                        team = JSON.parse(team);
                                        team = addNodeName(team, data.nodeName, data.nodeId)
                                        callback(team)
                                    }
                                })
                            }
                            else if (data.hasOwnProperty("parentId") && !data.hasOwnProperty('groupDescribe')) {

                                ajax({
                                    url: '/group/getGroupsByCondition',
                                    data: { companyId: companyId, state: 0, departmentId: data.id },
                                    callback: function (res) {
                                        var group = res.data.list;
                                        group = JSON.stringify(group).replace(/groupName/g, 'label');
                                        group = JSON.parse(group);
                                        group = addNodeName(group, data.nodeName, data.nodeId)

                                        callback(group)
                                    }
                                })
                            } else {
                                callback([])
                            }
                        }
                    })
                }
            })
        })
        function addNodeName(d, name, id) {
            var data = d;
            var name = name == undefined ? '' : name + "-";
            var id = id == undefined ? '' : id + ",";
            for (var i = 0; i < data.length; i++) {
                if (data[i].node == undefined) {
                    data[i].node = ''
                }
                data[i].nodeName = name + data[i].label;
                data[i].nodeId = id + data[i].id
            }
            return data
        }
        layui.eleTree.on("nodeClick("+opt.lay+")", function () {
            opt.callback&&opt.callback(arguments[0])
        })
    },
    /* 
     * 动态 select 渲染
     * @param api: 请求地址
     * @param data: 请求数据
     * @param ele: 渲染对象选择器
     * @param callback: 回调方法
    */
    select: function (api, redata, ele, item, callback) {
      redata = this.filterData(redata);
      ajax({url:api,data: redata,callback: function (rdata) {
        var data = rdata.data.list;
        var html = null;
        var len = data == undefined ? 0 : data.length;
        html = "<option value='' selected>请选择<option>"
        for (var i = 0; i < len; i++) {
          html += "<option value=" + data[i][item.id] + ">" + data[i][item.name] + "<option>"
        }
        $(ele).html(html)
        // if(self==top){ // spa layadmin
        //   $('.layadmin-tabsbody-item.layui-show').find(ele).html(html)
        // } else { // iframe
        //   $(ele).html(html)
        // }
        
        callback && callback()
        form.render('select')
      }})
    },
    /* 
     * 渲染市 主要用于初始化
     * @param id: 省份id
     * @param ele: 视图对象
     * @callback: 回调方法
     */
    city: function (id, ele, callback) {
      if (id == '') { 
        ele.find("select[name='cityCode']").html('');
        ele.find("select[name='countyCode']").html('');
        form.render('select')
        return false;
      }
      ajax({url:"selectCity",data: { "provinceCode": id },callback: function (res) {
        var html = '', arr = res.objList, len = arr == null ? 0 : arr.length;
        for (var i = 0; i < len; i++) {
          html += '<option value="' + arr[i].regCityNum + '" id=' + arr[i].regCityId + '>' + arr[i].regCityName + "</option>"
        }
        ele.find("select[name='cityCode']").html(html);
        form.render('select')
        callback && callback(arr==null?'':arr[0].regCityNum)
      }})
    },
    /* 渲染地区 */
    county: function (id, ele,callback) {
      ajax({url:"selectCounty",data: { "cityCode": id },callback: function (res) {
        var html = '', arr = res.objList, len = arr == null ? 0 : arr.length;
        for (var i = 0; i < len; i++) {
          html += '<option value="' + arr[i].regCountyNum + '">' + arr[i].regCountyName + "</option>"
        }
        ele.find("select[name='countyCode']").html(html);
        form.render('select')
        callback && callback(arr==null?'':arr[0].regCountyNum)
        
      }})
    },
    /* 
     * 渲染日志
    */
    log: function(){
      var elem = arguments[0],
        view = arguments[1],
        data = arguments[2];
      if (data == null) {
        return false
      }
      var _list = data,
        _len = _list.length;
      var _html = '';
      for (var i = 0; i < _len; i++) {
        for (var j in _list[_len-1-i]) {
            _html += "<p>" + _list[_len - 1 - i][j] + "</p>"
        }
        _html += "<br>";
      }
      view.find(elem).html(_html)
    },
    /* 
     * 过滤掉josn数据中为空的key
    */
    filterData: function (data) {
      var _data = {}
      for (var i in data) {
        if (data[i] != "" && data[i] != undefined) {
          _data[i] = data[i]
        }
      }
      return _data
    },
    /* 
     * 文件上传
     * 框架为队列上传，后台提供多个文件同时上传修改为自定义的提交
     * 应用于人事模块的人员编辑、添加页
     * 外层需要包裹容器
     * @param elem: 按钮选择器
     * @param elem: 上传按钮id upBtnFile
    */
    fileUpload: function (elem) {
      var uploadEle = upload.render({
        elem: elem,
        url: layui.api.getApi("/api/other/file/upload"),
        multiple: true,
        drag: true,
        auto: false,
        accept: 'file',
        acceptMime: 'file',
        choose: function (obj) {
          var that = this;
          var files = obj.pushFile();
          var filesCount = Object.keys(files).length - 1;
          obj.preview(function (index, file, result) {
            // 已有的文件数量
            var _num = $(elem).parent().find('.file-tag').length;
            // 开始的下标
            var _index = _num;;

            var fileEle = $("<a class='file-tag' target='_blank'>" + file.name + "<i class='layui-icon layui-icon-close-fill del-file'></i></a>");
            fileEle.find('.del-file').on('click', function () {
              delete files[index];
              fileEle.remove()
              uploadEle.config.elem.next()[0].value = ''
            })
            if (_num >= 5) {
              layer.msg("最多上传5个附件")
            } else {
              $(elem).before(fileEle)
              that.data['file' + (parseInt(index.split("-").pop()) + 1)] = file;
              if (filesCount == index.split("-").pop()) {

                var form = new FormData();
                for (var i in that.data) {
                  form.append(i, that.data[i]);
                }

                $.ajax({
                  url: layui.api.getApi("upfile"),
                  type: 'POST',
                  processData: false,
                  contentType: false,
                  data: form,
                  success: function (res) {
                    var resData = res.files;
                    if (res.ret == 100) {
                      layer.msg('提交成功');
                      var startIndex = $(elem).parent().find('.file-tag').length - resData.length;
                      for (var i = 0, len = resData.length; i < len; i++) {
                        $(elem).parent().find('.file-tag').eq(startIndex + i).attr('data-file', resData[i].saveUrl)
                        $(elem).parent().find('.file-tag').eq(startIndex + i).prop('href', top.layui.api.getFileHost()+resData[i].saveUrl)
                      }
                    } else {
                      layer.msg(res.msg)
                    }

                  }
                })
                // uploadEle.upload() 不使用框架的提交方式
              }
            }

          })
        }
      })
      return uploadEle;
    },
    /* 
     * 生成附件标签
     * 应用于人事模块的人员编辑、添加页
    */
    FileTag: function (elem, data) {
      if (data == null) return;
      var arr = data.split(',');
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == "") continue;
        var fileEle = $("<a class='file-tag' target='_blank' href='"+top.layui.api.getFileHost()+arr[i]+"' data-file='" + arr[i] + "'>" + arr[i].split('/').pop() + "<i class='layui-icon layui-icon-close-fill del-file'></i></a>");
        fileEle.find('.del-file').on('click', function () {
          fileEle.remove()
        })
        $(elem).before(fileEle)
      }
    },
    /* 
     * 上传图片附件
     * @param opt.elem : ID选择器
    */
    upAnnex: function(opt){
      var upFile = upload.render({
        elem: opt.elem,
        url: api.getApi('upfile'),
        auto: false,
        choose: function (obj) {
          var that = this;
          var files = obj.pushFile();
          obj.preview(function (index, file, result) {
            that.data.file1 = file;
            obj.upload(index,file) 
          })
        },
        done: function (res) {
          if (res.ret == 100) {
            var img = new Image();
            img.src = (layui.setter.debug ? api.file.dev : api.file.web) + res.files[0].saveUrl;
            img.onerror = function(){
              this.src = './static/images/logo.png';
            }
            img.dataset.url = res.files[0].saveUrl;
            var item = $('<div class="item"><div class="del">删除</div></div>');
            item.prepend(img)
            $(opt.elem).before(item)
          } else {
            layer.msg(res.msg, { icon: 2,time: 1200 })
          }
        }, error: function () {
          console.log(arguments)
        }
      })
      return upFile;
    },
    /*  
     * 渲染上传图片附件
     * opt = { elem: '#up-file', file: 'file2.jpg,file2.jpg' }
    */
    renderAnnex: function(opt){
      var e = opt.elem ||'#up-file',
        f = (Array.isArray(opt.file))?opt.file:opt.file.split(','),
        p = $('<div></div>');
      
      for(var i = 0; i < f.length; i++){ r(f[i]) }
      function r(url){
        var img = new Image();
        img.src = (layui.setter.debug ? api.file.dev : api.file.web) + url;
        img.onerror = function () {
          this.src = './static/images/logo.png';
        }
        img.dataset.url = url;
        var item = $('<div class="item"><div class="del">删除</div></div>');
        item.prepend(img);
        p.append(item)
      }
      $(e).before(p.children())
    },
    /* 
     * 上传图片附件 单张上传 最多张数为5
     * @param opt.elem : 选择器
     * @param opt.num : 上传最大数(0:一张)
     * @param opt.wid : 上传图宽
     * @param opt.hei : 上传图高
     * @param opt.rate : 是否按比例
     * @param opt.wid1 : 第二种规格图宽
     * @param opt.hei1 : 第二种规格图高
    */
    upFile: function(opt){
      var upFile = upload.render({
        elem: opt.elem,
        url: api.getApi('upfile'),
        auto: false,
        choose: function (obj) {
          if( $(opt.elem).parent().find('.item').length == opt.num){
            $(opt.elem).hide();
          }else{
            $(opt.elem).show();
          }
          if($(opt.elem).parent().find('.item').length > opt.num){
            layer.msg("上传附件最大数量为" + (Number(opt.num)+1))
            return;
          }
          var that = this;
          var files = obj.pushFile();
          obj.preview(function (index, file, result) {
            //1,048,576 bytes=1M
            var maxsize = 1048576 * 2.1;
            if (file.size > maxsize){
              layer.msg("请上传小于2M的附件！");
              $(opt.elem).show();
              return;
            }
            var img = new Image();
            img.src = result;
            img.onload = function () {
              var naturalWidth = img.naturalWidth,
                  naturalHeight = img.naturalHeight;
              if(opt.wid){//有尺寸的
                if(opt.rate){//按比例的规格图
                  if((opt.wid * naturalHeight) != (opt.hei * naturalWidth)){
                    layer.msg("上传附件尺寸不符合！")
                    $(opt.elem).show();
                    return;
                  }
                }else if(!opt.wid1){//不同规格固定尺寸的
                  if (opt.wid != naturalWidth || opt.hei != naturalHeight) {
                    layer.msg("上传附件尺寸不符合！")
                    $(opt.elem).show();
                    return;
                  } 
                }else{//仅一种规格固定尺寸的
                  if(!((opt.wid == naturalWidth && opt.hei == naturalHeight) || (opt.wid1 == naturalWidth && opt.hei1 == naturalHeight))){
                    layer.msg("上传附件尺寸不符合！")
                    $(opt.elem).show();
                    return;
                  }
                }
              }
              that.data.file1 = file;
              obj.upload(index, file);
            }
          });
        },
        done: function (res) {
          if (res.ret == 100) {
            var img = new Image();
            img.src = (layui.setter.debug ? api.file.dev : api.file.web) + res.files[0].saveUrl;
            // img.onerror = function(){
            //   this.src = '../../../../static/images/logo.png';
            // }
            img.dataset.url = res.files[0].saveUrl;
            var item = $('<div class="item"><div class="del">删除</div></div>');
            item.prepend(img);
            $(opt.elem).before(item);
            $(opt.elem).parent().find('.del').on('click', function () {
              $(this).parent().remove();
              $(opt.elem).show();
            });
          } else {
            layer.msg("上传附件失败")
          }
        }, error: function () {
          console.log(arguments)
        }
      })
      return upFile;
    },
    /* 
     * 上传视频  最多一个
     * @param opt.elem : 选择器
     * @param opt.num : 上传最大数
    */
    upVideo: function(opt){
      var upVideo = upload.render({
        elem: opt.elem,
        url: api.getApi('upfile'),
        auto: false,
        accept: 'video',
        choose: function (obj) {
          var that = this;
          var files = obj.pushFile();
          obj.preview(function (index, file, result) {
            that.data.file1 = file;
            obj.upload(index,file);
          })
        },
        done: function (res) {
          if (res.ret == 100) {
            var item = "";
            item = '<div class="item"><video controls="controls" src='+
                    (layui.setter.debug ? api.file.dev : api.file.web) + res.files[0].saveUrl+
                    ' data-url = '+
                    res.files[0].saveUrl+
                    '></video><div class="del">删除</div></div>';
            $(opt.elem).before(item);
            $(opt.btn).hide();
            $(opt.elem).parent().find('.del').on('click', function(){
              $(this).parent().remove();
              $(opt.btn).show();
            });
          } else {
            layer.msg("上传附件失败")
          }
        }, error: function () {
          console.log(arguments)
        }
      })
      return upVideo;
    },
    /* 
     * 渲染表格
     * opt.id : <table>
     * opt.elem: <table #id>
     * opt.url: <request url>
     * opt.where: <query>
     * opt.cols: <Array> 标题行和数据行
     * opt.done: callback
     * events.toolbar: <Function> 监听表格工具条
     * events.tool： <Function> 监听行事件
    */
    table: function(opt,events){
      opt.elem = opt.elem.indexOf("#") == 0 ? opt.elem.replace(/#/,'') : opt.elem;
      var t = table.render({
        id: opt.id,
        elem: '#'+opt.elem,
        url: api.getApi(opt.url),
        even: true,
        page: { layout: ['count', 'prev', 'page', 'next', 'skip'], next: '下一页', prev: '上一页', groups: 10, limit: 10, theme: 'tb-page' },
        method: 'get',
        cellMinWidth: opt.cellMinWidth||60,
        parseData: function (res) { return { "code": res.ret == 100 ? 0 : 1, "msg": res.msg, "count": res.data == undefined ? 0 : res.data.total, "data": res.data==undefined?[]:res.data.list } },
        request: { pageName: 'pageNum', limitName: "pageSize" },
        where: opt.where||{},
        toolbar: opt.toolbar||"",
        defaultToolbar: ['filter', 'export', 'import'],
        text: { "none": '无数据' },
        cols: opt.cols,
        done: function () { 
            this.where = opt.where||{}; opt.done&&opt.done(arguments); 
        }
      })
      if (events){
        if (events.tool) {
          table.on("tool("+opt.elem+")", function(){ 
            for(var i in events.tool){
              if (i == arguments[0].event) {
                events.tool[i](arguments[0])
              }
            }
          })
        }
        if (events.toolbar){
          table.on("toolbar("+opt.elem+")", function(){
            for (var i in events.toolbar) {
              if (i == arguments[0].event) {
                events.toolbar[i](arguments[0])
              }
            }
          })
        }
      }
      return t;
    }
  })
})