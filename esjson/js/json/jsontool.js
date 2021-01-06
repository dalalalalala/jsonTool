var jsonTool = {
    /**
     * 设置文本框的值
     * @param idSelector id选择器
     * @param value 值
     */
    resetTextAreaValue: function (objId, value) {
        $('#'+objId).val(value);
        $('#'+objId).trigger("focus");
    },

    jsonFormat: function(){
        var text = document.getElementById("sourceText").value;
        try {
            var jsonFormatText = jsonlint.parse(text);
            var jsonText = JSON.stringify(jsonFormatText, null, 4);
            this.resetTextAreaValue('sourceText', jsonText);
            $("#valid-result").html("格式正确");
            $("#valid-result").removeClass("es-fail");
            $("#valid-result").addClass("es-pass");
        } catch (e) {
            $("#valid-result").html(e.toLocaleString());
            $("#valid-result").addClass("es-fail");
            $("#valid-result").removeClass("es-pass");
        }
    },

    jsontoxml: function () {
        $("#xml2jsonBtn").click(function () {
            var xmlobjtree = new XML.ObjTree();
            var dumper = new JKL.Dumper();
            var xmlText = $("#sourceText").val();
            if (!xmlText) {
                layer.msg("请输入XML字符串");
                $("#sourceText").focus();
                return false;
            }
            xmlText = xmlText.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\""); //HTML转义
            var tree = xmlobjtree.parseXML(xmlText);
            if (tree) {
                if (!tree.html)
                     jsonTool.resetTextAreaValue('sourceText', dumper.dump(tree));
                else {
                    layer.msg("请检查XML是否错误。");
                    $("#sourceText").focus();
                }
            }
        });

        $("#json2xmlBtn").click(function () {
            var xmlobjtree = new XML.ObjTree();
            if (!$("#sourceText").val()) {
                layer.msg("请输入JSON字符串");
                $("#sourceText").focus();
                return false;
            }
            try {

                var json = eval("(" + $("#sourceText").val() + ")");
                if(Object.keys(json).length>1){
                    var rootJson = {};
                    rootJson.root = json;
                    jsonTool.resetTextAreaValue('sourceText',formatXml(xmlobjtree.writeXML(rootJson)));
                }else{
                    jsonTool.resetTextAreaValue('sourceText',formatXml(xmlobjtree.writeXML(json)));
                }
            } catch (e) {
                layer.msg("转XML异常，请检查JSON是否错误。");
                $("#sourceText").focus();
            }
        });

        var c1 = new EsjsonClipBoard({
            handlerID: 'copy-btn',
            textID: 'sourceText',
            isAttr: false,
            type: 'copy'
        });
        // c1.attach();


        $("#clearBtn").click(function () {
            jsonTool.resetTextAreaValue('sourceText', "");
        });

    },

    jsontoget: function () {

        var c1 = new EsjsonClipBoard({
            handlerID: 'copy-btn',
            textID: 'sourceText',
            isAttr: false,
            type: 'copy'
        });
        // c1.attach();

        $("#sourceText").bind("keyup paste", function (e) {
            var obj = $(this);
            var etype = e.type;
            setTimeout(function () {
                if (etype == "paste")
                    obj.val(obj.val().trim().replace(/(\r|\n|\t|\s)/g, ""));
                // obj.focus();
            }, 100);
        });
        $("#get2jsonBtn").click(function () {
            if (!$("#sourceText").val()) {
                layer.msg("请输入GET请求参数");
                $("#sourceText").focus();
                return false;
            }
            var val = $("#sourceText").val();
            val = val.replace(/&/g, '","').replace(/=/g, '":"');
            val = '{"' + val + '"}';
            // $("#sourceText").val(val);
            jsonTool.resetTextAreaValue('sourceText', val);
        });

        $("#json2getBtn").click(function () {
            if (!$("#sourceText").val()) {
                layer.msg("请输入JSON请求参数");
                $("#sourceText").focus();
                return false;
            }

            try {
                var json = eval("(" + $("#sourceText").val() + ")");
                var tempArr = [];
                for (var i in json) {
                    var key = encodeURIComponent(i);
                    if(Object.prototype.toString.call(json[i]) === '[object Object]'){
                        layer.msg("暂不支持json格式内嵌对象格式");
                        return false;
                    }
                    var value = encodeURIComponent(json[i]);
                    tempArr.push(key + '=' + value);
                }
                var urlParamsStr = tempArr.join('&');
                jsonTool.resetTextAreaValue('sourceText', urlParamsStr);
            } catch (err) {
                console.log(err);
                layer.msg("JSON转GET请求参数异常，请检查JSON是否错误。");
                $("#sourceText").focus();
            }

        });
        $("#clearBtn").click(function () {
            jsonTool.resetTextAreaValue('sourceText', "");
        });
    },

    exceltojson: {
        getresult: function (totype) {
            var splitchar = $("#splitchar").val() || /\t/;
            var txt = $("#sourceText").val();
            if (!txt.trim()) {
                layer.msg("请输入EXCEL格式的字符串。");
                return false;
            }
            var datas = txt.split("\n");
            var html = "[\n";
            var keys = [];
            for (var i = 0; i < datas.length; i++) {
                var ds = datas[i].split(splitchar);
                if (i == 0) {
                    if (totype == "0") {
                        keys = ds;
                    } else {
                        html += "[";
                        for (var j = 0; j < ds.length; j++) {
                            html += '"' + ds[j] + '"';
                            if (j < ds.length - 1) {
                                html += ",";
                            }
                        }
                        html += "],\n";
                    }
                } else {
                    if (ds.length == 0) continue;
                    if (ds.length == 1) {
                        ds[0] == "";
                        continue;
                    }
                    html += totype == "0" ? "{" : "[";
                    for (var j = 0; j < ds.length; j++) {
                        var d = ds[j];
                        if (d == "") continue;
                        if (totype == "0") {
                            html += '"' + keys[j] + '":"' + d + '"';
                        } else {
                            html += '"' + d + '"';
                        }
                        if (j < ds.length - 1) {
                            html += ',';
                        }
                    }
                    html += totype == "0" ? "}" : "]";
                    if (i < datas.length - 1)
                        html += ",\n";
                }
            }
            if (html&&html.lastIndexOf(",\n")==html.length-2) {
                html = html.substring(0, html.lastIndexOf(",\n"));
            }
            html += "\n]";
            jsonTool.resetTextAreaValue("targetText",html)
        },
        init: function () {
            var _this = this;
            $("#excel2jsonobjBtn").click(function () {
                _this.getresult(0);
            });
            $("#excel2jsonarrBtn").click(function () {
                _this.getresult(1);
            });
            $("#clearBtn").click(function () {
                jsonTool.resetTextAreaValue('targetText', "");
            });

            var c1 = new EsjsonClipBoard({
                handlerID: 'copy-btn',
                textID: 'targetText',
                isAttr: false,
                type: 'copy'
            });
            // c1.attach();
        }
    },

    json2pojo: {
        _allClass: [],
        _genClassCode: function (obj, name) {
            var packageval = $("#packageval").val()||"com.esjson", isfill = $("#isfill").prop("checked");
            var clas = "";
            var str = "";
            var privateAttr = "", publicAttr = "", fill = "", filllist = "";
            if (isfill) {
                fill += "    public static {0} fill(JSONObject jsonobj){\r\n".format(name || "Root");
                fill += "        {0} entity = new {0}();\r\n".format(name || "Root");

                filllist += "    public static List<{0}> fillList(JSONArray jsonarray) {\r\n";
                filllist += "        if (jsonarray == null || jsonarray.size() == 0)\r\n";
                filllist += "            return null;\r\n";
                filllist += "        List<{0}> olist = new ArrayList<{0}>();\r\n";
                filllist += "        for (int i = 0; i < jsonarray.size(); i++) {\r\n";
                filllist += "            olist.add(fill(jsonarray.getJSONObject(i)));\r\n";
                filllist += "        }\r\n";
                filllist += "        return olist;\r\n";
                filllist += "    }\r\n";
                filllist = filllist.format(name || "Root");
            }
            for (var n in obj) {
                var v = obj[n];
                n = n.trim();
                //变量定义规则
                n = n.replace(/[^\w]+/ig, '_');
                if (/^\d+/.test(n))
                    n = "_" + n;
                var tp = this._genTypeByProp(n, v);
                var _type = tp.type;
                if (tp.islist) {
                    if (isfill)
                        str = "package {1};\r\nimport java.util.ArrayList;\r\nimport java.util.List;\r\nimport net.sf.json.JSONObject;\r\nimport net.sf.json.JSONArray;\r\npublic class {0}\r\n{\r\n".format(name || "Root", packageval);
                    else
                        str = "package {1};\r\nimport java.util.ArrayList;\r\nimport java.util.List;\r\npublic class {0}\r\n{\r\n".format(name || "Root", packageval, "\r\nimport java.util.List;");
                }
                privateAttr += "    private {0} {1};\r\n\r\n".format(_type, n);
                var firstChar = n.substring(0, 1).toUpperCase() + n.substring(1);
                publicAttr += "    public void set{2}({0} {1}){\r\n        this.{1} = {1};\r\n    }\r\n".format(_type, n, firstChar);
                publicAttr += "    public {0} get{2}(){\r\n        return this.{1};\r\n    }\r\n".format(_type, n, firstChar);

                if (isfill) {
                    fill += "        if (jsonobj.containsKey(\"{0}\")) {\r\n".format(n);
                    var _typefirstChartoUpper = _type.substring(0, 1).toUpperCase() + _type.substring(1);
                    fill += "            entity.set{1}(jsonobj.get{2}(\"{0}\"));        \r\n        }\r\n".format(n, n.substring(0, 1).toUpperCase() + n.substring(1), _typefirstChartoUpper.indexOf("List") >= 0 ? "JSONArray" : _typefirstChartoUpper);
                }
            }
            clas += "==================================\r\n"
            if (!str) {
                if (isfill)
                    clas += "package {1};\r\nimport net.sf.json.JSONObject;\r\nimport net.sf.json.JSONArray;\r\npublic class {0}\r\n{\r\n".format(name || "Root", packageval);
                else
                    clas += "package {1};\r\npublic class {0}\r\n{\r\n".format(name || "Root", packageval);
            }
            else
                clas += str;
            if (isfill) {
                fill += "        return entity;\r\n    }\r\n";
            }
            clas += privateAttr;
            clas += publicAttr;
            clas += fill;
            clas += filllist;
            clas += "}\r\n";
            this._allClass.push(clas);
            return this._allClass.join("\r\n");
        },
        _genTypeByProp: function (name, val) {
            try {
                if (typeof val == "string") {
                    //xxxx(-|/|年)xx(-|/|月)xx(-|/|日) xx:xx:xx
                    var regdt = /^(\d{4})(-|\/|年)(\d{2})(-|\/|月)(\d{2})(日)?(\s((\d{1,2}):)?((\d{1,2}):)?(\d{1,2})?)?$/
                    if (regdt.test(val.trim()))
                        val = new Date(val);
                }
            } catch (e) {

            }
            switch (Object.prototype.toString.apply(val)) {
                case "[object Number]":
                {
                    return { type: val.toString().indexOf(".") > -1 ? "double" : "int" };
                }
                case "[object Date]":
                {
                    return { type: "DateTime" };
                }
                case "[object Object]":
                {
                    name = name.substring(0, 1).toUpperCase() + name.substring(1);
                    this._genClassCode(val, name);
                    return { type: name };
                }
                case "[object Array]":
                {
                    return { type: "List<{0}>".format(this._genTypeByProp(name, val[0]).type), islist: true };
                }
                case "[object Boolean]":
                {
                    return { type: "boolean" };
                }
                default:
                {
                    return { type: "String" };
                }
            }
        },
        convert: function (jsonObj) {
            this._allClass = [];
            return this._genClassCode(jsonObj);
        },
        init : function () {
            var _this = this;
            $("#jsonobjArr2exceljsonobjBtn").click(function () {
                if (!$("#sourceText").val().trim()) {
                    layer.msg("请填写JSON");
                    return false;
                }
                try {
                    var v = eval("(" + document.getElementById("sourceText").value + ")");
                    var res = "";
                    // if ($("#showtype").val() == 0)
                    //     res = _this.JSON2CSharp.convert(v);
                    // else
                        res = _this.convert(v);
                    // $("#result").val(res).siblings("b").hide();
                    jsonTool.resetTextAreaValue("targetText",res);
                } catch (e) {
                    console.error(e);
                    layer.msg("生成实体类异常，请检查JSON是否错误。");
                }
            });
            $("#json2pojoDemoBtn").click(function () {
                jsonTool.resetTextAreaValue('sourceText', "{\n" +
                    "    \"name\":\"es json 在线工具\",\n" +
                    "    \"url\":\"https://www.esjson.com\",\n" +
                    "    \"address\":{\n" +
                    "        \"city\":\"厦门\",\n" +
                    "        \"country\":\"中国\"\n" +
                    "    },\n" +
                    "    \"arrayBrowser\":[{\n" +
                    "        \"name\":\"Google\",\n" +
                    "        \"url\":\"http://www.google.com\"\n" +
                    "    },\n" +
                    "    {\n" +
                    "       \"name\":\"Baidu\",\n" +
                    "       \"url\":\"http://www.baidu.com\"\n" +
                    "   },\n" +
                    "   {\n" +
                    "       \"name\":\"SoSo\",\n" +
                    "       \"url\":\"http://www.SoSo.com\"\n" +
                    "   }]\n" +
                    "}");
            });
            $("#clearBtn").click(function () {
                jsonTool.resetTextAreaValue('targetText', "");
                jsonTool.resetTextAreaValue('sourceText', "");
            });

            var c1 = new EsjsonClipBoard({
                handlerID: 'copy-btn',
                textID: 'targetText',
                isAttr: false,
                type: 'copy'
            });
            // c1.attach();
        }
    },

    jsontoexcel: {
        ctyperow:function (){
            var fgf = "\t";
            // fgf = $("#fgfstr").val()||fgf ;
            var instr = $("#sourceText").val();
            var jsons = JSON.parse(instr);
            if(jsons.length<1){
                layer.msg("数组小于一行数据");return;
            }
            var titles = new Array();
            for (var key in jsons[0]) {
                titles.push(key);
            }

            var values = new Array();
            for (var i = 0, l = jsons.length; i<l; i++) {
                var value = new Array();
                for (var key in jsons[i]) {

                    value.push(jsons[i][key]);
                }
                values.push(value);
            }

            var html = '';
            html+=titles.join(fgf)+"\n"
            for(var i=0;i<values.length;i++){
                html+=values[i].join(fgf)+"\n";
            }
            // $("#targetText").val(html);
            jsonTool.resetTextAreaValue("targetText",html);
        },
        init: function () {
            var _this = this;
            $("#jsonobjArr2exceljsonobjBtn").click(function () {
                _this.ctyperow();
            });
            $("#json2excelDemoBtn").click(function () {
                jsonTool.resetTextAreaValue('sourceText', "[\n\t" +
                    "{\"cid\":\"231015\",\"ip\":\"112.5.244.28\"},\n\t" +
                    "{\"cid\":\"231243\",\"ip\":\"117.179.3.89\"}\n" +
                    "]");
            });
            $("#clearBtn").click(function () {
                jsonTool.resetTextAreaValue('targetText', "");
                jsonTool.resetTextAreaValue('sourceText', "");
            });

            var c1 = new EsjsonClipBoard({
                handlerID: 'copy-btn',
                textID: 'targetText',
                isAttr: false,
                type: 'copy'
            });
            // c1.attach();
        }
    },

    jsonescape: {
        //ctype: 1压缩  2转义  3压缩转义  4去除转义
        escapezip: function (ctype) {
            var _this = this;
            var text = document.getElementById("sourceText").value;
            // console.log(text);
            if (!text.trim()) {
                layer.msg("请输入JSON字符串。");
                return false;
            }

            if (ctype == 1 || ctype == 3) {
                text = text.split("\n").join(" ");
                var t = [];
                var inString = false;
                for (var i = 0, len = text.length; i < len; i++) {
                    var c = text.charAt(i);
                    if (inString && c === inString) {
                        if (text.charAt(i - 1) !== '\\') {
                            inString = false;
                        }
                    } else if (!inString && (c === '"' || c === "'")) {
                        inString = c;
                    } else if (!inString && (c === ' ' || c === "\t")) {
                        c = '';
                    }
                    t.push(c);
                }
                text = t.join('');
            }
            if (ctype == 2 || ctype == 3) {
                text = text.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
            }
            if (ctype == 4) {
                text = text.replace(/\\\\/g, "\\").replace(/\\\"/g, '\"');
            }

            jsonTool.resetTextAreaValue("sourceText",text);
            // return text;
        },
        GB2312UnicodeConverter: {
            ToUnicode: function (str) {
                var txt = escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
                return txt.replace(/%7b/gi, '{').replace(/%7d/gi, '}').replace(/%3a/gi, ':').replace(/%2c/gi, ',').replace(/%27/gi, '\'').replace(/%22/gi, '"').replace(/%5b/gi, '[').replace(/%5d/gi, ']').replace(/%3D/gi, '=').replace(/%20/gi, ' ').replace(/%3E/gi, '>').replace(/%3C/gi, '<').replace(/%3F/gi, '?');
            },
            ToGB2312: function (str) {
                return unescape(str.replace(/\\u/gi, '%u'));
            }
        },
        utozh: function () {
            var _this = this;
            var txtA = document.getElementById("sourceText");
            var text = txtA.value.trim();
            if (!text) {
                layer.msg("请输入JSON字符串。");
                return false;
            }
            // txtA.value = _this.GB2312UnicodeConverter.ToGB2312(text);
            jsonTool.resetTextAreaValue("sourceText",_this.GB2312UnicodeConverter.ToGB2312(text));
        },
        zhtou: function () {
            var _this = this;
            var txtA = document.getElementById("sourceText");
            var text = txtA.value.trim();
            if (!text) {
                layer.msg("请输入JSON字符串。");
                return false;
            }
            // txtA.value = _this.GB2312UnicodeConverter.ToUnicode(text);
            jsonTool.resetTextAreaValue("sourceText",_this.GB2312UnicodeConverter.ToUnicode(text));
        },
        cntoenehar: function () {
            var txtA = document.getElementById("sourceText");
            var str = txtA.value;
            str = str.replace(/\’|\‘/g, "'").replace(/\“|\”/g, "\"");
            str = str.replace(/\【/g, "[").replace(/\】/g, "]").replace(/\｛/g, "{").replace(/\｝/g, "}");
            str = str.replace(/，/g, ",").replace(/：/g, ":");
            jsonTool.resetTextAreaValue("sourceText",str);
        },
        jsonToView : function(){
            var txtA = "";
            try {
                txtA =  JSON.parse($('#sourceText').val());
            } catch (ex) {
                layer.msg('json格式错误: ' + ex);
                return ;
            }
            var editor = new JsonEditor('#targetText', txtA);
            editor.load(txtA);
        },
        jsonToYaml : function(){
            var txtA = "";
            try {
                let jsonObj =  JSON.parse($('#sourceText').val());
                let yamlText = jsyaml.dump(jsonObj);
                console.log(yamlText);
                jsonTool.resetTextAreaValue("sourceText",yamlText);
            } catch (ex) {
                layer.msg('json格式错误: ' + ex);
                return ;
            }
        },
        yamlToJson : function(){
            try {
                let jsonText = JSON.stringify(jsyaml.load($('#sourceText').val()), null, 2);
                console.log(jsonText);
                jsonTool.resetTextAreaValue("sourceText",jsonText);
            } catch (ex) {
                layer.msg('json格式错误: ' + ex);
                return ;
            }
        },

        init: function () {
            var area = $("#sourceText").setTextareaCount({
                width: "30px",
                bgColor: "#FFFF",
                color: "#000",
                // display: "inline-block"
            });

            var c1 = new EsjsonClipBoard({
                handlerID: 'copy-btn',
                textID: 'sourceText',
                isAttr: false,
                type: 'copy'
            });
            // c1.attach();

            $("#json2YamlBtn").click(function () {
                jsonTool.jsonescape.jsonToYaml();
            });
            $("#yaml2jsonBtn").click(function () {
                jsonTool.jsonescape.yamlToJson();
            });
            $("#jsonviewBtn").click(function () {
                jsonTool.jsonescape.jsonToView();
            });
            $("#formatBtn").click(function () {
                jsonTool.jsonFormat();
            });

            $("#jsonzipBtn").click(function () {
                jsonTool.jsonescape.escapezip(1);
            });

            $("#escapeBtn").click(function () {
                jsonTool.jsonescape.escapezip(2);
            });

            $("#jsonzipAndEscapeBtn").click(function () {
                jsonTool.jsonescape.escapezip(3);
            });
            $("#unescapeBtn").click(function () {
                jsonTool.jsonescape.escapezip(4);
            });

            $("#u2hBtn").click(function () {
                jsonTool.jsonescape.utozh();
            });

            $("#h2nBtn").click(function () {
                jsonTool.jsonescape.zhtou();
            });

            $("#ch2enBtn").click(function () {
                jsonTool.jsonescape.cntoenehar();
            });

            $("#clearBtn").click(function () {
                jsonTool.resetTextAreaValue('sourceText', "");
            });
        }
    }
}