/** layuiAdmin-v1.0.0-beta6 LPPL License By http://www.layui.com/admin/ */
;layui.extend({
    setter: "config",
    admin: "lib/admin",
    view: "lib/view",
    api: "controller/api",
    component: "controller/component"
})
    .define(["setter", "admin", 'api', 'component'], function (e) {
        var a = layui.setter,
            n = layui.element,
            i = layui.admin,
            t = i.tabsPage,
            l = layui.view,
            o = function () {
                var e = layui.router(),
                    r = e.path,
                    y = i.correctRouter(e.path.join("/"));
                r.length || (r = [""]), "" === r[r.length - 1] && (r[r.length - 1] = a.entry);
                var h = function (e) {
                    o.haveInit && layer.closeAll(), o.haveInit = !0, s(d).scrollTop(0), delete t.type
                };
                return "tab" === t.type && ("/" !== y || "/" === y && i.tabsBody().html()) ? (i.tabsBodyChange(t.index), h(t.type)) : (l().render(r.join("/")).then(function (l) {
                    var o, r = s("#LAY_app_tabsheader>li");

                    r.each(function (e) {
                        var a = s(this), n = a.attr("lay-id");
                        n === y && (o = !0, t.index = e)
                    }), a.pageTabs && "/" !== y && (o || (s(d).append('<div class="layadmin-tabsbody-item layui-show"></div>'), t.index = r.length, n.tabAdd(u, {
                        title: "<span>" + (l.title || "新标签页") + "</span>",
                        id: y,
                        attr: e.href
                    }))), this.container = i.tabsBody(t.index), n.tabChange(u, y), i.tabsBodyChange(t.index)
                })
                    .done(function () {
                        layui.use("common", layui.cache.callback.common), c.on("resize", layui.data.resize), n.render("breadcrumb", "breadcrumb"), i.tabsBody(t.index).on("scroll", function () {
                            var e = s(this), a = s(".layui-laydate"), n = s(".layui-layer")[0];
                            a[0] && (a.each(function () {
                                var e = s(this);
                                e.hasClass("layui-laydate-static") || e.remove()
                            }), e.find("input").blur()), n && layer.closeAll("tips")
                        })
                    }), void h())
            },
            r = function (e) {
                var n, t = layui.router(), r = l(a.container), d = i.correctRouter(t.path.join("/"));
                if (layui.each(a.indPage, function (e, a) {
                        if (d === a) return n = !0
                    }), layui.config({base: a.base + "controller/"}), n || "/user/login" === d) r.render(t.path.join("/")).done(function () {
                    i.pageType = "alone"
                }); else {
                    if (a.interceptor) {
                        var u = layui.data(a.tableName);
                        if (!u[a.request.tokenName]) return location.hash = "/user/login/redirect=" + encodeURIComponent(d)
                    }
                    "console" === i.pageType ? o() : r.render("layout").done(function () {
                        o(), layui.element.render(), i.screen() < 2 && i.sideFlexible(), i.pageType = "console"
                    })
                }
            },
            d = "#LAY_app_body",
            u = "layadmin-layout-tabs",
            s = layui.$,
            c = s(window);

        layui.link(a.base + "style/admin.css?v=" + (i.v + "-1"), function () {
            r();
        }, "layuiAdmin");
        window.onhashchange = function () {
            r();
            layui.event.call(this, a.MOD_NAME, "hash({*})", layui.router());
        };
        layui.each(a.extend, function (e, n) {
            var i = {};
            i[n] = "{/}" + a.base + "lib/extend/" + n;
            layui.extend(i);
        });
        e("index", {render: o});
    });