/* 
 * 广告管理模块 广告详情
*/
layui.extend({
    'ajax': '../../../controller/ajax',
    'api': '../../../controller/api',
    'renders': '../../../controller/renders',
    'verifys': '../../../controller/verifys',
    'setter': '../../../config',
    'store': '../../../controller/store',
    'jsencrypt': '../../../controller/jsencrypt'
}).use(['element', 'jquery', 'laytpl', 'api', 'form', 'ajax', 'laydate', 'upload', 'renders','layedit','verifys'], function () {
    var form = layui.form,
        tpl = layui.laytpl,
        $ = layui.jquery,
        element = layui.element,
        api = layui.api,
        laydate = layui.laydate,
        renders = layui.renders,
        verifys = layui.verifys,
        ajax = layui.ajax;
    
    var getTpl = posterCheck.innerHTML,
        view = $("#poster-check-view"); 
    
    data = {};
    if(api.getParams().id) data.id = api.getParams().id;
    if(api.getParams().sort) data.sort = api.getParams().sort;
    if(api.getParams().imgUrl) data.imgUrl = decodeURIComponent(api.getParams().imgUrl);

    create(data);

    function create(data) {
        var poster = data;
        tpl(getTpl).render(data, function (html) {
            view.html(html);
            var web = parent.layui.setter.debug?layui.api.file.dev:layui.api.file.web;
            if (api.getParams().type == 'check'){
                $("#posterForm").find('select,input,textarea').each(function () {
                    $(this).attr('disabled', 'disabled');
                });
                $(".upimg").hide();
                var html = '<div class="item">'+
                    '<img src= "'+ web + data.imgUrl + '" data-url="' + data.imgUrl + '" />'+
                '</div>';
                $(".upimg").hide().before(html);
                $("#poster-query").hide();
                $('i:not(.layui-icon)').hide();
            }else if(api.getParams().type == 'edit'){
                var html = '<div class="item">'+
                    '<img src= "'+ web + data.imgUrl + '" data-url="' + data.imgUrl + '">'+
                    '<div class="del">删除</div>'+
                '</div>';
                $(".upimg").hide().before(html);
            }
            //表单初始数据渲染
            form.val('posterForm', poster);
            form.render();
        });
        //序号
        $('.testInteger').blur(function(){
            testsort($('.testInteger').val());
        });
        function testsort(val){
            if(!verifys.testInteger(val)){
                $(".testInteger").val('').focus();
                renders.fail('请输入九位以内的整数');
                return false;
            }else{
                return true;
            }
        }
        //提交按钮
        form.on('submit(poster-query)', function (data) {
            var obj = data.field;
            if(api.getParams().id) data.field.id = api.getParams().id;//编辑
            //序号
            if (!testsort($('.testInteger').val())) return false;
            //封面图
            var url = "";
            $('.upload-img-gg').find('.item img').each(function(i,v){
                if(i==0){
                    url = this.dataset.url;
                }else{
                    url += ','+this.dataset.url;
                }
            });
            if(url == ""){
                renders.fail('分享海报图不为空');
                return false;
            }
            obj.imgUrl = url;
            obj.posterType = 1;

            if ($(this).hasClass('disabled')) {
                renders.fail('请勿重复提交！');
            }else {
                ajax({
                    url: '/api/admin/setting/publicPoster/savePoster',
                    data: obj,
                    traditional: true,
                    type: 'POST',
                    callback: function (res) {
                        if (res.ret == 100) {
                            renders.msg(res.msg, {
                                end: function () {
                                    var index = parent.layer.getFrameIndex(window.name);
                                    parent.layer.close(index);
                                }
                            });
                        } else {
                            renders.fail(res.msg);
                        }
                    }
                })
            }
            $(this).addClass('disabled');
            return false;   
        });
        //上传控件
        $('.upimg').parent().find('.del').on('click', function(){
            $(this).parent().remove();
            $('.upload-img-gg .upimg').show();
        });
        renders.upFile({ elem: '.upload-img-gg .upimg', num: 0, wid: 564, hei: 700,rate:1});
        $(".layui-upload-file").attr('accept',".jpeg,.jpg,.png");
        //预览
        $('.upload-file .item img').click(function(e){
            layer.photos({
                photos: { "data": [{"src": e.target.src}]}
            });
        });
    }
    
})