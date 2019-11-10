/**
 * 业务相关的JS处理代码
*/
sampleCount = 0;
boxListOfSample = {}; //一张样本图片的标注集合(box_id为key)
names = [];           // 图片的列表
var sampleCurrentIndex=0;       // 数组是从0开始计数的

$(function(){
    get_names();                                // 获得总的图片文件列表
    $('#total').text(names.length);

    loadSamplePic(sampleCurrentIndex);          // 载入一张样张
    
    $('#side_left').click(function(){
        $('#annotation_cur_status').val("");    // 先清空显示区域
        $('#btn_save').click();                 // 进行保存
        sampleCurrentIndex -= 1;
        if(sampleCurrentIndex<0){
            sampleCurrentIndex = sampleCount-1;
        }
        loadSamplePic(sampleCurrentIndex);
    });
    $('#side_right').click(function(){
        $('#annotation_cur_status').val("");    // 先清空显示区域
        $('#btn_save').click();
        sampleCurrentIndex += 1;
        if(sampleCurrentIndex >= sampleCount){
            sampleCurrentIndex = 0;
        }
        loadSamplePic(sampleCurrentIndex);
    });
    $(document).keyup(function(event){
      if (event.keyCode === 37){//left
        $('#side_left').click();
      }else if(event.keyCode === 39){//right
        $('#side_right').click();
      }
    });
    $('#jump_page').keypress(function(e){       // 键盘按下，判断是否是enter键
        if(e.keyCode==13){
            var indexStr = $(this).val();
            index = parseInt(indexStr);         // 转成整数
            if(index<=0 || indexStr==''){
                index = sampleCurrentIndex;
            }else if(index>sampleCount){
                index = sampleCount;
            }
            sampleCurrentIndex = index;
            loadSamplePic(index);               // 显示图片
        }
    });

    $('#btn_save').click(function(){            // 保存按钮
        if (JSON.stringify(boxListOfSample) == '{}'){
            layer.msg('请先进行标注');
            return;
        }
        tagStrTotal = '';                   // 用于显示的string
        for(key in boxListOfSample){
            tagStrTotal+=boxListOfSample[key]+'\n';
        }
        var tname = $('#cur_id').html();
        tname = tname + ',' + tagStrTotal;
        saveRegionInfo(tname);
        $('#cur_loc').html('');
        updateTotalTagStatus();
        boxId = 20;                          // 一张图片的box计数id，因为载入已经有标注信息的box是从id：1开始编号的
        boxListOfSample = {};
    });
    get_labels();
    $('#radio-type').click(function(){
        $(document).focus();
    });
});

// 获得需要标注的图片名列表
function get_names(){
    $.ajax({
        type : 'GET',
        dataType: "json",
        url : "/api/annotation/names?" + new Date(),
        async: false,                   //改为同步方式
        beforeSend : function(){},
        success : function(result){
            if(result.message=='success'){
                for (var i in result.data){
                    names[i] = result.data[i];
                }
            }
        },
        error : function(){
            $(document).write('something is error');
        }
    });
}


function get_labels(){
    $.ajax({
		type : "GET",
		dataType : "json",
		url : "/api/annotation/labels?"+new Date(),
		beforeSend:function(){
		},
		success : function(result){
		    if(result.message=='success'){
		        var html = '标注类型：';
		        index = 0;
		        for (var i in result.data){
		            var id = 'region_'+result.data[i].name;
		            var value = result.data[i].name;
		            var text = result.data[i].desc;
		            if(index==0){
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" checked="checked" id="'+id+'" value="'+value+'">';
		            }else{
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" id="'+id+'" value="'+value+'">';
		            }
		            html += ' '+text+'</label>';
		            index++;
		        }
                $('#radio-type').html(html);
		    }
		},
		error: function(){
		}
	});
}

function loadSamplePic(index){
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/api/annotation/sample?index="+ names[index] +'&time='+new Date(),
        async: false,                   //改为同步方式
        beforeSend: function(){},
        success: function(result){
            $('#img').css({"background":"url(data:image/png;base64," +result.img+ ") no-repeat left top"});
            $('#cur_id').html(names[index]);
            $('.box').remove();
            $('#cur_loc').html(result.coor_label);
            if (result.coor_label !== 'none'){             // 如果矩形框不是none则画出
                var id = 1;
                tcoor = result.coor_label.split('\n');
                for(key in tcoor){
                    if (tcoor[key] != ""){
                        percoor = tcoor[key];
                        coor = percoor.split(','); 
                        text = coor[4];
                        x1 = parseInt(coor[0]); y1 = parseInt(coor[1]); x2 = parseInt(coor[2]); y2 = parseInt(coor[3]);
                        drawRoi(x1, y1, x2-x1, y2-y1, id, text);
                        id++;
                    } 
                }
                
            }
        },
        error: function(){}
    });
}


function saveRegionInfo(tagResult){
    $.ajax({
		type : "POST",
		dataType : "json",
		url : "/api/annotation/save?"+new Date(),
		data : {'tags':tagResult},
		beforeSend:function(){
		},
		success : function(result){
		    layer.msg(result.message);          // 显示success的提示框
		},
		error: function(){
            layer.msg('error!');
		}
	});
}


function drawRoi(x1, y1, w, h, boxId, text){
    // 创建标注的矩形框
    var active_box = document.createElement("div");
    active_box.id = "active_box" + boxId;
    active_box.setAttribute("box_id",'box_'+boxId); // 设置
    active_box.className = "box";
    active_box.style.position = 'absolute';
    x1 = x1 + $('#img').offset().left;
    active_box.style.left = x1 + 'px';
    active_box.style.top = y1 + 'px';
    active_box.style.width = w + 2 + 'px';
    active_box.style.height = h + 2 + 'px';     
    document.body.appendChild(active_box);          // 坐标不对
    $("[box_id]").resizable();
    active_box = null;
    // 打上文字标签
    var ab = document.getElementById("active_box"+boxId);
    createPlateBox(ab, boxId, text);

}

function isPassword(str) {
	var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}/;
	return reg.test(str);
}

//时间戳转换成八位日期
function format2Date(uData){
	var myDate = new Date(uData);
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	return year + '-' + month + '-' + day;
}

//时间戳转换成时间字符串
function format2Time(uData){
	var myDate = new Date(uData);
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	var hour = myDate.getHours();
	var minute = myDate.getMinutes();
	var second = myDate.getSeconds();
	return year + '-' + month + '-' + day+' '+hour+':'+minute+':'+second;
}

function PrefixInteger(num, length) {
 return (Array(length).join('0') + num).slice(-length);
}