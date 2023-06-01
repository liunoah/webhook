const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const { Queue } = require('queue-typescript');

class WebhookHandler {
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3002;
    this.app.use(express.json());
    this.queue = new Queue();
    this.isProcessing = false;
  }

  body = {
    name: "",
    url: "",
  }

  async runShell(command) {
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

  async cloneOrPull() {
    let shellScript;
    if (!fs.existsSync(`./repo/${this.body.name}`)) {
      console.log('startclone', this.body.name);
      // shellScript = git clone ${this.body.url} ./repo/${this.body.name};
      // 跳过 yes or no
      shellScript = `GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no"  git clone ${this.body.url} ./repo/${this.body.name}`;
    } else {
      console.log('start pull', this.body.name);
      // git -C ./repo/noahblog pull
      shellScript = `git -C ./repo/${this.body.name} pull`;
    }
    await this.runShell(shellScript);

    const buildShell = `sudo sh ./repo/${this.body.name}/build.sh`;
    try {
      await this.runShell(buildShell);
    } catch (e) {
      console.log(e);
    }
  }

  async processQueue() {
    this.isProcessing = true;
    while (!this.queue.isEmpty()) {
      const payload = this.queue.dequeue();
      console.log(`start process ${payload.repository.name}`);
      this.body.name = payload.repository.name;
      this.body.url = payload.repository.ssh_url;
      try {
        await this.cloneOrPull();
      } catch (error) {
        console.log(error);
      }
    }
    this.isProcessing = false;
  }

  processPayload(payload) {
    this.queue.enqueue(payload);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  handlePostRequest(req, res){
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