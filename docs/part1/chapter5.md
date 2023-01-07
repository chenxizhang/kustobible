# 第五章：外部应用集成

> 作者：陈希章，2023年1月 于上海 
> 专栏：**大数据分析新玩法之Kusto宝典** 第一季：一元初始
> 反馈：[ares@xizhang.com](mailto:ares@xizhang.com)


Kusto 虽然强大，但如果能和其他外部应用无缝地集成，当然是更棒的，谁会拒绝这种好处呢。这一章我们介绍三种常见的集成场景。

1. 与Excel集成
2. 与PowerBI集成
3. 与Jupyter Notebook集成

## 与Excel集成

我们试想一下这样的场景：你的最终用户是一个Excel资深用户，他习惯了在Excel中创建透视表和透视图进行分析，而且他每周的高层会议，也需要用这个格式来进行展示。你需要如何实现这样的目标呢？

我们很容易实现这样的目标。第一步，在 ADE 的查询编辑页面，你可以将需要的数据集准备好，然后在 “Share” 的下拉菜单中选择 “Open In Excel” 即可。

![](../images/Pasted%20image%2020230102201741.png)

这个操作将下载一个 `workbook.xlsx` 的文件，默认情况下这个文件是受保护的，所以你需要在磁盘上找到它，然后在属性面板中，选择 “Unblock”，然后点击 “Ok” 按钮。

![](../images/Pasted%20image%2020230102192945.png)

接下来双击打开这个Excel 文件，在出现的提示中点击 “Enable Content” 按钮。

![](../images/Pasted%20image%2020230102193006.png)

此时会弹出一个身份认证的窗口，请点击 “Sign In”，用你的Microsoft个人或工作账号完成验证，并且点击 “Connect” 按钮。

![](../images/Pasted%20image%2020230102193043.png)

如果一切顺利的话，你很快会在第一个工作表中看到跟在ADE查询编辑器中一样的数据结果。

![](../images/Pasted%20image%2020230102193212.png)

有了这个数据集，你可以在它的基础上进行进一步的分析。本章就不在这方面继续展开了，那属于Excel的基本功能范畴。

但是，你可能会问一个问题，这个跟此前演示过的导出数据有什么区别吗？当然有， 区别就在于，这个数据是可以实时刷新的，它其实不光把数据拉取过来了，而且还保存了对应的数据连接（以及相应的用户身份），在需要时，你只要点击 “Refresh”  按钮（或者快捷键 Alt+F5) 就可以获取到最新的数据了。

![](../images/Pasted%20image%2020230102202544.png)

那么，这是怎么做到的呢？这里用到的技术叫 `Power Query`，它为Excel 访问外部数据提供了一个强大的能力。

![](../images/Pasted%20image%2020230102202800.png)

选中数据区域的任意位置，然后在 “Query” 这个工具栏中，选择 “Edit”，你将看到一个弹出的窗口，这就是 `Power Query Editor`。

![](../images/Pasted%20image%2020230102202954.png)

点击顶部工具栏中的 “Advanced Editor”，你可以看到它具体怎么实现这个查询的。

![](../images/Pasted%20image%2020230102203108.png)

这里的查询语法，也称为 M 语言。即便你目前对它一无所知，我相信你也大致能看懂这个查询，它其实就是建立了一个连接，指定了群集Url，数据库名称，以及具体的查询语句而已。 而查询中的 #(lf) ，应该是一个换行符的意思。

```M
let Source = AzureDataExplorer.Contents("https://help.kusto.windows.net/", "Samples", "StormEvents#(lf)| where StartTime >= todatetime('2007-1-1')#(lf)| project StartTime, EndTime, State, EventType", []) in Source
```

当然，Power Query 和 M 语言又是另外一门有意思的学问，限于篇幅我们这里也无法继续展开了。有兴趣可以参考 <https://learn.microsoft.com/en-us/powerquery-m/>。

说到Excel集成，我还有一个梦想，希望有朝一日能用Kusto 对Excel对象模型，以及工作表数据进行查询分析，如果那能实现，那一定是极好的。

## 与 Power BI 集成

Excel可以实现对结果集的二次加工和利用，但如果要论数据可视化，不管是Excel，还是现在Kusto内置的图表（甚至最新的仪表盘），都无法跟PowerBI 相提并论。而好消息是，Kusto 可以和Power BI 实现无缝集成。

我这里要特别展示用地图分析数据的场景，例如通过下面的查询，我们可以很容易地得到每个州在过去发生的暴风雨的数量，以及造成的农作物和财产损失的情况。

```
StormEvents
| summarize
    count = count(),
    damageCrops = sum(DamageCrops),
    damageProperty = sum(DamageProperty)
    by State
```

那么，我们的需求是，能否展示一个美国地图，然后按照数量多少给每个州着色，并且在上面还要显示财产损失大小的气泡，很抱歉目前在Kusto 自带的图表中暂时还无法快速的呈现，但是Power BI 可以。

那还等什么呢？第一步，仍然是在ADE的 查询编辑中将你想要的数据先确定好，然后点击 “Share” 下拉菜单中的 “Query to Power BI” 菜单。

![](../images/Pasted%20image%2020230102204649.png)

这个操作其实也是把一个Power Query的M 语言查询生成好了，并且保存到了剪贴板。

接下来，你需要打开本地安装的 Power BI Desktop，点击主界面上的 “Transform data” 这个按钮。

![](../images/Pasted%20image%2020230102205934.png)

在接下来出来的 `Power Query Editor` 中，将鼠标放在左侧的导航区域，右键点击，并且选择 “Paste”

![](../images/Pasted%20image%2020230102210109.png)

然后点击 “Edit Credentials”

![](../images/Pasted%20image%2020230102210144.png)

在接下来出现的窗口中完成登录和连接。（你是否注意到，这个跟第一节Excel中的操作很类似，因为他们都是使用Power Query）。

![](../images/Pasted%20image%2020230102210217.png)

如果一切顺利的话，你可以看到如下图所示的数据。

![](../images/Pasted%20image%2020230102210338.png)

接下来你需要点击 “Close & Apply” 这个按钮回到 Power BI Desktop的报表设计界面。

![](../images/Pasted%20image%2020230102210424.png)

接下来我们需要让Power BI 能够识别 State这个字段是代表一个州，请选中这个字段，然后在 “Column tools” 里面设置它的 Data category 为 “State or Province“。

![](../images/Pasted%20image%2020230102210846.png)

请注意，完成这个设置后，这个字段会带上一个地图的小图标。

![](../images/Pasted%20image%2020230102211027.png)

接下来就是选择一个地图控件（请选择 Filled map），然后对其进行设置了。

![](../images/Pasted%20image%2020230102212313.png)



你需要把 State 字段拖动到 ”Location“ 这个位置，然后设置填充颜色。

![](../images/Pasted%20image%2020230102212100.png)

点击上图中的 ”fx“ 按钮，并且按下图所示设置颜色渐变填充。

![](../images/Pasted%20image%2020230102212001.png)

点击 ”Ok“ 后，你就能看到下图所示的效果了。

![](../images/Pasted%20image%2020230102211914.png)

看起来还不错吧，当然这也只是小试牛刀，Power BI非常强大，你还可以发现很多值得研究的功能。


## 与 Jupyter Notebook 集成

这一章最后的集成场景是Jupyter Notebook。我们都知道，数据科学家们会经常使用Python进行数据建模和分析，而现在流行的方式就是用 Notebook啦，Jupyter 也无疑是一个事实上的标准。

想要体验 Jupyter Notebook，最简单的方式就是通过安装 Anaconda 的完整套件，这几乎是全世界所有的数据科学家们的必备工具了，完全免费和开源。它内置安装好了很多模块，其中就包含了Jupyter。

![](../images/Pasted%20image%2020230102212613.png)

安装完成后，在Windows开始菜单处搜索 Jupyter，然后启动 Jupyter Notebook。

![](../images/Pasted%20image%2020230102213045.png)

同时会打开一个浏览器窗口，这就是本地安装好的Jupyter 服务器了。

![](../images/Pasted%20image%2020230102213055.png)

点击 ”New“ 来新建一个Notebook，选择 ”Python 3“。

![](../images/Pasted%20image%2020230102213248.png)

依次输入如下的几行代码，可以快速体验一下在Notebook中查询Kusto 数据，并且用图表进行展示。

```python
# 安装kqlmagic 这个组件
!pip install Kqlmagic --no-cache-dir  --upgrade
# 加载kqlmagic
%reload_ext Kqlmagic
# 登录kusto，请注意，这里根据你的账号不同，请修改tenant的信息，例如我的租户是code365.xyz
%kql AzureDataExplorer://tenant="code365.xyz";code;cluster='help';database='Samples'
# 执行查询
%%kql
StormEvents
| summarize statecount=count() by State
| sort by statecount 
| limit 10
| render piechart title="Storm count by State"
```

请注意一步一步地执行，前面两步可能要的时间比较长。

![](../images/Pasted%20image%2020230102214846.png)

请注意，kqlmagic 目前支持的图表不包含 `timepivot`，`ladder`、`pivotchart`。

有意思的是，在kql查询中，可以直接使用上下文中的Python定义的变量作为参数，例如

![](../images/Pasted%20image%2020230102215553.png)

最后，Kql查询的结果集，还可以转换为 dataframe，以便用于其他数据分析的场景，例如

![](../images/Pasted%20image%2020230102215741.png)
