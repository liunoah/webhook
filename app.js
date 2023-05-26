const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');

class WebhookHandler {
  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3002;
    this.app.use(express.json());
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
      console.log('start clone', this.body.name);
      // shellScript = `git clone ${this.body.url} ./repo/${this.body.name}`;
      // 跳过 yes or no
      shellScript = `GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no"  git clone ${this.body.url} ./repo/${this.body.name}`;

    } else {
      console.log('start pull', this.body.name);
      // git -C ./repo/noahblog pull
      shellScript = `git -C ./repo/${this.body.name} pull`;
    }

    await this.runShell(shellScript);
    //run build.sh
    const buildShell = `sh ./repo/${this.body.name}/build.sh`;
    try {
      await this.runShell(buildShell);
    } catch (e) {
      console.log(e);
    }



    // console.log('start build image', this.body.name);
    // const dockerBuild = `docker build -t ${this.body.name} ./repo/${this.body.name}`
    // await this.runShell(dockerBuild);


    //stop docker container
    // console.log('start stop container', this.body.name);
    // const dockerStop = `docker stop ${this.body.name}`
    // await this.runShell(dockerStop);
    // //remove docker container
    // console.log('start remove container', this.body.name);
    // const dockerRemove = `docker rm ${this.body.name}`
    // await this.runShell(dockerRemove);
    // //run docker container
    // console.log('start run image', this.body.name);
    // const dockerRun = `docker run -d -p 3008:3008 --name  ${this.body.name} ${this.body.name}`
    // await this.runShell(dockerRun);
  }


  processPayload(payload) {

    console.log('start process', payload.repository.name);
    //将this.body.name的字符切换为小写
    this.body.name = payload.repository.name.toLowerCase();
    this.body.url = payload.repository.ssh_url;
    try {
      this.cloneOrPull();
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