const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs'); 

// 执行 shell 命令
async function runShell(command) {
   // 捕获代码异常
   try {
    console.log('run shell', command);
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`执行出错: ${error}`);
          reject(error);
          return;
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      });
    });
  } catch (e) {
    console.log(e);
  }
}

// 克隆或者拉取代码
async function cloneOrPull(body){
  let shellScript;
  if (!fs.existsSync(`./repo/${body.name}`)) {
    console.log('start clone', body.name);
    // shellScript = `git clone ${body.url} ./repo/${body.name}`;
    // 跳过 yes or no
    shellScript = `GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no"  git clone ${body.url} ./repo/${body.name}`;

  } else {
    console.log('start pull', body.name);
    // git -C ./repo/noahblog pull
    shellScript = `git -C ./repo/${body.name} pull`;
  }
  await runShell(shellScript);

  // 执行构建脚本
  const buildShell = `sudo sh ./repo/${body.name}/build.sh`;
  try {
    await runShell(buildShell);
  } catch (e) {
    console.log(e);
  }
  return;
}
// 队列
class Queue {
  constructor() {
      this.items = [];
      this.isProcessing = false;
  }

  enqueue(item) {
      this.items.push(item);
      if (!this.isProcessing) {
          this.isProcessing = true;
          this.processQueue();
      }
  }

  dequeue() {
      return this.items.shift();
  }

  isEmpty() {
      return this.items.length === 0;
  }

  async processQueue() {
      while (!this.isEmpty()) {
          const item = this.items[0];
          console.log(`处理任务：${JSON.stringify(item)}`);
          // 执行任务...
          await cloneOrPull(item);
          console.log(`任务处理完毕：${JSON.stringify(item)}`);
          this.dequeue();
      }
      this.isProcessing = false;
  }
}
class WebhookHandler {
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3002;
    this.app.use(express.json());
    this.queue = new Queue();
  }
  // 返回的 git clone url 和 repo name
  body = {
    name: "",
    url: "",
  }

  processPayload(payload) {

    console.log('add task queue', payload.repository.name);
    this.body.name = payload.repository.name
    this.body.url = payload.repository.ssh_url;
    try {
      this.queue.enqueue(this.body);
      
    }
    catch (e) {
      console.log(e);
    }
  }

  handlePostRequest(req, res) {
    const payload = req.body;
    res.status(200).send('OK');
    try {
      this.processPayload(payload);
    } catch (error) {
      console.log(error);
    }
  }

  start() {
    this.app.post('/webhook', (req, res) => this.handlePostRequest(req, res));
    this.app.listen(this.PORT, () => {
      console.log(`Listening on port ${this.PORT}`);
    });
  }
}

const handler = new WebhookHandler();
handler.start();