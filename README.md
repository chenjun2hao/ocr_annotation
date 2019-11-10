# ocr标注工具

采用python-flask框架开发图像标注工具,主要思路是在标注的过程中先调用百度/阿里等免费的api进行标注，并进行人工的验证或目标矩形框的修正，同时支持单张图片多个目标的标注。整理想法很简单，但是实现起来还是很麻烦的。大概用了2周的时间（而且是在开源项目上修改来的）。

## 原特点
* B/S方式交互
* 支持多人同时标注（可分配不同标注人员的标注范围，或不同人员标注不同类别）
* 类别采用选择方式，免去手工输入类别工作
* 支持拖拽方式修正标注区域
* 支持键盘方向键切换标注样本

## 增加特性
* 增加百度api/自用api调用的接口
* 支持百度api检测结果的调整
* 采用lmdb做数据库，用图片名做key进行保存
* 支持单张图片，多目标的标注



## 使用方法
1. 根据`requirements.txt`安装环境依赖
```buildoutcfg
$ cd od-annotation
$ pip3 install -r requirements.txt
```
2. 将需要标注的图片放到：'dataset/images/'

3. 启动/停止/重启标注工具：
```buildoutcfg
$ cd od-annotation
$ python3 app.py --start|stop|restart  # 前台进程方式运行
$ python3 app.py --start|restart --daemon  # 以后台进程方式（重新）启动
```
4. 访问`http://localhost:5000`开始标注。整个标注流程是：1.先调用百度api; 2.将百度的结果画出来，并调整； 3.保存结果/下一张。其中可以用左键移动矩形框，并可以在矩形框右下角进行大小调整。右键点击矩形框可以删除当前标注的矩形框。`当前样本标注状态`会同步更新标注信息。 `所有样本标注状态`用的原作者的，可能会有错误，没有关系。

5. 点击左右方向按钮或通过键盘方向键切换标注样本。切换时自动提交标注结果，或手动点击`保存`按钮提交标注结果。

6. 标注文件在`dataset/labels/`中，是lmdb数据库。标注格式为:`{'img_name': 'x1,y1,x2,y2,label\nx12,y12,x22,y22,label2\n'}`,标注的是左上和右下的坐标


## reference
borrowed code from [od-annotation](https://github.com/hzylmf/od-annotation)，thanks！
