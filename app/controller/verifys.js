; layui.define(['form'], function (exports) {
    var form = layui.form;

    var reg = {
        nickname: function(val){
            if (!/^[\u4e00-\u9fa5]{2,10}$/.test(val)) {
                return '姓名格式格式错误'
            }
        },
        account: function (value) {
            //   if (!/^([0-9]|[-])+$/g.test(value) && value != ''){
            if (!/^\d{11}$/.test(value)) {
                return '手机格式不正确'
            }
        },
        pass: function(val){
            if (!/^\d{6,20}$/.test(val)) {
                return '密码格式错误'
            }
        },
        emails: function (value) {
            if (!/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value) && value != '') {
                return '邮箱格式不正确'
            }
        },
        consulting: function(val){
            if(/^.{0,9}$/.test(val)){
                return '留言内容应不少于10字符'
            } 
            else if(/^.{501}$/.test(val)){
                return '留言内容超出限制长度'
            }   
        },
        tel: function (value) {
            //   if (!/^([0-9]|[-])+$/g.test(value) && value != ''){
            if (!/^1[34578]\d{9}$/.test(value)) {
                return '手机格式不正确'
            }
        },
        mobile: function (value) {
            if (!/^1\d{10}$/.test(value)) {
                return false;
            }
            return true
        },
        idCrads: function (value) {
            if (/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(value)) {
                return this.getbirthDate(value)
            } else return false;
        },
        getbirthDate: function getBirthdatByIdNo(iIdNo) {
            var tmpStr = "";
            var strReturn = "";
            if (iIdNo.length == 15) {
                tmpStr = iIdNo.substring(6, 12);
                tmpStr = "19" + tmpStr;
                tmpStr = tmpStr.substring(0, 4) + "-" + tmpStr.substring(4, 6) + "-" + tmpStr.substring(6)
                return tmpStr;
            } else {
                tmpStr = iIdNo.substring(6, 14);
                tmpStr = tmpStr.substring(0, 4) + "-" + tmpStr.substring(4, 6) + "-" + tmpStr.substring(6)
                return tmpStr;
            }
        },
        /* 
         * 数值金额转大写金额
        */
        converAmount: function (num) {
            if (num == null || num == '') return '';
            var strOutput = "";
            var strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';
            num += "00";
            var intPos = num.indexOf('.');
            if (intPos >= 0)
                num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
            strUnit = strUnit.substr(strUnit.length - num.length);
            for (var i = 0; i < num.length; i++)
                strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i, 1), 1) + strUnit.substr(i, 1);
            return strOutput.replace(/零角零分$/, '').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
        },
        /* 
         * 浮点数据
        */
        converFloat: function (s) {
            return s.replace(/[^\-?\d.]/g, '')
        },
        //账号
        testAccount: function(s){
            if (!/(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^.{6,32}$/.test(s)) {
                return '账号长度：6 - 32，格式：字母、数字、字符组成'
            }else return true;
        },
        //密码
        testPassWord: function(s){
            if (!/(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^.{6,16}$/.test(s)) {
                return '账号长度：6 - 16，格式：字母、数字、字符组成'
            }else return true;
        },
        //四舍五入保留2位小数（不够位数，则用0替补）
        KeepTwoDecimalFull:function(num){
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
        //验证汉字字数
        DataLength:function(fData) { 
            var intLength=0 
            if(!fData) return;
            for (var i=0;i<fData.length;i++) 
            { 
                if ((fData.charCodeAt(i) < 0) || (fData.charCodeAt(i) > 255)) 
                    // intLength=intLength+2 
                    intLength=intLength+1
                else 
                    intLength=intLength+1    
            } 
            return intLength;
        },
        /* 
         * 大于(等于)零的整数
        */
       testInteger: function (num,eq) {
            if(eq == 1){
                if (num === '' || isNaN(num) || Number(num) <= 0 || String(num).indexOf('.') != -1 || String(num).length > 9) {
                    return 0;
                } else {
                    return 1;
                }
            }else{
                if (num === '' || isNaN(num) || Number(num) < 0 || String(num).indexOf('.') != -1 || String(num).length > 9) {
                    return 0;
                } else {
                    return 1;
                }
            }
        },
        /* 
        * 大于等于零的数
        */
        testNum: function (num) {
            if (num ==='' || isNaN(num) || Number(num) < 0 || num.indexOf('-')!=-1 || String(num).length > 9) {
                return 0;
            } else {
                return 1;
            }
        },
        /* 
        * 正负正数，正负小数
        */
        isAllNum: function (val) {
            if ((/(^[\-0-9][0-9]*(.[0-9]+)?)$/.test(val))) {
                return 1;
            } else {
                return 0;
            }
        },
        /* 
        * 数字
        */
        isNumber: function(val){
            if (!(/^\+?[0-9][0-9]*$/.test(val)) && val!==''){
                return '只能输入数字'
            }
        },
        /* 
        * 大于等于零小于100的数
        */
       testNumlt100: function (num) {
            if (num ==='' || isNaN(num) || Number(num) < 0 || String(num).indexOf('-') != -1 || Number(num)>100 || String(num).indexOf('.') != -1) {
                return 0;
            } else {
                return 1;
            }
        },
        /* 
        * 网址验证
        */
       testhtml: function (val) {
            if (!(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/.test(val))) {
                return 0;
            } else {
                return 1;
            }
        }
    };
    exports('verifys', reg);
});