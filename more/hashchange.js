define("hashchange", ["$event"], function(){
    $.log("已加载hashchange模块")

    var hashchange = 'hashchange',  DOC = document,  documentMode = DOC.documentMode,
    supportHashChange = ('on' + hashchange in window) && ( documentMode === void 0 || documentMode > 7 );
   
    $.fn[ hashchange ] = function(callback){
        return callback?  this.bind(hashchange, callback ) : this.fire( hashchange);
    }
    $.fn[ hashchange ].delay = 50;
    if(!supportHashChange){
        $.log("不支持hashchange，使用iframe加定时器模拟")
        // IE6直接用location.hash取hash是不安全的
        // 比如 http://www.cnblogs.com/rubylouvre#stream/xxxxx?lang=zh_c
        // ie6 => location.hash = #stream/xxxxx
        // 其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
        // 又比如 http://www.cnblogs.com/rubylouvre/#!/home/q={%22thedate%22:%2220121010~20121010%22}
        // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
        // 其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
        function getHash ( ) {
            return '#' + DOC.URL.replace( /^[^#]*#?(.*)$/, '$1' );
        }
        //将主窗口的location.href加工一下，赋给iframe中的location
        function setHash( hash){
            if(iframe){
                iframe.location  = DOC.URL.replace( /#.*/, '' ) + hash;
                $.log("利用document.write产生历史")
                var doc = iframe.document
                doc.open();
                doc.write($.format(html, hash));
                doc.close();
            }
        }
        var iframe, cur = getHash(), now, timeoutID
        var html = '<!doctype html><html><body>#{0}</body></html>'
        $.eventAdapter[ hashchange ] = {
            setup: function(desc) {
                $.require("ready", function(){
                    if (!iframe) {
                        //创建一个隐藏的iframe，使用这博文提供的技术 http://www.paciellogroup.com/blog/?p=604.
                        iframe = $('<iframe tabindex="-1" '+ DOC.URL+'hidden style="display:none" widht=0 height=0 title="empty" />')
                        .one( 'load', function(){
                            timeoutID = setInterval(poll, $.fn[ hashchange ].delay)
                            }).appendTo( "body" )[0].contentWindow;
                        function poll() {
                            var now = getHash();
                            if(cur !== now){
                                setHash(cur = now )
                                $(desc.currentTarget).fire(hashchange)
                            }
                        }
                    }
                    void function clear(){
                        try {
                            var doc = iframe.document
                            doc.open();
                            doc.write($.format(html, cur))
                            doc.close();
                        } catch(e) {
                            setTimeout( clear, 31 );
                        }
                    }()
                });
            },
            teardown: function(){
                if(!iframe){
                    clearTimeout(timeoutID);
                    $(iframe).remove();
                    iframe = 0;
                }
            }
        };
    }

})

//https://github.com/tkyk/jquery-history-plugin/blob/master/jquery.history.js
//https://github.com/documentcloud/backbone/blob/master/backbone.js
//http://www.cnblogs.com/sking7/archive/2011/10/12/2209554.html