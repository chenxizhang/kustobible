# 第三章：数据可视化

> 作者：陈希章，2023年1月 于上海 
> 专栏：**大数据分析新玩法之Kusto宝典** 第一季：一元初始
> 反馈：[ares@xizhang.com](mailto:ares@xizhang.com)



数据可视化为数据分析带来了新的价值，这句话不是哪个伟人而是我自己说的。数据当然本身是有价值的，它也许像一个朴实无华的书生一样，从内而外地透着知识的芳香，但是可惜的是，能真正闻香识人的人毕竟不多。 数据可视化，它深谙了人间世故，一颦一笑，举手投足，哪怕不说话，一个眼神，也能把数据的内涵表现出来。

当然，两者是相互依存的，如果数据本身质量很差，再好的数据可视化，也就是灯红酒绿之下的昙花一现。这一章将跟大家介绍一下Kusto 自带的数据可视化能力，它包含了查询图表，以及最新预览的仪表盘。


## 查询图表

查询图表，指的是在查询中可以直接呈现的报表。它是通过 `render` 这个操作符来实现的，在前面文章中提到过， `render` 从严格意义上来说不属于 KQL （Kusto Query Language) 的范畴，它也只能在特定的工具（Kusto.explorer 和 ADE Web UI）中才能起作用，而且它具体呈现的效果也取决于特定的客户端。

![](../images/Pasted%20image%2020230103100456.png)
 
### 基本图表

常见的图表有如下六种：面积图 (`areachart / stackedareachart`) ，条形图 (`barchart`)，柱状图 (`columnchart`)，线图 (`linechart`)，饼图 (`piechart`) 和散点图 (`scatterchart`) 。

#### 面积图 - `areachart / stackedareachart`

面积图

```
StormEvents
| summarize count() by State
| order by  count_ desc
| render  areachart
```

![](../images/Pasted%20image%2020230103101719.png)

#### 条形图 - `barchart`

条形图和柱状图很类似，你可以简单地理解条形图是从左到右显示的柱状图。

```
StormEvents
| summarize count() by State
| order by  count_ desc
| render barchart
```


![](../images/Pasted%20image%2020230103101837.png)


#### 柱状图 - `columnchart`

```
StormEvents
| summarize count() by State
| order by  count_ desc
| render columnchart
```

![](../images/Pasted%20image%2020230103102123.png)

#### 线图 - linechart

```
StormEvents
| summarize count() by State
| order by  count_ desc
| render linechart
```

![](../images/Pasted%20image%2020230103111955.png)


#### 饼图 - piechart

饼图非常直观地分析某类事物的某个数值所占的比例。

```
StormEvents
| summarize count() by State
| top 5 by count_
| render piechart
```

![](../images/Pasted%20image%2020230103112052.png)

#### 散点图 - scatterchart

这个图一般x和y轴都是数字，主要观察两者的关联性，例如一个人的智商高低，跟他能赚的钱是否存在某种神秘的关系，或者本例的暴风雨的次数和造成农作物损失之间的关系。

```
StormEvents
| summarize count(), sum( DamageCrops) by State
| render scatterchart with (xaxis=log , yaxis=log )
```

![](../images/Pasted%20image%2020230103112409.png)

### 时序图表

我们都知道Kusto大部分的分析都与时间有关系，所以我最喜欢的图表就属于时序图表了。

#### 时间表 - timechart

以时间为轴，可以针对一个或者多个y 值进行分析。

```
StormEvents
| where EventType in ( "Hail","Flash Flood")
| summarize count() by EventType, bin(StartTime,2d)
| render timechart
```

![](../images/Pasted%20image%2020230103151939.png)

#### 异常表 -anomalychart

这是时间表的一种变种，它结合了一些机器学习的算法，可以在时间表中标记出来可能的异常值。

```
Trips
| make-series avgoffare = avg(fare_amount) on pickup_datetime from datetime(2011-4-1) to datetime(2011-5-1) step 1h by vendor_id
| where vendor_id == "CMT"
| extend  (anom,baseline,score) = series_decompose_anomalies(avgoffare, 3,0)
| render anomalychart with (anomalycolumns=anom)
```

这里的 `series_decompose_anomalies` 是一个封装好的函数（暂时可以理解为是一个黑盒子吧），它可以根据一定的算法推测一个序列中的异常值。详情可以参考 https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/series-decompose-anomaliesfunction 。 

下图中的红色点就是表示异常值。本例是检测 CMT 这家出租车公司在 2011-4-1 到2011-5-1 期间，是否有收费异常的情况。

![](../images/Pasted%20image%2020230103163855.png)

### 地图

这是我自己加的一个类别，其实如你所见，Kusto 并没有直接提供所谓的地图可视化能力。但它有一个很特殊的设计，就是在以上的一些图表中，支持一种特殊的子类型 —— map。

拥有map 这个子类型 (kind) 的图表有如下几种

1. piechart
3. scattercahrt

#### piechart + map

下面的查询，先筛选在某个经纬度（-81.3891，28.5346）方圆100公里内的记录，然后根据EventType统计暴风雨的数量，然后用饼图显示数量的大小，在地图上。

```
StormEvents
| project BeginLon, BeginLat, EventType
| where geo_point_in_circle(BeginLon, BeginLat, real(-81.3891), 28.5346, 1000 * 100)
| summarize count() by EventType, hash = geo_point_to_s2cell(BeginLon, BeginLat)
| project geo_s2cell_to_central_point(hash), count_
| extend Events = "count"
| render piechart with (kind = map)
```

这个地图看起来有点怪怪的，但好歹是那么一个意思吧。要注意的是，要访问这个地图，需要能够科学上网，所以实际上这个地图的实用价值不是很高。由于功能有限，同时又有这么多限制，而且要展示的语法还相对比较复杂，如果你真的需要用地图，请参考 [[第五章 - 外部应用集成#与 Power BI 集成|第五章中关于PowerBI 集成]] 的介绍。

![](../images/Pasted%20image%2020230103193919.png)

### 其他图表

Kusto还支持几个特殊的图表（或者叫可视化元素），下面简单地做一个介绍。

#### 卡片 - card

这个用来展示单一的数据值。例如统计暴风雨的总数，并且用一个显著的大字体显示。

```
StormEvents
| count
| render card
```

![](../images/Pasted%20image%2020230103200113.png)

#### 表格 - table

这个是默认的，其实用不着 `render` 就是这个效果。


#### 透视表 - pivotchart

这个只在Kusto.explorer中有效，其实它相当于是给了一个特定的窗口，让用户可以在给定结果集基础上进行透视表操作。

```
StormEvents
| take 1000
| render pivotchart
```

下面这个窗口是独立的，我们可以根据需要设置行，列字段，以及统计字段。这个跟在Excel中做很类似。

![](../images/Pasted%20image%2020230103200752.png)

虽然这个图表在 ADE Web UI中无法使用，但也可以通过其他方式实现。下图的结果窗口中，也有一个Pivot Mode， 而我个人觉得这里的效果可能更好。

![](../images/Pasted%20image%2020230103201648.png)


#### 时间透视表 - timepivot

这个功能也是Kusto.explorer 特有的，而且特别有意思。它可以让我们用一种全新的方式来分析数据，尤其是你希望按照时间来随意筛选结果集的话。

下图中的有各种色块的区域，可以一目了然在哪些时间段当前的类别是有数据的，然后你还可以随意点击，然后结果集会跟着筛选变化。

![](../images/Pasted%20image%2020230103201932.png)

#### ladderchart

这个功能也是Kusto.explorer 特有的，有点像甘特图。下面是一个例子。

```
StormEvents
| project State, EventType, StartTime,EndTime
| render ladderchart
```

请注意，这里的查询的后面两个字段必须是日期和时间，它其实是会计算一个时间段，用来表示y 坐标上面的分类或事件发生的次数，以及每次的时间。

![](../images/Pasted%20image%2020230104135142.png)

### 图表选项

在上面的图表演示中，你可能注意到，个别的例子查询中带有 `with`  这个关键字，它是用来定义图表选项的，了解这些选项对于你能做出更加强大的图表会有很大的帮助。

| 选项           | 含义                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| accumulate     | 是否按照累计值显示图表，这个用在柱状图会非常有用。可选值为 `true` 和 `false`                                     |
| title          | 图表标题                                                                                                         |
| xtitle         | x 轴标题                                                                                                         |
| ytitle         | y 轴标题                                                                                                         |
| series         | 系列字段 ，可以有多个                                                                                                               |
| legend         | 是否显示图例，默认为 `visible` ，另外可选值为 `hidden`                                                           |
| xaxis          | x 轴显示的类型，是线性 `linear` 的还是按照指数 `log` 显示                                                        |
| yaxis          | y 轴显示的类型，是线性 `linear` 的还是按照指数 `log` 显示                                                        |
| kind           | 图表子类型，不同的图表提供不同的类型                                                                             |
| xcolumn        | x 轴的字段（只能有一个）                                                                                         |
| ycolumns       | y 轴的字段（因为是二维图表，应该最多也就是两个吧，用逗号分开）                                                   |
| ymin           | y 轴的数值最小值                                                                                                 |
| ymax           | y 轴的数值最大值                                                                                                 |
| ysplit         | 怎么拆分y 轴，这个用在多个y轴的情况下特别有用，可用值为 `none` 和 `axes` (多个坐标轴), `panels` 通过多个图表显示 |
| anomalycolumns | 这个选项只适合于 anomalychart，指定标记异常值的字段                                                              |

下面看几个小例子

```
StormEvents
| summarize count(), sum(DamageProperty) by State
| top 5 by count_ desc
| render barchart  
    with (
    title= "StormEvents by State",
    xtitle= "State",
    ysplit= panels)
```

![](../images/Pasted%20image%2020230104142547.png)

```
StormEvents
| summarize count(), sum(DamageProperty) by State
| top 5 by count_ desc
| render linechart
    with (
    title= "StormEvents by State",
    xtitle= "State",
    ysplit= axes,
    xcolumn= State,
    ycolumns= count_, sum_DamageProperty)
```

![](../images/Pasted%20image%2020230104142717.png)

```
StormEvents
| where State  in ('FLORIDA','KENTUCKY','GEORGIA')
| where EventType  in ('Hail','Flash Flood')
| where Source  in ('Public','ASOS')
| summarize count() by EventType, State, Source
| render  columnchart with (ycolumns= count_, series= EventType, Source)
```

![](../images/Pasted%20image%2020230104145108.png)


## 仪表盘

到目前为止，我们已经拥有了很强大的能力，可以直接在查询中分析数据，甚至展示图表。这个对于即席式查询分析（Adhoc) 的场景特别有用，这也是我将 Kusto 视为启发式和探索式分析工具的一个主要原因 —— 它给了我们前所未有的自由度，在针对大量数据进行快速分析的道路上前进了一大步。

但是，如果你有定期需要做汇报的需求，或者你希望将最常见的分析场景分享给同事，而他们并不需要掌握 Kusto 的技巧就能看到结果（虽然学习Kusto本身有趣），那么你可能就需要做成报表，或者利用 Kusto 自带的仪表盘来实现。

> 请注意，这个仪表盘仅在 ADE Web UI 上可用，且还处于预览阶段，有些地方还不成熟，而且后期可能也可能会改变设计。

你可以通过两种方式来使用仪表盘， 分别是 `Pin to dashboard` 以及 `从头开始自己做`。

### Pin to dashboard

这种方式很直接，也最简单实用。你就是按照正常的方式，先编写查询，观察是否符合你的需求，然后在 `Share` 这个下拉菜单中选择 `Pin to dashboard` 即可。

![](../images/Pasted%20image%2020230104145558.png)

然后在滑出的面板中输入必要的信息，例如

![](../images/Pasted%20image%2020230104150643.png)

点击 `Pin` 按钮，就可以完成dashboard的创建。

![](../images/Pasted%20image%2020230104150805.png)

请注意，这里看到的图表可能跟你在查询窗口看到的略有不同。每个放在仪表盘上面的组件（专业术语为 Tile —— 磁贴）也可以移动位置，调整大小等。

基本操作就是这样，你可以根据需要不断地将你要的结果 `Pin` 过来，这样就自然而然地组成了一个仪表盘了。

![](../images/Pasted%20image%2020230104151632.png)



### 从头开始创建仪表盘

除了上面提到的傻瓜式操作之外，等你更为熟悉了之后，你也可以从头开始创建自己的仪表盘。

![](../images/Pasted%20image%2020230104151819.png)

一个仪表盘，其实可以由多个页面（Page）组成，然后每个页面，又是由一个或多个磁贴（Tile）组成，这些磁贴背后都是一个Kusto查询，他们可以基于一个或者多个数据源进行查询，同时还可以为页面，或者磁贴定义参数，设计交互性的功能（例如跳转），最后，你甚至可以通过添加文本组件，编写自定义的Markdown内容，为你的仪表盘实现更多有意思的效果。

![](../images/Pasted%20image%2020230104152154.png)

#### 创建和使用数据源

点击上图中的 `Add tile` 按钮，会出现让你选择或创建数据源的界面。这里需要定义数据源名称，群集地址和数据库名称。

![](../images/Pasted%20image%2020230104152250.png)

你还可以控制查询结果的缓存时间。这个对于提高查询性能会有极大的帮助，尤其是你的数据并不是经常更新的情况下。

![](../images/Pasted%20image%2020230104152449.png)

你可以在一个仪表盘中定义多个数据源。你可以在每次创建磁贴（Tile）时选择创建，或者

![](../images/Pasted%20image%2020230104152857.png)

#### 编辑查询

定义好数据源之后你就可以定义查询和可视化组件了。请注意，这里的查询，不需要编写 `render` 子句，而是通过图形化的方式来进行配置。

如果你仔细看一下，其实这个图形化配置的界面，上面的选项跟此前提到的那一些几乎是一样的。

![](../images/Pasted%20image%2020230104152756.png)

在这个页面，你一定不要忘记修改 Tile 的名称，并且最后点击 "Apply changes"。

![](../images/Pasted%20image%2020230104160810.png)


#### 设计参数

参数化可以给你的仪表盘带来更加强大的功能和灵活性。事实上，因为 Kusto 大部分时候都是分析跟时间相关的，所以每个仪表盘默认都已经带有一个参数，叫时间范围（Time range）。

![](../images/Pasted%20image%2020230104161150.png)

准确地说， Time range 是两个参数，一个叫 _starttime , 一个叫 _endtime

![](../images/Pasted%20image%2020230104161608.png)

你可以自由地选择需要的时间段，甚至自定义范围。但是你可能发现，你的选择并没有改变图表的任何信息。这是对的，因为你还没有在查询中使用这些参数。下面我们来看看如何使用吧。

![](../images/Pasted%20image%2020230104161322.png)

按照上面这样修改后，不要忘记 "Apply changes"，回到仪表盘界面后，你会发现刚才那个磁贴似乎出错了。

![](../images/Pasted%20image%2020230104164249.png)

不要害怕，这其实是因为在当前这个时间段没有数据而已（这个设计有待改进），因为这个范例数据库中的时间比较早了，如果你调整成下面这样，就可以看到效果了。

![](../images/Pasted%20image%2020230104164441.png)

![](../images/Pasted%20image%2020230104164450.png)

你当然可以自己创建更多的参数，在仪表盘的编辑 （Editing）模式，点击顶部的参数 （Parameters）按钮，可以进入参数面板，然后再点击 "New Parameter"。下面的示例，我定义了一个 EventType 的参数，它提供了一个下拉框选择，而且下拉框的值，也可以来自于一个查询。请注意，通常参数的名称，我们习惯性加一个下划线开始，而且全部小写。

![](../images/Pasted%20image%2020230104164848.png)

下面的示例演示了如何在查询中使用这个新的参数。

![](../images/Pasted%20image%2020230104165150.png)


#### 交互性设计

仪表盘还支持用户的交互性操作，例如你点击了一个柱状图上面的某个柱子，你可以改变某个参数的值（以便同时改变其他磁贴的数据），或者跳转到其他页面。

下面这个实例展示了如何根据用户的点击，改变参数的值。

![](../images/Pasted%20image%2020230104170005.png)

下面这个实例展示了页面跳转的操作，这是通过创建新的钻取（Drillthrough）来实现的。

![](../images/Pasted%20image%2020230104170414.png)


完成这个设置后，在你的柱状图上面点击右键，会有 Drill through to 的菜单，里面列出了可以跳转的页面。

![](../images/Pasted%20image%2020230104170529.png)

点击 ”Page2“ ，你会看到仪表盘跳转到了对应的页面，而且参数值也相应地修改，所以下面的图表也随之发生了变化。

![](../images/Pasted%20image%2020230104170628.png)

请注意，你做了任何修改，一定不要忘记保存修改。如果你是修改某个磁贴（Tile），要记得 "Apply changes"，如果你是修改了页面内容，例如调整了布局或者添加了新的磁贴，要记得点击保存按钮。

![](../images/Pasted%20image%2020230104170904.png)



#### 文本组件

除了可以添加Kusto查询和可视化组件，仪表盘还支持添加 “文本组件”，这将允许你用 `Markdown` 的语法编写任何内容，一般用来添加报表说明。

你可以在仪表盘的 Editing 模式下，点击 Add 下拉菜单中的 Add text 菜单。

![](../images/Pasted%20image%2020230104171151.png)

你可以用标准的 `Markdown` 语法输入文本，并且可以实时预览。

![](../images/Pasted%20image%2020230104171443.png)

和其他的磁贴（Tile）可以组合出来丰富多彩的仪表盘。

![](../images/Pasted%20image%2020230104171604.png)

### 分享和权限管理

本章的最后部分来看一下如何分享仪表盘，以及要注意的权限事项。

#### 导出文件

首先，你可以把仪表盘保存为本地文件，以便后续使用或者分享给你的同事。

![](../images/Pasted%20image%2020230104171800.png)

它会生成一个 json 文件，利用这个文件，可以很方便地导入，生成新的仪表盘。

> 不要忘记保存哦。

![](../images/Pasted%20image%2020230104171857.png)

#### 设置权限并分享链接

另外一种常见的分享方式是设置权限并分享链接，这样对方可以直接通过点击链接，进入ADE Web UI 界面查看甚至进行编辑。

![](../images/Pasted%20image%2020230104172216.png)

目前，你可以分享给组织内的同事（或一个组），输入姓名或邮箱即可搜索，支持的权限有 Can view (只读) 和 Can edit （可编辑）两种。

![](../images/Pasted%20image%2020230104172239.png)

最后你可以点击 “Copy link” 按钮复制链接，并且用你最方便的方式发给需要的同事。例如我的这个仪表盘的地址是：<https://dataexplorer.azure.com/dashboards/6d3f3ebd-558a-434b-b451-db8db6d6e054> ,  请不要尝试点击，因为你没有权限的。

> 目前仪表盘不支持匿名分享，用户必须跟作者是一个组织的同事。

#### 注意事项

当你兴冲冲地进行了上面的权限设置，并且复制了链接给一个同事，但他很可能还是无法打开它。原因在于，目前的设计是你不仅要分享仪表盘的权限，还需要分享底层的数据库的权限。

> 这个功能在重新设计，应该后续不需要这么麻烦。

这个操作可以通过下面的控制命令来实现。

```
.add database Samples viewers ('aadgroup=all@code365.xyz','aaduser=49bad7d2-c8f1-4bf8-833d-49cc26660e0d;panda@code365.xyz')
```

要执行这个操作，需要数据库管理员的角色（请注意，你在 help 这个群集是没有这个权限的）。控制命令并不是这一季的重点，我们只是在需要用的时候，就直接用，并没有系统性地介绍它。后续会有专门的章节来展开。

关于这个权限设置，详情可以参考 <https://learn.microsoft.com/en-us/azure/data-explorer/kusto/management/security-roles>。
