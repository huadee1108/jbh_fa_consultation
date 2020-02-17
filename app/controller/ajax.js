; layui.define(['api', 'store', 'jsencrypt'], function (exports) {
    var $ = layui.$,
        setter = layui.setter,
        layer = layui.layer,
        router = layui.router(),
        search = router.search,
        store = layui.store,
        api = layui.api,
        jsencrypt = layui.jsencrypt;

    var key = api.api

    exports('ajax', function (params) {
        //默认请求方式为get
        if (!params.hasOwnProperty('type') || !params.type) {
            params.type = 'get';
        }
        //默认所有接口都需要验证登录
        if (!params.hasOwnProperty('login')) {
            params.login = true;
        }

        //尝试从本地缓存中得到用户信息
        var token = store.get(setter.tableName);

        layer.load(0)

        var count = 0, len = 0, _params = null, _data = {};
        if (params.url instanceof Array) {
            len = params.url.length;
            for (var i = 0; i < len; i++) {
                _params = params.url[i];
                function _pack(_i) {
                    params.url[_i].callback = function (res) {
                        if (typeof params.url[_i].retKey == 'string') {
                            _data[params.url[_i].key] = res[params.url[_i].retKey]
                        } else {
                            _data[params.url[_i].key] = params.url[_i].retKey(res)
                        }
                    }
                }
                _pack(i)
                _params.finalback = isLoad;
                request(_params, token)
            }
        } else {

            var stack = [];
            var lock = !1;
            if (!layui.sessionData('stack').hasOwnProperty('list')) {
                layui.sessionData('stack', {
                    key: 'list',
                    value: [params.url]
                })
            } else {
                stack = layui.sessionData('stack').list;
                if (stack.indexOf(params.url) >= 0) {
                    lock = !0;
                    return false;
                }
                stack.push(params.url);
                layui.sessionData('stack', { key: 'list', value: stack })
            }
            if (lock) return false; 

            if (params.type === 'JSON') { // 跨域
                requests(params, token)
            } else { // 默认请求
                request(params, token)
            }
        }

        // 请求完成
        function isLoad(res) {
            count++;
            if (count == len) { params.callback(_data) }
        }

        function request(params, token) {
            if (!params.data) { params.data = {} }

            params.data.userId = token.userId;
            params.data.token = token.token;

            var _url = typeof key[params.url] == 'undefined' ? params.url : key[params.url];
            $.ajax({
                url: (setter.debug ? api.ip.a1 : api.ip.b1) + _url,
                type: params.type,
                data: params.data,
                timeout: top.layui.setter.request.timeout,//服务器响应时间超过了 设置的时间，则进入 ERROR （错误处理）
                dataType: 'json',
                traditional: params.traditional || false,
                contentType: params.contentType || 'application/x-www-form-urlencoded; charset=UTF-8"',
              success: function (data, status, jqXHR) {
                    if (!params.hasOwnProperty('loading') || params.loading) {
                        layer.closeAll('loading');
                    }
                    if (data.ret == 100) {
                        if (params.callback) {
                            params.callback(data, status, jqXHR);
                        }
                    } else if (data.ret == 106) {
                        top.layer.closeAll('tips')
                        // if(_url === "/api/admin/employee/logout") return false;
                        // if(location.hash === "#/user/login") return;
                        api.exit();
                    }
                    else {
                        if (data.error_msg){//提现的提示语
                            data.msg = data.error_msg;
                        }
                        layer.msg(data.msg || data, {
                            icon: 2,
                            time: 1200,
                            end: function () {
                                params.errorback && params.errorback(data, jqXHR, status);
                            }
                        });
                        console.log(data)
                    }
                },
                error: function (jqXHR, status) {
                    if (!params.hasOwnProperty('loading') || params.loading) {
                        layer.closeAll('loading');
                    }
                    //恢复请求状态为true
                    if (setter.debug) {
                        console.log("url:" + params.url.slice(0, params.url.length) + "\n data:" + JSON.stringify(jqXHR));
                    } else {
                        //错误提示
                        if (!params.hasOwnProperty('errorTip') || params.errorTip) {
                            layer.msg('服务器繁忙，请刷新再试！');
                        }
                    }

                    if (params.errorback) {
                        params.errorback(jqXHR, status);
                    }
                },
                complete: function (jqXHR, status) {
                    layer.closeAll('loading')
                    if (params.finalback) {
                        params.finalback(jqXHR, status);
                    }
                    removeStack(params.url)
                }
            });
        }
        /* 
         * 跨域请求
         * 复杂数据类型
         * dataType: JSON
        */
        function requests(params, token) {
            $.ajax({
                type: 'POST',
                url: (setter.debug ? api.ip.a1 : api.ip.b1) + params.url + (params.url.indexOf("?")>=0?"&":"?") + api.getToken(),
                crossDomain: true,
                contentType: "application/json;charset=UTF-8",
                data: params.data,
                success: function (data, status, jqXHR) {
                    if (data.ret == 100) {
                        params.callback && params.callback(data, status, jqXHR);
                    } else {
                        layer.msg(data.msg == undefined ? data : data.msg, { icon: 2 })
                    }
                },
                complete: function (jqXHR, status) {
                    layer.closeAll('loading');
                    params.complete && params.complete(jqXHR, status);
                    removeStack(params.url)
                }
            })
        }
        /* 
         * 移除已完成的请求
        */
        function removeStack(url){
            var stack = layui.sessionData('stack').list || [];
            stack.splice(stack.indexOf(url), 1);
            layui.sessionData("stack", { key: 'list', value: stack })
        }

    });
});