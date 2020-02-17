; layui.define(['setter'], function (exports) {
    var setter = layui.setter;
    var layer = layui.layer;
    exports('api', {
        ip: {
            a1: 'http://192.168.2.36:8055',//本地地址
            b1: 'http://fa-testapi.jbhwx.cn',//测试地址
            //b1: 'http://fa-api.jbhwx.cn'//线上地址
        },
        file: {
            dev: "http://192.168.2.36:8083",
            web: "http://fa-testresources.jbhwx.cn",
            //web: "http://fa-resources.jbhwx.cn"
        },
        path: {
            api: '/api',
            zx: '/zx',
            stat: '/stat'
        },
        sqStr: {
            str1: "b65f0039416014f",
            str2: "95cce1a0d1904c76b29055d5b0d3692j",
            str3: "2"
        },
        exit: function(k){
          var isExit = top.layui.data(top.layui.setter.tableName)[top.layui.setter.request.tokenName];
          if(!isExit) return;
          
          layer.msg('登录信息已变更，请重新登录', {
            icon: 2,
            time: 1500
          }, function () {
            var r = layui.setter;
            top.layui.store.delete(r.tableName);
            top.location.hash = "/user/login";
            top.layer.closeAll()
            top.isExit = false;
          });   
        },
        getParams: function () {
            var href = self.location.href;
            try {
                var url = decodeURI(href);
            } catch (err) {
                var url = self.location.href;
            }
            try {
                var index = url.indexOf('?');
                url = url.match(/\?([^#]+)/)[1];
                var obj = {}, arr = url.split('&');
                for (var i = 0; i < arr.length; i++) {
                    var subArr = arr[i].split('=');
                    obj[subArr[0]] = subArr[1];
                }
                return obj;

            } catch (err) {
                return {};
            }
        },
        getUserInfo: function () {
            return layui.data(layui.setter.tableName)
        },
        getToken: function () {
            return "token=" + layui.data(layui.setter.tableName).token + "&userId=" + layui.data(layui.setter.tableName).userId
        },
        getFileHost: function () {
            return parent.layui.setter.debug ? layui.api.file.dev : layui.api.file.web
        },
        getApi: function (url) {
            var _url = typeof this.api[url] == 'undefined' ? url : this.api[url];
            //上传文件接口做修改（只针对线上的）
            if (!layui.setter.debug && Object.is('/api/other/file/upload', _url) && this.ip.b1.indexOf('test') == -1) {
                return 'http://47.112.22.254:8055' + _url + "?token=" + layui.data(setter.tableName).token + "&userId=" + layui.data(setter.tableName).userId
            } else {
                return (layui.setter.debug ? this.ip.a1 : this.ip.b1) + _url + "?token=" + layui.data(setter.tableName).token + "&userId=" + layui.data(setter.tableName).userId
            }
        },
        filterData: function (data) {
            layer.closeAll('tips');
            var _data = {}
            for (var i in data) {
                if (data[i] !== "" && data[i] !== undefined && data[i] != "null") {
                    _data[i] = data[i]
                }
            }
            return _data
        },
        /* 
         * 转化两层结构的JSON数据为键值对类型 { base: { userName } } => { base.userName }
         * 数组类型不转换
         * 第二个形参传如为不转化的数据键值数组
         */
        conversionDate: function (data, key) {
            var retData = {};
            var key = key || [];
            for (var i in data) {
                if (data[i] instanceof Array) {
                    retData[i] = data[i];
                    continue;
                }
                if (key.indexOf(i) >= 0) {
                    retData[i] = data[i];
                    continue;
                }
                for (var j in data[i]) {
                    retData[i + "_" + j] = data[i][j]
                }
            }
            return retData;
        },
        spliceDate: function (data) {
            var _data = {};
            for (var i in data) { fn(i) }
            function fn(k) {
                var a = k.split('_');
                var b = a[0];
                if (a.length > 1) {
                    if (_data[b] === undefined) {
                        _data[b] = {}
                    }
                    if (data[k] !== null && data[k] !== '' && data[k] !== undefined) {
                        _data[b][a[1]] = data[k]
                    }
                } else {
                    if (data[k] !== null && data[k] !== '' && data[k] !== undefined) {
                        _data[b] = data[k]
                    }
                }
            }
            return _data
        },
        /* 
         * 用户表格日期数据的处理
         * 默认输出 yyyy-mm-dd 
         * 可以选择数据 yyyy-mm
         */
        splitTimeDate: function (d, t) {
            if (t === "yyyy-mm") {
                if (d == undefined) return '';
                var _d = new Date(d);
                return _d.getFullYear() + "-" + (_d.getMonth() + 1)
            }
            return d == null || d == undefined ? '' : d.split(' ')[0]
        },
        getContractData: function (start, end) {
            return (new Date(end).getFullYear() - new Date(start).getFullYear())
        },
        getContractEnd: function (start, year) {
            var time = start.split('-');
            time[0] = parseInt(time[0]) + year;
            return time.join('-')
        },
        //改变时间格式
        dateFtt: function(fmt,date) {
            var o = { 
                "M+" : date.getMonth()+1,     //月份 
                "d+" : date.getDate(),     //日 
                "h+" : date.getHours(),     //小时 
                "m+" : date.getMinutes(),     //分 
                "s+" : date.getSeconds(),     //秒 
                "q+" : Math.floor((date.getMonth()+3)/3), //季度 
                "S" : date.getMilliseconds()    //毫秒 
                }; 
                if(/(y+)/.test(fmt)) 
                fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
                for(var k in o) 
                if(new RegExp("("+ k +")").test(fmt)) 
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
                return fmt;
        },
        /* 
         * 导出文件
         * @param opt.url: 接口地址
         * @param opt.data: 接受表单数据
        */
        exportFile: function (opt) {
            var $ = layui.jquery;
            var formData = this.filterData(opt.data);
            var form = $("<form></form>");
            form.attr('style', 'display:none');
            form.attr('target', '');
            form.attr('method', 'post');
            form.attr('action', this.getApi(opt.url));

            for (var i in formData) {
                appendForm(i, formData[i])
            }

            function appendForm(name, value) {
                var input1 = $("<input>");
                input1.attr('type', 'hidden');
                input1.attr('name', name);
                input1.val(value);
                form.append(input1);
            }
            $("body").append(form);

            form.submit();
            layer.closeAll('loading');

            form.remove()
        },
        /* 
         * 导入文件
         * 需要引用  upload,table,renders 模块
         * @param opt.elem : js节点
         * @param opt.url: 请求地址
         * @praam opt.table: 刷新的table
         * @praam callback: 回调
        */
        importFile: function (opt) {
            var upload = layui.upload;
            var renders = layui.renders;
            var table = layui.table;
            upload.render({
                elem: opt.elem,
                url: this.getApi(opt.url),
                method: 'POST',
                accept: 'file',
                done: function (res) {
                    var errRow = res.errorRow || [];
                    if (res.ret == 100) {
                        var html = ''
                        for (var i = 0, len = errRow.length; i < len; i++) {
                            html += "<p>" + errRow[i] + "</p>";
                        }
                        opt.table && table.reload(opt.table)
                        renders.msg(res.msg, function () {
                            if(errRow.length>0){
                              renders.con({
                                type: 0,
                                title: res.data,
                                shadeClose: 1,
                                content: '<div>' + html + '</div>',
                                area: ['500px', '500px']
                              })
                            }
                            opt.callback && opt.callback()
                        })
                    } else {
                        renders.fail(res)
                    }
                    console.log(res)
                }
            })
        },
        // 价格补.00
        addZero: function (num) {
            num = String(num);
            if (Object.is(num, 'null')) {
                return '0.00';
            } else if (num.indexOf('.') == -1) {
                return num + '.00';
            } else {
                if (num.split('.')[1].length == 1) return num + '0';
                else return num;
            }
        },
        // 时间补0
        addTimeZero: function (num) {
            num = String(num);
            if (num.length == 1) return '0' + num;
            else return num;
        },
        // 补零
        markZero: function (n, len) {
            var n = (n / Math.pow(10, len)).toFixed(len) + "";
            len = len == null ? 2 : len;
            return n.substr(n.indexOf('.') + 1)
        },
        //四舍五入保留2位小数（不够位数，则用0替补）
        KeepTwoDecimalFull: function (num) {
            var result = Math.round(num * 100) / 100;
            var s_x = result.toString();
            var pos_decimal = s_x.indexOf('.');
            if (pos_decimal < 0) {
                pos_decimal = s_x.length;
                s_x += '.';
            }
            while (s_x.length <= pos_decimal + 2) {
                s_x += '0';
            }
            return s_x;
        },
        api: {
            "upfile": "/api/other/file/upload",  // 上传文件
            "province": "/api/other/address/provinceList", // 获取省份
            "selectCity": "/api/other/address/selectCityList", // 获取市
            "selectCounty": "/api/other/address/selectCountyList", // 获取区  
        },
        errLog: '',//错误日志收集地址,仅上线后会使用，填写完整的线上地址
        login: {}
    });
});