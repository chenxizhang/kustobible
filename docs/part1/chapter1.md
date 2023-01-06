# 第一章：Kusto 简介

> 作者：陈希章，2023年1月 于上海 
> 专栏：**大数据分析新玩法之Kusto宝典** 第一季：一元初始
> 反馈：[ares@xizhang.com](mailto:ares@xizhang.com)



## 基本概念

Kusto （及其商业化版本 Azure Date Explorer ，简称ADX）是一套大数据分析工具，它是数据库，但也不完全是数据库。在你考虑是否要采用 Kusto 还是传统的数据库或者其他开源解决方案时，开源参考下面的这个决策图。 

> 除非特别说明，本书将主要使用 Kusto 这个名称，但它可以视同于跟 ADX 一样。

![](../images/Pasted%20image%2020221227090341.png)

它既拥有海量数据的存储和计算能力，但又提供了接近实时的即席查询的能力，可以说改变了大数据分析的方式。目前 Kusto 的引擎版本V3， 在性能方面有着更加优越的表现。

![](../images/Pasted%20image%2020221228113613.png)

它既可以从数据湖中的大量日志文件中导入数据，也可以与 `IoT Hub` 或 `Event Hub` 配合进行流式数据导入，它也可以直接查询来自 `SQL Server` 或 `Cosmos DB` 中的结构化或非结构化数据。

这些数据，不管到底是什么格式和来源，都可以用一套标准（且非常强大）的查询语言（KQL : Kusto Query Language ) 进行启发式、探索式地实时分析。

另外， Kusto 提供了API 和接口，可以与很多其他的工具进行整合，实现无限可能。

![](../images/Pasted%20image%2020221227090123.png)

总结起来，Kusto有如下的亮点。

## 主要亮点

1. 超大规模数据支持 （存算分离，分布式集群）
	1. 支持不同的数据源（结构化，非结构化，半结构化）
	2. TB级别数据量分钟级别传输
	3. PB级别数据查询，秒级响应
2. 超级好用的查询语言（KQL)
	1. 启发式和渐进式（管道式，智能提示）
	2. 简单，但强大
	3. 安全 （查询和管理命令分开）
3. 原生的高级分析功能
	1. 内置机器学习函数（时序分析，异常检测，回归和预测等）
	2. 支持嵌入python 代码和R 代码
4. 完善工具集的支持
	1. 数据导入向导
	2. 数据可视化组件和连接器
	3. 自动化工具和能力

学习 Kusto 最好的方式就是动手，在查询的过程中感知和体验它的设计和精妙之处。而最好的方式就是从范例数据库开始。

## 范例数据库

这一季的所有案例，几乎都可以通过官方提供的范例数据库来完成实验，你不需要购买任何资源。请在浏览器中打开  https://dataexplorer.azure.com/clusters/help/databases/Samples 来访问范例数据库。

如果你是第一次使用，则会被要求登录。这里你可以用自己的Microsoft 个人账号（例如 `hotmail.com` 或 `live.com` ，及`outlook.com` 等）登录，也可以用工作账号（例如 Microsoft 365账号）登录。

> 没有上述的账号？ 你可以将自己的其他邮箱（例如 `qq.com` ）注册为一个 Microsoft 个人账号，具体操作步骤请参考[这里](https://support.microsoft.com/zh-cn/account-billing/%E5%A6%82%E4%BD%95%E5%88%9B%E5%BB%BA%E6%96%B0%E7%9A%84-microsoft-%E5%B8%90%E6%88%B7-a84675c3-3e9e-17cf-2911-3d56b15c0aaf)的说明。 

![](../images/Pasted%20image%2020230104194949.png)
![](../images/Pasted%20image%2020230104195015.png)


完成身份验证后就可以进入范例数据库的页面。这个页面，在我们后续的章节中，将简称为 ADX Web UI。这里的ADX 是 Azure Data Explorer 的缩写，而由于它是一个网页版，所以你可以随时随地地访问，不需要安装任何本地的工具。本书将主要以这个界面做演示。

> 请注意，你在这个范例数据库中只有查询的权限，不能创建任何对象，也无法修改任何的设置。

![](../images/Pasted%20image%2020230104195551.png)

你可以在查询编辑窗口（上图中的空白区域），输入如下的查询，然后点击 “Run” 进行执行，这就是Kusto 版本的 Hello,World了。

```
print "hello,Kusto"
```

![](../images/Pasted%20image%2020230104215441.png)


## ADX Web UI 一览

下面我们简要的浏览一下ADX Web UI。为了不至于让你迷失方向，我们不会讲解所有的功能，而是尽量专注在跟查询有关的功能上。

### 对象管理器

学习一个新的平台或技术，最好能简单地了解它内部对象的种类及其之间的关系。

![](../images/Pasted%20image%2020230104220512.png)

从上图可以看出，Kusto 主要有如下几类对象

| 对象                       | 描述                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 群集 Cluster               | 类似于服务器的概念，但它不是只有一个物理服务器，而是由很多个节点组成的逻辑服务器。本例中，help 是一个群集，而它的完整地址是 https://help.kusto.windows.net                                            |
| 数据库 Database            | 这是数据存储的一个容器（或边界）。一个群集上面可以有多个数据库，他们相互之间是隔离的。  本例中，help 群集中有7个数据库，而我们用的最多的就是 Samples这个数据库。                                      |
| 表 Table                   | 表用来真正存储数据，它定义了一个或者多个列（Column），每个列都有自己的数据类型 （Data Type） 。我们在本书中用到最多的一个表就是 StormEvents ，它记录了 2007年美国发生的暴风雨的情况。                 |
| 外部表 External Table      | Kusto 所查询或处理的数据，可以不存在当前群集或数据库，这也正是它的强大之处。外部表不会占用空间，它只在查询期间进行数据读取并处理。例如这些数据可以以 csv 格式存储在 Azure Storage 或者数据湖中。      |
| 函数 Function              | 函数一般用于自定义一个查询结果，或者干脆就是一个简单的运算（例如把两个输入参数相加），它还有一个特殊用途，就是用来创建视图 （View）。视图是不带参数的函数，并且它的返回值是一个表，而不是一个标量值。 |
| 物化视图 Materialized View | 物化视图在很多现代数据库系统中都有。它定义了一个聚合计算，而且它会把计算结果保存起来，这是它跟普通的视图的根本区别。物化视图会自动根据来源表的变化而重新计算，通常是会增加新的聚合计算的结果。        |

在ADX Web UI中，表、外部表、函数和物化视图，还可以通过自定义的文件夹来组织。

### 查询编辑器

不得不说，我喜欢 Kusto 的一个可能是最大的原因是因为编写 Kusto 查询是真的很方便，真正释放了我的潜能。这是怎么做到的呢？

其实关键就是 Kusto 的查询编辑器提供了前所未有的智能提示功能，这让我在编写的时候，可以不需要记住那么多的关键字，表名和字段名，它会聪明地根据上下文自动地给我列出来，我可以直接选择，甚至通过它的提示，我可以学习到一些此前可能还不太注意的函数，这就是我在序言中将其称之为 “**启发式和探索式**” 的原因。

Kusto 的查询是把要查询的目标数据（不管是表，还是视图，函数，物化视图）放在语句的最前面，这也为编辑器能进行推断提供了可能性。

![](../images/Pasted%20image%2020230105110323.png)

输入一两个字母后，在出现的智能提示列表中选择你想要的，然后回车，查询编辑器会自动换一行，而且加上一个管道符（ | ）， 光标则继续定位到空白位置，这样你就可以继续输入想要的关键字了。

![](../images/Pasted%20image%2020230105110520.png)

你还可以很直观地看到这些关键字（可能是操作符，函数，或者字段名等）的相关帮助信息，如果屏幕够大，那是非常地一目了然的。如果确定是你要的关键字，再次回车，编辑器会根据上下文推断这里需要做什么 —— 跟第一次不一样，输入 `summarize` 然后回车的话，不会真的换一行，而是空格，然后你又可以继续输入任何字符了。

![](../images/Pasted%20image%2020230105110850.png)

本例中当我们在 `summarize` 后面输入（或选择）了 `count()` 后，它会自动推断相关的语法，因为要做统计的话，下一步就是要指定按什么进行分类了，所以这里出现的第一个候选关键是 `by` , 选择 `by` 然后继续回车，输入 State (其实也只是需要输入 `st` 这样的前缀就可以选择回车），然后按下 `Shift + Enter` 即可执行查询。

![](../images/Pasted%20image%2020230105111350.png)

这个过程虽然在这里看起来还挺繁琐的，但其实只要你写过一两次，上述的过程几乎是一气呵成，完全是一种全新的体验。

在查询编辑器中，你可以编写一个或者多个查询，只要你用空行隔开他们即可。

![](../images/Pasted%20image%2020230105112909.png)

另外，如果你写了很多查询，你可能想快速对他们进行一次格式化，这时候你可以通过按下 `Alt + Shift + F` 这个快捷键或者右键菜单中 选择 `Format Document` 来实现。例如我比较喜欢将字段列表换行处理，要达到下图的效果，你至少需要在 `project` 后面先手工地换一行，然后按下 `Alt + Shift + F` 来自动格式化。

![](../images/Pasted%20image%2020230105115707.png)

一个好习惯是在查询中编写适当的注释信息，注释都是以两个斜线开始的，这个跟很多编程语言类似（例如 `C#` ），你可以手工输入这两个斜线，也可以通过 `Ctrl + / ` 来快捷输入。

![](../images/Pasted%20image%2020230105115942.png)

最后，查询编辑器的所有内容可以保存为一个 `kql` 文件，然后你也可以随时通过打开一个 `kql` 文件来还原并执行查询。

![](../images/Pasted%20image%2020230105120308.png)

### 执行查询 （Run 和 Recall）

关于编写查询的更多细节，我会在第二章详细介绍，接下来我们研究一下如何高效地执行查询。

```
StormEvents
| summarize count = count() by month= monthofyear(StartTime)
| order by month asc
```

要快速执行这个查询，我最喜欢的方式就是用快捷键 （Shift + Enter）。请注意，这个编辑器是很智能的，当你把鼠标放在这三行代码中的任意一行，它就能自动高亮整个查询，此时你按下快捷键，即可完成执行。

>📣 你需要用空行隔开不同的查询。

![](../images/Pasted%20image%2020230104223044.png)

当然，你也可以鼠标点击 “Run” 这个按钮，这个按钮的快捷方式就是 “Shift +Enter”。

当一个查询被至少执行过一次后，它的数据其实是被缓存起来的。此时，如果你要再次执行该查询，但又不想让它重新读取数据并且运算的话，可以点击 "Recall" 这个按钮，或者按下 F8 这个快捷键。你会注意到在返回的结果窗格上面显示为 Cached（缓存的）。

![](../images/Pasted%20image%2020230104223534.png)

接下来，我们认真看一下这个查询结果窗格。

### 查询结果窗格

默认情况下所有的查询都是以表格形式返回数据。

>📣 一个查询也可以返回多个结果集，会以选项卡的形式显示。

![](../images/Pasted%20image%2020230104223819.png)

选中表格的行和列，可以快速查看针对这些单元格的统计信息，如下图右下方的红色框部分。

![](../images/Pasted%20image%2020230104224220.png)

而如果右键单击，这里还提供了丰富的快捷菜单。

![](../images/Pasted%20image%2020230104224306.png)

前面四个菜单都是复制数据。值得一提的是 Copy as HTML，一般用来复制粘贴到Word中，它会用一种非常完美的格式展现表格结果。

![](../images/Pasted%20image%2020230104224537.png)

而 Copy as datatable  则会把当前数据生成一个可以用来后续查询的语句。本例而言，如果你复制后，直接粘贴到查询窗口的空白处，这个语句大致是下面这样的。

```
datatable (month: long, ['count']: long) [
    long(1),long(3344),
    long(2),long(4772),
    long(3),long(4354),
    long(4),long(6289),
    long(5),long(5884),
    long(6),long(8675),
    long(7),long(6105),
    long(8),long(7740),
    long(9),long(2467),
    long(10),long(2633),
    long(11),long(1505),
    long(12),long(5298)
]
```

> 这里生成的查询，并不见得是最好的。例如上面的这两个字段类型，其实不需要用 long，用 int 就可以了。但这些属于小节，大部分时候也可以不关心。

在 “Explorer results” 菜单中有一个子菜单是 “Color by value" ，它会对结果集进行着色。

![](../images/Pasted%20image%2020230104225223.png)

而 Add selection as filter 则会自动根据当前你选中的数值，在你现有的查询中追加一个（或多个）筛选条件。

![](../images/Pasted%20image%2020230104225431.png)

而如果你想要在结果集中进行直接的搜索（可以是全文检索），你可以按下 Ctrl + Shift +F 这个快捷键，或者点击查询结果窗口顶部工具栏中的 ”Search“ 按钮，然后在搜索框中输入你要检索的内容，而按 Esc 键可以退出搜索模式。

![](../images/Pasted%20image%2020230104225633.png)

点击结果集中某个列的标题，可以直接对该列进行排序（升序和降序切换）。而点击列标最右侧的三条横线，在下拉菜单中还可以进行更多的操作，例如固定这个列，按照这个列分组，排序，着色等。这里就不一一演示了。

![](../images/Pasted%20image%2020230104225920.png)

而如果你展开在查询结果窗格最右侧的 ”Columns“ 面板，你可以很容易地决定哪些列要显示，哪些不要，甚至你可以快速构建一个透视表，如下图所示。

![](../images/Pasted%20image%2020230104230325.png)

最后，在查询结果窗格还会有一个对当前查询的统计（Stats）信息，主要包含了当前查询所消耗的资源，执行的时间，返回的数据统计，还有缓存命中等信息。

![](../images/Pasted%20image%2020230104224001.png)

### 分享查询

如果你写了一个很好的查询，想要分享给同事，ADX Web UI 提供了多种有意思的方式。

![](../images/Pasted%20image%2020230104230837.png)

#### 分享链接

通过点击上图中的 ”Link to clipboard“ 或者按下快捷键 Alt + Shift + L ，可以得到当前查询的一个链接，点击它之后在浏览器中就能够还原这个查询，并且立即执行。

https://dataexplorer.azure.com/clusters/help/databases/Samples?query=H4sIAAAAAAAAAwsuyS/KdS1LzSsp5uWqUSgoys9KTS5RCC5JLEnVAYuHVBak6iiAmZ4pIDUlidmpCoYGBgCJY29SOwAAAA==

#### 分享链接和查询

通过点击上图中的 ”Link, query to clipboard“ ，可以得到当前查询的可执行链接，并且同时还显示了查询语句。

```
Execute in [[Web](https://dataexplorer.azure.com/clusters/help/databases/Samples?query=H4sIAAAAAAAAAwsuyS/KdS1LzSsp5uWqUSgoys9KTS5RCC5JLEnVAYuHVBak6iiAmZ4pIDUlidmpCoYGBgCJY29SOwAAAA==)] [[Desktop](https://help.kusto.windows.net/Samples?query=H4sIAAAAAAAAAwsuyS/KdS1LzSsp5uWqUSgoys9KTS5RCC5JLEnVAYuHVBak6iiAmZ4pIDUlidmpCoYGBgCJY29SOwAAAA==&web=0)] [[cluster('help.kusto.windows.net').database('Samples')](https://dataexplorer.azure.com/clusters/help/databases/Samples)]

StormEvents
| project State,EventType, EventId
| take 100
```

这个一般经常用来粘贴到邮件中或Word文档中，效果很好。

![](../images/Pasted%20image%2020230104231347.png)

#### 分享链接，查询和结果集

这就更进一步了，连结果都包含了，用来做报告文档太合适了。

![](../images/Pasted%20image%2020230104231519.png)



### 个人设置

ADX Web UI 允许用户进行个性化设置，通过点击顶部工具栏的 ”Settings“ 按钮来实现。

![](../images/Pasted%20image%2020230104231612.png)

#### 时区设置

这里的 Time zone设置将决定结果集中对日期和时间字段的显示效果。 

在Kusto中，所有的日子都会被视作 UTC 时间，但是如果你想在返回的结果集中，以不同的时区来查看数据，例如用中国时间（UTC +8 ) ，这样对于中国用户就更加直观一些，那么你可以调整这个设置为 Asia/Shanghai。

> 📣 请注意，这里没有 Asia/Beijing 哦。这个时区的列表是跟 IANA （互联网号码分配局：Internet Assigned Number Authority）公示的信息一致的，详情请参考 https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/timezone 或 IANA 的官网 https://www.iana.org/time-zones 。

我们可以通过下面这个查询来比较一下时区设置的影响。

```
StormEvents
| summarize count() by bin( StartTime, 8h)
| render timechart
```

首先我们看一下在UTC 的情况下的显示效果，请注意我特意挑选了一个峰值进行比较，目前看到的是信息是 5月1日零点，星期四的统计值，数量是 531。

![](../images/Pasted%20image%2020230105103206.png)

然后，我们将时区切换为 Asia/Shanghai 的话。你会发现图表整体的趋势和数据其实都是一模一样的，只不过所有的数据都往后移动了8个小时而已，因为 Asia/Shanghai 代表了 UTC+8 这个时区。

![](../images/Pasted%20image%2020230105103445.png)


#### 环境设置

另外，你可以导出当前环境的设置（例如群集连接，查询，以及个性化设置），然后在另外一台电脑进行导入，就可以快速恢复，立即开展工作了。

> 📣 根据此前给我产品组的反馈，他们正在改进这个功能，以后只要登录同一个账号的话，这些环境设置也可以自动地同步，甚至都不需要手工的导出和导入了。

其他一些设置，这里就不赘述了，有兴趣的大家可以自行尝试。

## Kusto.Explorer  一览

本章的最后介绍一下 Kusto.Explorer 这个客户端工具。在没有ADX 之前，那可是唯一的工具呢。

你可以通过  https://aka.ms/ke 安装这个工具，请注意由于它的安装文件托管在 azureedge.net，这个地址在中国访问有些慢，而这个安装程序又比较大，所以你可能需要多一点耐心。

![](../images/Pasted%20image%2020230101170647.png)

这个工具的功能比 ADX Web UI 更多一些，也有一些专属功能。例如支持多种不同环境的Kusto群集（包括中国区特有的群集）、和多种身份验证方式、更加丰富的数据导出选项、几个特殊的图表（[[第三章 - 数据可视化]] 这一章会介绍），另外就是它支持一个很特殊的快捷键， `Ctrl + Enter` 它的作用是另起一行，同时插入管道符（ | ）。如果你需要编写比较长的查询，这个很有用。


但为了方便起见，本书还是主要以 ADX Web UI 来演示，所以不准备对 Kusto.Explorer 的细节做过多展开。有兴趣可以参考 https://learn.microsoft.com/en-us/azure/data-explorer/kusto/tools/kusto-explorer-using 。 

![](../images/Pasted%20image%2020230104232543.png)
