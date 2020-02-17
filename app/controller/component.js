; layui.extend({
    ajax: "controller/ajax",
    store: "controller/store",
    jsencrypt: 'controller/jsencrypt',
    renders: 'controller/renders'
})
    .define(['jquery', 'setter', 'ajax', 'api', 'form', 'renders'], function (exports) {
        var $ = layui.jquery,
            form = layui.form,
            renders = layui.renders,
            ajax = layui.ajax;
        exports('component', {
            render: {
                /* 
                 * 省/市/区/分部/部门/职位/小组/小队 多级联动
                 * 根据 select的name属性联动
                 * 根据 lay-filter 监听 select 事件
                 * @praam arr[string]: 1,2,3,4,6,7
                 * 1：市    name="cityCode"     lay-filter = 'city'
                 * 2：区    name="county"       lay-filter = 'county'
                 * 3：分部  name="companyId"    lay-filter = 'company'
                 * 4：部门  name="departmentId" lay-filter = 'department'
                 * 5：职位  name="positionId"   lay-filter = 'position'
                 * 6：小组  name="groupId"      lay-filter = 'group'
                 * 7：小队  name="teamId"       lay-filter = 'team'
                */
                province: function () {
                    var arr = arguments[0] == undefined ? '' : arguments[0].toString();
                    var view = $('.layadmin-tabsbody-item.layui-show .layui-form');
                    form.render('select');
                    if (arr == '') return false;
                    var _cache = {};
                    if (arr.indexOf('1') >= 0) {
                        form.on("select(province)", function (data) {
                            view.find('select[name="countyCode"]').html('');
                            renders.city(data.value, view, function (_id) {
                                if (arr.indexOf('2') >= 0) {
                                    renders.county(_id, view)
                                }
                            })
                            if (arr.indexOf('3') >= 0) {
                                if (arr.indexOf('4')) view.find('select[name="positionId"]').html('');
                                if (arr.indexOf('5')) view.find('select[name="groupId"]').html('');
                                if (arr.indexOf('6')) view.find('select[name="teamId"]').html('');
                                renders.select('/company/getCompanys', { 'provinceCode': arguments[0].value }, 'select[name="companyId"]', { id: 'id', name: "companyName" })
                            }
                        })
                    }
                    if (arr.indexOf('2') >= 0) {
                        form.on('select(city)', function (data) {
                            renders.county(data.value, view)
                        })
                    }
                    if (arr.indexOf('4') >= 0) {
                        form.on('select(company)', function () {
                            if (arr.indexOf('4')) view.find('select[name="positionId"]').html('');
                            if (arr.indexOf('5')) view.find('select[name="groupId"]').html('');
                            if (arr.indexOf('6')) view.find('select[name="teamId"]').html('');
                            renders.select('/department/getDepartments', { 'companyId': arguments[0].value }, 'select[name="departmentId"]', { id: 'id', name: 'departmentName' })
                        })
                    }
                    if (arr.indexOf('5') >= 0) {
                        form.on('select(department)', function () {
                            if (arr.indexOf('5')) view.find('select[name="groupId"]').html('');
                            if (arr.indexOf('6')) view.find('select[name="teamId"]').html('');
                            renders.select('/position/getPositionsByCondition', { 'departmentId': arguments[0].value }, 'select[name="positionId"]', { id: 'id', name: 'positionName' })
                        })
                    }
                    if (arr.indexOf('6') >= 0) {
                        form.on('select(position)', function () {
                            if (arr.indexOf('6')) view.find('select[name="teamId"]').html('');
                            renders.select('/group/getGroupsByCondition', { 'positionId': arguments[0].value }, 'select[name="groupId"]', { id: 'id', name: 'groupName' })
                        })
                    }
                    if (arr.indexOf('7') >= 0) {
                        form.on('select(group)', function () {
                            renders.select('/Team/getTeamsByCondition', { 'groupId': arguments[0].value }, 'select[name="teamId"]', { id: 'id', name: 'teamName' })
                        })
                    }
                }
            }
        })
    })