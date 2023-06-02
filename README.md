# WEBHOOK
自动拉取代码,自动build,node版本使用16.20.0
## 运行准备
生成服务器密钥
```shell
ssh-keygen
```
将服务器密钥拷贝至GitHub 密钥在 /root/.ssh/id_rsa.pub
## 如何运行
```
npm i
npm start
```
此时你就可以在push代码时,服务器自动拉取代码,自动部署,前提你的build.sh 可以正常部署
