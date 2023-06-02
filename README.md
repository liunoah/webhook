# WEBHOOK
自动拉取代码,自动build
## 使用步骤
生成服务器密钥
shell
Copy
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
这将在服务器上生成一个 RSA 密钥对，其中 your_email@example.com 应替换为您的电子邮件地址。在生成密钥对时，您可以选择使用默认设置，或者根据需要自定义设置。

将服务器公钥添加至 GitHub 或其他 Git 托管服务
将服务器上生成的公钥（默认位置为 ~/.ssh/id_rsa.pub）拷贝至您的 Git 托管服务中，以便该服务可以使用该密钥来验证您的 Webhook 请求。

将此代码部署至服务器，执行 npm i 安装依赖。

配置 Webhook

在 Git 托管服务中配置 Webhook，将 Webhook 的 Payload URL 设置为服务器的地址，并选择触发 Webhook 的事件（例如 push 事件）。

在服务器上运行此代码
可以使用以下命令在服务器上运行此代码：

shell
Copy
npm start
这将启动一个 HTTP 服务器，监听 Git 托管服务发送的 Webhook 请求。

当您在 Git 托管服务上提交代码时，服务将发送一个 Webhook 请求到您的服务器，并触发此代码中的相应事件处理程序。您可以在事件处理程序中执行自动拉取代码、自动构建等操作，以实现自动化部署。