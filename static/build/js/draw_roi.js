$(function(e){
  e = e || window.event;
  // startX, startY 为鼠标点击时初始坐标
  // diffX, diffY 为鼠标初始坐标与 box 左上角坐标之差，用于拖动
  var startX, startY, diffX, diffY;
  // 是否拖动，初始为 false
  var dragging = false;
  var mouse_down = false;
  var boxId = 20;               // 最多有20个已标注box
  var moveId = 0;

  // 鼠标按下
  document.onmousedown = function(e){
    startX = e.pageX;             // 鼠标按下的起点坐标
    startY = e.pageY;

    if(e.target.className.indexOf("img-main")!=-1){// 如果鼠标在 样本区域 被按下
        // 在页面创建 box
        mouse_down = true;            // 用于控制画矩形框时，右下角点不起来的情况

        var active_box = document.createElement("div");
        active_box.id = "active_box" + boxId;
        active_box.setAttribute("box_id",'box_'+boxId); // 设置
        active_box.className = "box";
        active_box.style.position = 'absolute';
        active_box.style.top = startY + 'px';
        active_box.style.left = startX + 'px';
        document.body.appendChild(active_box);
        // $('#active_box' + boxId).resizable();
        $("[box_id]").resizable();
        active_box = null;                              // 清除变量
        boxId++;
    } else if(e.target.className.match(/box/)) {        // 如果在 标注矩形框  被按下
        // 允许拖动
        dragging = true;

        moveId = e.target.id.replace(/[^0-9]/ig,"");        // 获取当前移动的box的id
        // 计算坐标差值
        diffX = startX - e.target.offsetLeft;
        diffY = startY - e.target.offsetTop;
        }
  };


  // 鼠标移动
  document.onmousemove = function(e) {
      // 画矩形框
      if(document.getElementById("active_box" + (boxId - 1)) !== null && mouse_down) {
          var ab = document.getElementById("active_box"+(boxId - 1));
          ab.style.width = e.pageX - startX + 'px';
          ab.style.height = e.pageY - startY + 'px';
      }

      if(document.getElementById("active_box"+moveId) !== null && dragging) {
          var mb = document.getElementById("active_box"+moveId);
          mb.style.top = e.pageY - diffY + 'px';
          mb.style.left = e.pageX - diffX + 'px';
      }
  };


  // 鼠标抬起
  document.onmouseup = function(e) {

      if(document.getElementById("active_box" + (boxId - 1)) !== null && mouse_down) {
          var ab = document.getElementById("active_box" + (boxId - 1));
          // 如果长宽均小于 3px，移除 box
          if(ab.offsetWidth < 3 || ab.offsetHeight < 3) {
              document.body.removeChild(ab);
          }else{
            layer.prompt({  
                title: '输入车牌号码，并确认', 
                formType: 0,
                btn2: function() {                      // 取消按钮的回调函数
                    createPlateBox(ab, boxId-1, 'none');
                    },
                // 键盘事件，判断enter
                "success": function(){              
                    $("input.layui-layer-input").on('keydown',function(e){
                        if (e.which == 13) {            // 如果是enter键的时候
                            content = $(this).val();
                            layer.close(layer.index);
                            createPlateBox(ab, boxId-1, content);
                        }
                    });
                },
                // 鼠标确定事件
                yes: function(){
                    layer.close(layer.index);
                    var content =$(document.getElementsByClassName('layui-layer-input')[0]).val();
                    createPlateBox(ab, boxId-1, content);
                }

            });
          }
      }
      else if(document.getElementById("active_box"+moveId) !== null) {
        var ab = document.getElementById("active_box"+moveId);
        plate_number = document.getElementById('plate_box' + moveId).innerText;
        updateLoc(ab, plate_number);
      }

      mouse_down = false;               
      dragging = false;             // 进行移动矩形框
  };


    //右键移除该矩形框
    document.oncontextmenu = function(e){
        // 如果鼠标在 box 上按下右键
        if(e.target.className.match(/box/)) {
          document.body.removeChild(e.target);
          delete boxListOfSample[$(e.target).attr('box_id')];
          updateCurTagStatus();
          $('#cur_loc').html('');
          //不继续传递右键事件，即不弹出菜单
          layer.msg('已经成功删除');
          return false;
        }
        return true;
      };

});


function updateLoc(obj, plate_number){
    img = document.getElementById("img");
    x_left = obj.offsetLeft - img.offsetLeft;
    y_left = obj.offsetTop - img.offsetTop;
    x_right = x_left + $(obj).width();
    y_right = y_left + $(obj).height();
    var regionLoc = x_left+','+y_left+','+x_right+','+y_right;
    $('#cur_loc').html(regionLoc);
    // var picId = $('#cur_id').html();
    // var regionClass = $('input[name="radio_region"]:checked').val();
    tagStr = regionLoc+","+plate_number;
    box_id = $(obj).attr('box_id');
    boxListOfSample[box_id] = tagStr;                   // 用数组的方式来存储标注数据
    updateCurTagStatus();
}


function createPlateBox(obj, id, plate_number){
    // 创建一个目标标注框
    var text_box = document.createElement("div");
    text_box.className = "box_label";
    text_box.id = 'plate_box' + id;
    text_box.append(plate_number);              // 添加文字
    obj.appendChild(text_box);
    updateLoc(obj, plate_number);                // 写入标注文件
}


function updateCurTagStatus(){
    tagStrTotal = '';
    for(key in boxListOfSample){
        tagStrTotal+=boxListOfSample[key]+'\n';
    }
    var textarea = $('#annotation_cur_status').val(tagStrTotal);
    textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
}

function updateTotalTagStatus(){
    tagStrTotal = '';
    for(key in boxListOfSample){
        tagStrTotal+=boxListOfSample[key]+'\n';
    }
    var textarea = $('#annotation_total_status').append(tagStrTotal);
    textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
}

