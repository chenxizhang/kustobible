# 第六章：自动化

> 作者：陈希章，2023年1月 于上海 
> 专栏：**大数据分析新玩法之Kusto宝典** 第一季：一元初始
> 反馈：[ares@xizhang.com](mailto:ares@xizhang.com)


这一季的最后一篇，我们将来聊一下自动化的部分。鉴于这一季的目标是，让所有用户都能完成练习，即便你没有收费版 Azure Data Explorer 的订阅，所以这里涉及到的自动化方案也会有所挑选，将主要包含如下三种：

1. 使用命令行工具结合任务计划来自动化。
2. 使用PowerShell编写自定义代码来自动化。
3. 在PowerAutomate 中实现自动化。（需要有Microsoft 365订阅即可）。

## 使用命令行工具结合任务计划来自动化

此前我们提到了，Kusto 有网页版的查询编辑器，也有客户端版本的可视化编辑器，甚至还有一个命令行工具。

### 下载安装命令行工具

这个命令行工具可以通过 <https://www.nuget.org/packages/Microsoft.Azure.Kusto.Tools/> 下载到。它其实不是一个独立的工具，而是作为 `Microsoft.Azure.Kusto.Tools` 这个SDK包 的一部分。

![](../images/Pasted%20image%2020230102151111.png)

点击上图中的 “**Download package**” 并完成下载后，你会得到一个 `.nupkg` 文件，下一步是需要将其解压缩。如果你使用的是Windows系统，你可以将其后缀名改为 `.zip` , 然后选中该文件，在系统自带的右键菜单中选择解压缩即可。

![](../images/Pasted%20image%2020230102152803.png)

在解压缩得到的目录中，有一个 **tools** 的子目录

![](../images/Pasted%20image%2020230102153115.png)

由于历史原因，这里有好多个版本的SDK，如何确定你应该用哪个版本呢？这个小问题可能有时候很挺麻烦，因为你得知道你当前电脑上面安装了哪个版本的.NET Framework（或其运行时 Runtime），这可不是容易的事情。

-   PowerShell 7.3 - Built on .NET 7.0
-   PowerShell 7.2 (LTS-current) - Built on .NET 6.0 (LTS-current)
-   PowerShell 7.1 - Built on .NET 5.0
-   PowerShell 7.0 (LTS) - Built on .NET Core 3.1 (LTS)
-   PowerShell 6.2 - Built on .NET Core 2.1
-   PowerShell 6.1 - Built on .NET Core 2.1
-   PowerShell 6.0 - Built on .NET Core 2.0
-   PowerShell 5.1 - Built on .NET Framework 4.7.2 

鉴于从 `Windows 10` 后面的版本都已经默认安装了 PowerShell 5.1 这个版本，所以最简单的做法就是复制 `net472` 里面的文件即可。我一般会将其复制到一个更加容易访问到的目录，例如 `c:\tools\kusto`中。

![](../images/Pasted%20image%2020230102153723.png)

这样就完成了下载和 “安装” 的过程，上图中的 `Kusto.cli.exe` 就是我们需要的命令行工具。

### 命令行工具的基本用法

你可以通过 `c:\tools\kusto\kusto.cli.exe` 这样的路径来访问命令行工具，但我更喜欢为它定义一个别名，或者叫快捷方式，你可以在 Powershell 窗口中执行下面的命令。

```powershell
'New-Alias kusto "C:\tools\kusto\Kusto.Cli.exe"' | Out-File -Append $profile -Encoding utf8;. $profile
```

#### 解释器模式 

接下来就可以直接输入 `kusto` 这个命令来启动命令行工具了， 通过输入 `#help` 可以获取这个命令行支持的所有操作列表。

![](../images/Pasted%20image%2020230102155022.png)

接下来可以试着连接到范例数据库，并且执行查询或命令

`#connect "https://help.kusto.windows.net/Samples;Fed=true"`

第一次执行这条命令的话，会弹出一个身份认证的对话框，你需要输入一个Microsoft 个人账号或工作账号来完成认证。

`StormEvents | project StartTime, EndTime, State, EventType | take 10`

执行这个查询，将会得到来自于 StormEvents 这个表中的10行数据，并且只返回四个字段。

![](../images/Pasted%20image%2020230102155431.png)

这里除了执行查询，也可以执行控制命令，例如 `.show database` 等命令。

> 请注意，控制命令不是这一季的重点，虽然为了保证课程连续性，偶尔会直接用这些命令，但我们不会专门且深入地讲解。如果你有兴趣，可以先自行参考 <https://learn.microsoft.com/en-us/azure/data-explorer/kusto/management/> 的介绍，或者关注下一季的内容。

![](../images/Pasted%20image%2020230102160548.png)

在这个命令行窗口，还有两个命令我经常用到，它们就是 `q` 和 `#cls` ， 前者用来退出当前命令行，后者用来清屏。

除了在屏幕上查看之外，你还可以将查询结果保存到本地，请参考下面的查询。

```
#save top10.csv
StormEvents | project StartTime, EndTime, State, EventType | take 10
```

第一句命令是告知命令行工具，下一个查询的结果要保存到某个文件，然后第二个查询的结果就不显示在屏幕上，而是直接写入到文件了。

![](../images/Pasted%20image%2020230102161239.png)

用Excel打开这个文件，就可以看到如下的结果。

![](../images/Pasted%20image%2020230102161320.png)

你还可以将查询结果保存到剪贴板，而不是文件，这就需要用到 `#clip` 这个指令了。

#### 执行模式

以上的执行模式称为 ”解释器模式“， 就是你一次一次地输入命令，然后工具一行一行地给你解释并执行，返回结果等。一旦熟悉后，你就可以用更加强大的 ”执行模式” 一次执行多个指令了。

`kusto "https://help.kusto.windows.net/samples;fed=true" -execute:"#save top10.csv" -execute:"StormEvents | take 10"` 

上面范例中的 execute 参数是可以多次输入的，其实就相当于依次输入了多个指令，然后命令行一次帮你执行。

> -execute  还可以简写为 -e 

#### 脚本模式

熟悉了以上玩法，你还可以将你常用的命令组合起来，先写到一个文本文件中，然后批量执行，例如下面这个查询，就模拟了多个查询语句。

```txt
#save top10States.csv
StormEvents | summarize count() by State | top 10 by count_

#save top10Eventtypes.csv
StormEvents | summarize count() by EventType | top 10 by count_
```

而要执行这个脚本文件，只需要用一句命令即可。

`kusto "https://help.kusto.windows.net/samples;fed=true" -script:"C:\tools\query.txt"`

![](../images/Pasted%20image%2020230102162657.png)

`-scirpt` 这个参数会把脚本文件中每一行当作一个指令执行，但如果你的脚本本身就是多行的，你希望它把多行的指令当作一个指令执行，这就需要用到 `-scriptml` 这个参数了，下面是另外一个范例。

```
.set-or-append async StormEvents <|
    cluster('help').database('Samples').StormEvents
    | project
        StartTime,
        EventId,
        EndTime,
        State,
        EventType
```

上面的脚本是想当前的数据库中 StormEvents 表插入数据，如果该表不存在，则创建它。请注意，你需要将这个命令在你自己的免费群集中执行，因为默认的 `help` 群集，我们都没有权限插入数据。

`kusto "https://kvca2vj00hnuj8btx0kwy7.australiaeast.kusto.windows.net/default;fed=true" -scriptml:"ml.txt"`

![](../images/Pasted%20image%2020230102165822.png)

#### 通过任务计划自动化

我相信通过上面的例子，你已经对命令行工具及其三种模式（解释器模式，执行模式，脚本模式）都有了一定的了解，这一节的最后我们来结合Windows自带的任务计划来实现自动化。假设我们的任务是，每天晚上的8点，执行一次上次演示过的数据导入工作。

你可以通过下面几行 Powershell 命令来创建这个计划任务。 请注意，一个任务（Task） 中可以执行好多个操作（Action）， 所以合理使用的话，下面这样的工具可以编排出非常复杂的任务。

```powershell
$action = New-ScheduledTaskAction -Execute "c:\tools\kusto\kusto.cli.exe" -Argument '"https://kvca2vj00hnuj8btx0kwy7.australiaeast.kusto.windows.net/default;fed=true" -scriptml:"ml.txt"' -WorkingDirectory "c:\users\chenxizhang"

$trigger = New-ScheduledTaskTrigger -Daily -At "20:00:00"

$task = New-ScheduledTask -Action $action -Trigger $trigger

Register-ScheduledTask ImportDataEveryday -InputObject $task
```

创建成功后，可以通过输入 `taskschd.msc` ，然后在根目录下面找到这个计划任务。

![](../images/Pasted%20image%2020230102173919.png)

## 使用PowerShell 编写自定义代码来自动化

其实我们在第一节（通过命令行来实现自动化）之中，已经大量地使用了 PowerShell，但这一节要展示的是更加高级一点的做法，就是编写自己的一个PowerShell 命令来实现定制化的任务。

事情还是要从命令行工具这里的源头说起。`Kusto.cli.exe` 其实就是一个基于.NET Framework编写好的应用程序，而它依赖的一个最关键的组件就是 `Kusto.data.dll`。

![](../images/Pasted%20image%2020230102175823.png)

所以，如果我们想要自己实现特定的逻辑，完全可以直接调用 `Kusto.data.dll` 这个组件，Powershell拥有这个天生的优势，因为它可以直接加载 .NET 组件。

```powershell
function Run-KustoQuery {
    [CmdletBinding()]
    param (
        [Parameter(ValueFromPipeline = $true, Mandatory = $true)]
        [string[]]$date,
        [string]$scriptfile,
        [string]$outputfolder
    )

    BEGIN {
        $packagesRoot = "C:\tools\kusto"
        [System.Reflection.Assembly]::LoadFrom("$packagesRoot\Kusto.Data.dll") 
        $clusterUrl = "https://help.kusto.windows.net;Fed=true"
        $databaseName = "Samples"
        $kcsb = New-Object Kusto.Data.KustoConnectionStringBuilder `
	        ($clusterUrl, $databaseName)
        $queryProvider = [Kusto.Data.Net.Client.KustoClientFactory]::CreateCslQueryProvider($kcsb)
        $crp = New-Object Kusto.Data.Common.ClientRequestProperties
        $crp.ClientRequestId = "MyPowershellScript.ExecuteQuery." + [Guid]::NewGuid().ToString()
        $crp.SetOption([Kusto.Data.Common.ClientRequestProperties]::OptionServerTimeout, [TimeSpan]::FromSeconds(90))
    }

    PROCESS {
        foreach ($d in $date) {
            $query = (Get-Content $scriptfile -Raw).Replace("_date_", $d)
            $reader = $queryProvider.ExecuteQuery($query, $crp)
            $dataTable = [Kusto.Cloud.Platform.Data.ExtendedDataReader]::ToDataSet($reader).Tables[0]
            $dataView = New-Object System.Data.DataView($dataTable)
            $dataView | Export-Csv "$outputfolder\\$d.csv" `
	            -NoTypeInformation -Encoding utf8
        }

    }
    END {}

}
```

这段代码定义了一个PowerShell 的函数命令（Cmdlet），它接受三个参数， 首先是一组日期，然后是一个脚本文件（查询），以及输出文件。它会连接到 `help` 这个群集的 `samples` 数据库，然后循环这些日期，替换掉脚本文件中的日期占位符，然后依次执行，最后输出到对应的目录中去。

将上述代码复制到 PowerShell 窗口，然后运行如下的命令：`Run-KustoQuery -date "2007-1-1" -scriptfile .\getdata.txt -outputfolder c:\temp`

![](../images/Pasted%20image%2020230102182140.png)

如果给 date 参数输入多个值，则会生成多个 csv 文件。

![](../images/Pasted%20image%2020230102182327.png)

结合PowerShell的编程能力，理论上你可以设计出任意复杂的自动化任务来。

#### 计划任务

你还可以将这个Powershell 命令的脚本组织成一个独立的脚本文件，然后同样通过计划任务的方式来执行这个脚本。

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-file getdata.ps1" -WorkingDirectory "c:\users\chenxizhang"

$trigger = New-ScheduledTaskTrigger -Daily -At "20:00:00"
$task = New-ScheduledTask -Action $action -Trigger $trigger
Register-ScheduledTask ImportDataByPowerShell -InputObject $task
```

## 使用Power Automate 进行自动化


上面我们讲解了两种自动化的方式，他们的共同特点都是在本地计算机运行，缺点是如果真想自动化，你的电脑就得一直开着。而如果你拥有Microsoft 365的账号，那么就可以实现更加自由的自动化了。

这个解决方案就是 Power Automate，它可以实现云端的自动化，并且不需要编写代码。

![](../images/Pasted%20image%2020230102183559.png)

点击 “创建”，选择 “计划的云端流”

![](../images/Pasted%20image%2020230102184338.png)

搜索 “Kusto” 或者 “Azure Data Explorer”，可以看到有如下可用的操作

![](../images/Pasted%20image%2020230102184901.png)

本例中，我们选择 “运行异步控制命令” 这个操作，并且进行如下的设置。请注意，这里的群集URL，需要设置为你自己的免费群集地址。

![](../images/Pasted%20image%2020230102185232.png)

点击 “保存” 即可，这个流程将自动在晚上八点执行。

![](../images/Pasted%20image%2020230102190019.png)

如果你想在自动化流程中查询数据，然后保存为 csv 文件，然后发送邮件给某人，可以按照下面这样的方式设计即可。这里的关键一步就是根据查询结果生成CSV表格，有现成的操作可用。

![](../images/Pasted%20image%2020230102190708.png)

最后， 利用 PowerAutomate 提供的内置组件，你甚至可以运行查询，呈现一个图表，最后把这个图表还可以通过其他方式发送给自己或其他人。

![](../images/Pasted%20image%2020230103111324.png)

第一次组件会返回图片的内容，然后我用了一个变量，来生成一个可以在邮件中展示的图片的dataUri，它的公式定义大致是下面这样的：

`concat('data:image/png;base64,',outputs('运行_KQL_查询并呈现图表')?['body/attachmentContent'])`

然后，在邮件正文中，定义了一个图片的标签。注意，这里一定要切换到 html 模式。

`<img src='@{variables('imageurl')}' /><br>`

与此同时，我还将这个图片作为附件插入到了邮件中，这样一顿操作后，我在后续收到邮件中就看到如下的效果了。

![](../images/Pasted%20image%2020230103111656.png)