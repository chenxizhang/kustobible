# 序：启发式和探索式的大数据分析工具

> 作者：陈希章  2023年1月2日 于上海 
> 反馈：[ares@xizhang.com](mailto:ares@xizhang.com)

这是一本电子书，作为献给自己的新年礼物，其实已经构思了很久，这一方面跟我多年的工作经历有关 —— 我的职业生涯中最为有意思的部分可能就是跟数据打交道。因为我认为数据是有生命力的，我对Excel如数家珍，对SQL Server Business Intelligence 和数据挖掘也略有研究，前几年很推崇Power BI 给我们带来的数据可视化变革和新型的DAX语言。另一方面，在近几年工作中，利用数据分析来辅助决策更是我工作的一部分，也颇有一些收获。这些工作和体验，总是会留下一些痕迹，或者激发一些思考。

接触Kusto是由于前几年在基于Azure平台做应用开发时，我了解到一个全新的服务叫 Application Insights (简称AI)，它可以很方便地收集一个应用程序的运行状况，例如成功和失败的请求，响应时间的规律等，并且用直观的图表进行展示。

![](images/Pasted%20image%2020230102090226.png)

当时我就很好奇，这是怎么做到的呢？如果我要自己进行一些特定的查询，以便了解更多信息，那么又该怎么做呢？从直觉上说，我断定这个服务的背后肯定会有一个数据库，而且我自认为对数据库是略有研究的，会不会是跟SQL Server 这类关系型数据库差不多的一个东西呢？

带着这样的疑问，我继续做了一些研究，发现这个Application Insights 确实是有一套类似于数据库的结构，例如一般都有如下的几个表格。

![](images/Pasted%20image%2020230102090629.png)

看起来很眼熟嘛，正当我要将压箱底的 T-SQL 神功拿出来一展身手时， 却意外地发现了一个宝藏—— Application Insights 自带了一套特殊的查询语法，我后来才知道这叫 Kusto Query Language (简称KQL)。

![](images/Pasted%20image%2020230102091035.png)

上图是一个简单的KQL 查询，它根据选定的Time range （在界面上设置了，没有写到查询中），查询 requests这个表，按照每10分钟一个窗口，统计一批查询的平均响应时间（duration），并且通过一个时间图表（timechart）展示出来。

```kql
requests
| summarize avgRequestDuration=avg(duration) by bin(timestamp, 10m) 
| render timechart
```

让我们再来看一下上面的查询，我感觉这种新的查询语言有如下的特点

1. **非常符合直觉**。例如，我们要查询 requests 这个表，那么就把它放在开始的位置，因为它是一切的起点。当然，从技术上说，这种设计带来的另外一个可能更大的好处是，它让在编辑器中提供智能感知成为可能。在编写 T-SQL 的查询时，你不会有这种智能感知的，因为它是用 `SELECT xxxxx FROM tableName` 这样的语法的，既然 `SELECT` 是在 `FROM` 之前的 （虽然真正执行时是反过来的），那么编辑器是很难推断字段列表并且给与智能感知的。
2. **面向业务的设计**。这个新的语言，力图尽量简化查询，让用户更加专注在业务分析上。从业务角度来说，用户在这个查询上最想做的事情就是对 duration 这个信息进行平均值计算，那么最关键就是 avg 这个函数，而 summarize 这个操作符（operator）则清晰地表达了语义（真的就相当于是标准的英语口语一样），至于 bin 这个函数（以及它专门为时间等类型字段提供的各种分组范式）则进一步化繁为简，你只要想一想在T-SQL中如何实现这种窗口查询就能明白它的先进性。
3. **管道式编程**。 请注意看以上查询中的 “|” 这个字符。这在很多编程（尤其是函数式）语言中都有，例如 `PowerShell` 。但我认为将管道（pipe）用到数据库查询中，其实是最为贴切的。数据，就是像水一样，流过来，流过去，不是吗？管道式的编程，让整个查询变得更加结构化，也带来了更大的扩展性。
4. **查询和展示一体化**。 严格意义上， `render` 这个操作符，并不属于KQL的一部分，它是可视化的范畴，而不是查询。事实上，它也只在特定的工具（例如Azure Data Explorer， 和 Kusto Explorer）中才能起作用，这不难理解。但这种看起来不那么严谨的嫁接，却再一次体现了从业务出发的实用主义。因为从用户的角度，他不管你怎么实现，他要的是快速从查询中得到想要的信息和见解，如果写一个查询，既能得到数据本身，也能通过图表看到更多的规律，那当然是极好的。我愿意把Kusto视为一个 `启发式、探索式的大数据分析平台和工具` 也是基于这个方面的考虑。


以上只是管中窥豹，Kusto 是什么呢？ 它其实最开始只是微软内部的一个项目，始于2014年左右吧。设计 Kusto 最开始的目的，一方面是想提供一种对大量日志文件（大部分是文本文件）进行快速搜索的机制，这就需要一套全新的存储和计算的架构和引擎。另外， Kusto 产品组的另外一个着眼点是改善数据查询的方式和体验，而这是以往经常被忽视的。
 
数据分析师（Data Analyst），或科学家（Data Scientist）们是被忽视的一部分人。他们绞尽脑汁做出的数据模型，熬夜爬出来并且忍着恶心清洗的数据，呕心沥血东拼西凑出来的那些似乎一眼望过去就能看出来很多价值的图表，如果能在老板们的高端会议上偶尔被提到一两句，那就应该要感恩涕零，泪下四条了。这跟大部分技术人员的命运类似，但如果连地球上几乎所有的开发人员都在用着先进的 `VSCode` 或 `Typescript`，动辄谈论着他们自己似乎也不太明白的 `DevOps` 或 `CI/CD` 时，抛开他们实际获得的与投入不成正比的赞许和回报不提，他们至少有些许自己的乐趣。从这个角度来说，现在是21世纪的第三个十年了，还要数据工程师们用着最原始的工具和很可能比他们都还老的查询语言，就有点惨无人道了。

另一方面，现在是一个人人都可以做分析师的时代，套用一句时髦的话，每个人都是自己数据的第一责任人。数据是应用的魂，不管大的平台和小的软件，它们真正的价值在于用户和用户的数据，而很多新的业务、新的平台也都是基于数据见解被创造出来。

这一点我深有体会，作为产品经理，我们会被要求在一开始构思时就定义产品需要的成功度量值（`Success Metric`），而为了达到目标，产品当然就需要设计一套机制来度量，这通常成为 遥测数据  （`Telemetry` ），这些遥测数据分为系统级别的（例如系统正常或失败的请求，错误信息，用户的地理位置和访问设备等），也有业务级别的（例如用户的访问流，停留时间，不同行为之间的关联等）。不要感到奇怪，任何产品都会有这样的数据收集的设计，唯一的区别在于它是否告知，以及它如何存储和管理这些数据，而这些会有相关的法律来约束。

所以，我想说的是，谁都应该掌握一些数据查询和分析的能力，这可能会解决你现有的工作中的难题，也可能为你带来新的职业机会和思考，或者至少跟我一样，感受到那点纯粹的快乐。

Kusto 这个名称在公开的文档中并不多，这个平台于 2018年的 `Microsoft Ignite` 会议上第一次展示，并且命名为 `Azure Data Explorer` ，它的[官方定义](https://learn.microsoft.com/en-us/azure/data-explorer/data-explorer-overview)如下。

> Azure Data Explorer is a fully managed, high-performance, big data analytics platform that makes it easy to analyze high volumes of data in near real time. The Azure Data Explorer toolbox gives you an end-to-end solution for data ingestion, query, visualization, and management.
> 
> By analyzing structured, semi-structured, and unstructured data across time series, and by using Machine Learning, Azure Data Explorer makes it simple to extract key insights, spot patterns and trends, and create forecasting models. Azure Data Explorer is scalable, secure, robust, and enterprise-ready, and is useful for log analytics, time series analytics, IoT, and general-purpose exploratory analytics.
> 
> Azure Data Explorer capabilities are extended by other services built on its powerful query language, including [Azure Monitor logs](https://learn.microsoft.com/en-us/azure/log-analytics/), [Application Insights](https://learn.microsoft.com/en-us/azure/application-insights/), [Time Series Insights](https://learn.microsoft.com/en-us/azure/time-series-insights/), and [Microsoft Defender for Endpoint](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/microsoft-defender-endpoint).

前面提到的 Application Insights 也升级换代，成为一个更加强大的 Azure 的产品线，叫做 `Log Analytics Workspace`， 不仅可以分析 Application Insights, 还包括 VM Insights,  Network Insights, Container Insights......  反正你能想到的，无论是自动产生的系统日志，还是自定义发送的事件或遥测数据，都可以分析，而其背后的英雄就是 Kusto 和 KQL 。

同样， Azure Data Explorer 是一个商业化的产品，所有人都能享受到微软这套已经成熟的创新成果，快速升级你的业务数据分析平台，它当然还可以跟其他现有的数据库平台（例如Azure SQL, Comsos DB ，My SQL ）和大数据分析工具结合使用（例如Spark， Databricks等），将大数据分析的难度进一步降低。

而作为 Kusto 的早期用户之一， 我仍然用这个名称来铭记它。